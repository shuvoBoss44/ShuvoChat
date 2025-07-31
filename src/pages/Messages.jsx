import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { StreamChat } from "stream-chat";
import { Chat, ChannelList } from "stream-chat-react";
import useAuthUser from "../hooks/useAuthUser";
import ChatLoader from "../components/ChatLoader";
import toast from "react-hot-toast";
import { UsersIcon, PlusCircle } from "lucide-react";

const Messages = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  // Fetch Stream token
  const { data: tokenData, isLoading: isLoadingToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data.token;
    },
    enabled: !!authUser,
  });

  // Fetch friends
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await axiosInstance.get("user/friends");
      return response.data.friends;
    },
    onError: err => toast.error(err.message || "Failed to fetch friends"),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize Stream Chat client
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
        setChatClient(client);
      } catch (error) {
        console.error("Error initializing Stream Chat client:", error);
        toast.error("Failed to initialize chat. Please try again later.");
      }
    };
    initChat();
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [authUser, tokenData, STREAM_API_KEY]);

  // Create group chat mutation
  const createGroupChatMutation = useMutation({
    mutationFn: async () => {
      if (selectedFriends.length < 2) {
        throw new Error("Select at least two friends for a group chat");
      }
      const channelId = `group-${Date.now()}-${authUser._id}`;
      const members = [authUser._id, ...selectedFriends.map(f => f._id)];
      const channel = chatClient.channel("messaging", channelId, {
        members,
        name: `${authUser.fullName}'s Group`,
      });
      await channel.create();
      return channel;
    },
    onSuccess: channel => {
      toast.success("Group chat created!");
      setShowCreateGroup(false);
      setSelectedFriends([]);
      navigate(`/chat/${channel.id}`);
    },
    onError: err => toast.error(err.message || "Failed to create group chat"),
  });

  const handleFriendToggle = friendId => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const filters = { members: { $in: [authUser?._id] } };
  const sort = { last_message_at: -1 };

  if (isLoadingToken || isLoadingFriends || !chatClient) {
    return <ChatLoader />;
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-primary">Messages</h1>
          <button
            className="btn btn-primary btn-sm flex items-center gap-2"
            onClick={() => setShowCreateGroup(true)}
          >
            <PlusCircle className="w-5 h-5" />
            New Group Chat
          </button>
        </div>

        {/* Friends List for Creating Group Chat */}
        {showCreateGroup && (
          <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Create Group Chat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {friends.map(friend => (
                <div
                  key={friend._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => handleFriendToggle(friend._id)}
                    className="checkbox checkbox-primary"
                  />
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={friend.profilePicture || "/default-avatar.png"}
                        alt={`${friend.fullName}'s avatar`}
                      />
                    </div>
                  </div>
                  <p className="font-semibold text-sm">{friend.fullName}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => createGroupChatMutation.mutate()}
                disabled={createGroupChatMutation.isPending}
              >
                {createGroupChatMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Create Group"
                )}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowCreateGroup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Channel List */}
        <Chat client={chatClient}>
          <ChannelList
            filters={filters}
            sort={sort}
            showChannelSearch
            onChannelSelect={channel => navigate(`/chat/${channel.id}`)}
          />
        </Chat>
      </div>
    </div>
  );
};

export default Messages;
