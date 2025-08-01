import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import toast from "react-hot-toast";

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      console.log("Call left, navigating to messages.");
      navigate("/friends");
    }
  }, [callingState, navigate]);

  if (
    callingState === CallingState.LEFT ||
    callingState === CallingState.DISCONNECTED
  ) {
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
  const [isConnecting, setIsConnecting] = useState(true);
  const { authUser, isLoading: isLoadingAuthUser } = useAuthUser();
  const navigate = useNavigate();
  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  const { data: tokenData, isLoading: isLoadingToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data.token;
    },
    enabled: !!authUser,
    staleTime: Infinity,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!authUser || !tokenData || !STREAM_API_KEY) {
        setIsConnecting(false);
        return;
      }

      setIsConnecting(true);

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
        await callInstance.join({ create: true });

        setClient(videoClient);
        setCall(callInstance);
        console.log("Stream Video client and call initialized.");
      } catch (error) {
        console.error("Error initializing call client:", error);
        toast.error("Failed to initialize call. Please try again later.");
        setClient(null);
        setCall(null);
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (client && client.isConnected) {
        console.log("Disconnecting Stream Video client on cleanup.");
        client.disconnectUser();
      }
      setClient(null);
      setCall(null);
    };
  }, [authUser, tokenData, STREAM_API_KEY, callId, navigate]);

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
          <button
            onClick={() => navigate("/friends")}
            className="btn btn-ghost mt-2"
          >
            Go to Messages
          </button>
        </div>
      )}
    </div>
  );
};

export default Call;
