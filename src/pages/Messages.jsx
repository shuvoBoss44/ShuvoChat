import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { StreamChat } from "stream-chat";
import { Chat, ChannelList } from "stream-chat-react";
import useAuthUser from "../hooks/useAuthUser";
import ChatLoader from "../components/ChatLoader";
import toast from "react-hot-toast";
import { Users, PlusCircle, X, Search } from "lucide-react";
import useThemeStore from "../store/useThemeStore";
import ThemeSelector from "../components/ThemeSelector";

const Messages = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [chatClient, setChatClient] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
      if (!groupName.trim()) {
        throw new Error("Group name is required");
      }
      const channelId = `group-${Date.now()}-${authUser._id}`;
      const members = [authUser._id, ...selectedFriends];
      const channel = chatClient.channel("messaging", channelId, {
        members,
        name: groupName.trim(),
      });
      await channel.create();
      return channel;
    },
    onSuccess: channel => {
      toast.success("Group chat created!");
      setShowCreateGroup(false);
      setSelectedFriends([]);
      setGroupName("");
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

  const filters = {
    members: { $in: [authUser?._id] },
    ...(searchQuery && { name: { $autocomplete: searchQuery } }),
  };
  const sort = { last_message_at: -1 };

  if (isLoadingToken || isLoadingFriends || !chatClient) {
    return <ChatLoader />;
  }

  return (
    <div
      className="min-h-screen bg-base-100 p-4 sm:p-6 md:p-8 lg:p-10"
      data-theme={theme}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Messages
            </h1>
            <ThemeSelector />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input input-bordered w-full sm:w-64 pl-10 focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/70" />
            </div>
            <button
              className="btn btn-primary btn-sm flex items-center gap-2 hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
              onClick={() => setShowCreateGroup(true)}
              aria-label="Create new group chat"
            >
              <PlusCircle className="w-5 h-5" />
              New Group
            </button>
          </div>
        </div>

        {/* Group Chat Creation Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card bg-base-200 border border-base-300 shadow-2xl p-6 w-full max-w-lg animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Create Group Chat
                </h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setShowCreateGroup(false);
                    setGroupName("");
                    setSelectedFriends([]);
                  }}
                  aria-label="Close create group"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold text-primary">
                    Group Name
                  </span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                  placeholder="Enter group name"
                />
              </div>
              <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {friends.map(friend => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleFriendToggle(friend._id)}
                      className="checkbox checkbox-primary"
                    />
                    <div className="avatar">
                      <div className="w-10 rounded-full border border-primary/50">
                        <img
                          src={friend.profilePicture || "/default-avatar.png"}
                          alt={`${friend.fullName}'s avatar`}
                          onError={e => (e.target.src = "/default-avatar.png")}
                        />
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-base-content truncate">
                      {friend.fullName}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  className="btn btn-primary flex-1 hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
                  onClick={() => createGroupChatMutation.mutate()}
                  disabled={
                    createGroupChatMutation.isPending ||
                    selectedFriends.length < 2 ||
                    !groupName.trim()
                  }
                >
                  {createGroupChatMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Create Group"
                  )}
                </button>
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setShowCreateGroup(false);
                    setGroupName("");
                    setSelectedFriends([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Channel List */}
        <div className="card bg-base-200 border border-base-300 shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            Your Chats
          </h2>
          <Chat client={chatClient} theme={`messaging ${theme}`}>
            <ChannelList
              filters={filters}
              sort={sort}
              showChannelSearch={false}
              onChannelSelect={channel => navigate(`/chat/${channel.id}`)}
              Preview={props => (
                <div
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-base-300 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/chat/${props.channel.id}`)}
                >
                  <div className="avatar">
                    <div className="w-12 rounded-full border border-primary/50">
                      <img
                        src={
                          props.channel.data.image ||
                          props.channel.data.members?.find(
                            m => m.user_id !== authUser._id
                          )?.user?.image ||
                          "/default-avatar.png"
                        }
                        alt="Channel avatar"
                        onError={e => (e.target.src = "/default-avatar.png")}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-base-content truncate">
                        {props.channel.data.name || "Chat"}
                      </p>
                      {props.channel.state.unreadCount > 0 && (
                        <span className="badge badge-primary badge-sm">
                          {props.channel.state.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-base-content/70 truncate">
                      {props.channel.state.messages.slice(-1)[0]?.text ||
                        "No messages yet"}
                    </p>
                  </div>
                </div>
              )}
            />
          </Chat>
        </div>
      </div>
    </div>
  );
};

export default Messages;
