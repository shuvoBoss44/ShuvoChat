import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ChatLoader from "../components/ChatLoader";
import {
  Channel,
  MessageList,
  MessageInput,
  Window,
  Thread,
  Chat,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import CustomChannelHeader from "../components/CustomChannelHeader";
import useThemeStore from "../store/useThemeStore";

const ChatPage = () => {
  const { id: channelId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data.token;
    },
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!authUser || !tokenData) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePicture,
          },
          tokenData
        );

        const currChannel = client.channel("messaging", channelId);
        await currChannel.watch();

        setChannel(currChannel);
        setChatClient(client);
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
        toast.error("Failed to initialize chat. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [authUser, tokenData, channelId, STREAM_API_KEY]);

  const handleVideoCall = () => {
    if (channel) {
      const callId = channel.id; // Use channel ID as call ID for consistency
      const callUrl = `${window.location.origin}/call/${callId}`;
      channel.sendMessage({
        text: `Group video call link: ${callUrl}`,
      });
      toast.success("Group call link sent!");
      window.open(callUrl, "_blank"); // Open call in new tab
    }
  };

  if (loading || !chatClient || !channel) {
    return <ChatLoader />;
  }

  return (
    <div className="h-[100vh]" data-theme={theme}>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader handleVideoCall={handleVideoCall} />
            <MessageList />
            <MessageInput focus={true} />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
