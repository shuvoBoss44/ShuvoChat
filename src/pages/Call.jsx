import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Use react-router-dom for navigate
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import ChatLoader from "../components/ChatLoader";
import toast from "react-hot-toast"; // Import toast for error messages

// Component to render within StreamCall, handles call state and navigation
const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate(); // Get navigate hook inside the component

  // Effect to navigate when the call state changes to LEFT
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      console.log("Call left, navigating to home.");
      navigate("/");
    }
  }, [callingState, navigate]);

  if (
    callingState === CallingState.LEFT ||
    callingState === CallingState.DISCONNECTED
  ) {
    // Optionally render a "Call Ended" message briefly before navigating
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-base-content">Call Ended</p>
      </div>
    );
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

const Call = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true); // Set to true initially
  const { authUser, isLoading: isLoadingAuthUser } = useAuthUser(); // Rename to avoid conflict
  const navigate = useNavigate(); // Use navigate here for any pre-call redirection

  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  const { data: tokenData, isLoading: isLoadingToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data.token;
    },
    enabled: !!authUser, // Only fetch token if authUser exists
    staleTime: Infinity, // Token should not become stale during a call
  });

  useEffect(() => {
    const initCall = async () => {
      if (!authUser || !tokenData || !STREAM_API_KEY) {
        // Not enough info to proceed, return early
        setIsConnecting(false); // Stop connecting if prerequisites are not met
        return;
      }

      setIsConnecting(true); // Indicate that we are starting to connect

      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePicture,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData,
        });

        const callInstance = videoClient.call("default", callId);

        // Ensure we try to join after call instance is created
        await callInstance.join({ create: true }); // 'create: true' ensures the call is created if it doesn't exist

        setClient(videoClient);
        setCall(callInstance);
        console.log("Stream Video client and call initialized.");
      } catch (error) {
        console.error("Error initializing call client:", error);
        toast.error("Failed to initialize call. Please try again later.");
        setClient(null); // Clear client/call state on error
        setCall(null);
        // Optionally navigate away on severe error
        // navigate("/");
      } finally {
        setIsConnecting(false); // Done connecting, whether successful or not
      }
    };

    // Call initCall when authUser or tokenData changes (i.e., becomes available)
    initCall();

    // Cleanup function: disconnect the client when the component unmounts
    return () => {
      if (client && client.isConnected) {
        console.log("Disconnecting Stream Video client on cleanup.");
        client.disconnectUser();
      }
      setClient(null);
      setCall(null);
    };
  }, [authUser, tokenData, STREAM_API_KEY, callId, navigate]); // Add callId and navigate to dependencies

  // Show loader while fetching auth user, token, or connecting to call
  if (isLoadingAuthUser || isLoadingToken || isConnecting) {
    return <ChatLoader />;
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-base-100">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-base-content">
          <p className="text-lg mb-4">
            Could not initialize call. Please refresh or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
          <button onClick={() => navigate("/")} className="btn btn-ghost mt-2">
            Go Home
          </button>
        </div>
      )}
    </div>
  );
};

export default Call;
