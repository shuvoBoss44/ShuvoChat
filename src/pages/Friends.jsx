import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { X, LogOut, Users } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";

const Friends = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [sendingRequestId, setSendingRequestId] = useState(null);
  const [cancelingRequestId, setCancelingRequestId] = useState(null);
  const [processingIncomingRequestId, setProcessingIncomingRequestId] =
    useState(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.fromLogin) {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, queryClient, navigate]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        "user/logout",
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
      setError(null);
      setSendingRequestId(null);
      setCancelingRequestId(null);
      setProcessingIncomingRequestId(null);
      axiosInstance.defaults.headers.common["Authorization"] = null;
      navigate("/login");
    },
    onError: err => {
      setError(err.response?.data?.message || "Failed to log out");
    },
  });

  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("user/friends");
        return response.data.friends;
      } catch (err) {
        throw new Error(
          err.response?.data?.message || "Failed to fetch friends"
        );
      }
    },
    onError: err => setError(err.message),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: outgoingRequests = [], isLoading: isLoadingOutgoingRequests } =
    useQuery({
      queryKey: ["outgoingRequests"],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get(
            "user/getOutgoingFriendRequests"
          );
          return response.data.outgoingRequests;
        } catch (err) {
          throw new Error(
            err.response?.data?.message || "Failed to fetch outgoing requests"
          );
        }
      },
      onError: err => setError(err.message),
      retry: 3,
      staleTime: 5 * 60 * 1000,
    });

  const { data: incomingRequests = [], isLoading: isLoadingIncomingRequests } =
    useQuery({
      queryKey: ["incomingRequests"],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get("user/friend-requests");
          return response.data.friendRequests;
        } catch (err) {
          throw new Error(
            err.response?.data?.message || "Failed to fetch incoming requests"
          );
        }
      },
      onError: err => setError(err.message),
      retry: 3,
      staleTime: 5 * 60 * 1000,
    });

  const { data: groupChats = [], isLoading: isLoadingGroupChats } = useQuery({
    queryKey: ["groupChats"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("chats/groups");
        return response.data.groups;
      } catch (err) {
        throw new Error(
          err.response?.data?.message || "Failed to fetch group chats"
        );
      }
    },
    onError: err => setError(err.message),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recommendedUsers = [], isLoading: isLoadingRecommended } =
    useQuery({
      queryKey: ["recommendedUsers"],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get("user/recommendations");
          if (!response.data.users) {
            throw new Error("No users found in response");
          }
          const currentFriendsIds = new Set(friends.map(f => f._id));
          const outgoingRecipientIds = new Set(
            outgoingRequests
              .filter(req => req.recipient?._id)
              .map(req => req.recipient._id)
          );
          const incomingSenderIds = new Set(
            incomingRequests.map(req => req.sender._id)
          );
          return response.data.users.filter(
            user =>
              !currentFriendsIds.has(user._id) &&
              !outgoingRecipientIds.has(user._id) &&
              !incomingSenderIds.has(user._id)
          );
        } catch (err) {
          throw new Error(
            err.response?.data?.message || "Failed to fetch recommended users"
          );
        }
      },
      enabled:
        !isLoadingFriends &&
        !isLoadingOutgoingRequests &&
        !isLoadingIncomingRequests,
      onError: err => setError(err.message),
      retry: 3,
      staleTime: 5 * 60 * 1000,
    });

  const pendingOutgoingRequestIds = new Set(
    outgoingRequests
      .filter(req => req.recipient?._id)
      .map(req => req.recipient._id)
  );

  const sendFriendRequestMutation = useMutation({
    mutationFn: async userId => {
      const response = await axiosInstance.post(
        `user/friend-request/${userId}`
      );
      return response.data;
    },
    onMutate: async newRecipientId => {
      setSendingRequestId(newRecipientId);
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["recommendedUsers"] });
      await queryClient.cancelQueries({ queryKey: ["outgoingRequests"] });
      const previousRecommendedUsers = queryClient.getQueryData([
        "recommendedUsers",
      ]);
      const previousOutgoingRequests = queryClient.getQueryData([
        "outgoingRequests",
      ]);
      queryClient.setQueryData(
        ["recommendedUsers"],
        oldData => oldData?.filter(user => user._id !== newRecipientId) || []
      );
      const requestedUser = previousRecommendedUsers?.find(
        user => user._id === newRecipientId
      );
      if (requestedUser) {
        queryClient.setQueryData(["outgoingRequests"], oldData => [
          ...oldData,
          {
            _id: `temp-${newRecipientId}`,
            recipient: requestedUser,
            status: "pending",
          },
        ]);
      }
      return { previousRecommendedUsers, previousOutgoingRequests };
    },
    onError: (err, newRecipientId, context) => {
      setError(err.response?.data?.message || "Failed to send friend request");
      queryClient.setQueryData(
        ["recommendedUsers"],
        context.previousRecommendedUsers
      );
      queryClient.setQueryData(
        ["outgoingRequests"],
        context.previousOutgoingRequests
      );
    },
    onSettled: () => {
      setSendingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: async requestId => {
      const response = await axiosInstance.delete(
        `user/cancel-friend-request/${requestId}`
      );
      return response.data;
    },
    onMutate: async requestIdToCancel => {
      setCancelingRequestId(requestIdToCancel);
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["outgoingRequests"] });
      await queryClient.cancelQueries({ queryKey: ["recommendedUsers"] });
      const previousOutgoingRequests = queryClient.getQueryData([
        "outgoingRequests",
      ]);
      const previousRecommendedUsers = queryClient.getQueryData([
        "recommendedUsers",
      ]);
      const cancelledRequest = previousOutgoingRequests?.find(
        req => req._id === requestIdToCancel
      );
      queryClient.setQueryData(
        ["outgoingRequests"],
        oldData => oldData?.filter(req => req._id !== requestIdToCancel) || []
      );
      if (
        cancelledRequest &&
        !previousRecommendedUsers?.some(
          user => user._id === cancelledRequest.recipient._id
        )
      ) {
        queryClient.setQueryData(["recommendedUsers"], oldData => [
          ...(oldData || []),
          cancelledRequest.recipient,
        ]);
      }
      return { previousOutgoingRequests, previousRecommendedUsers };
    },
    onError: (err, requestIdToCancel, context) => {
      setError(
        err.response?.data?.message || "Failed to cancel friend request"
      );
      queryClient.setQueryData(
        ["outgoingRequests"],
        context.previousOutgoingRequests
      );
      queryClient.setQueryData(
        ["recommendedUsers"],
        context.previousRecommendedUsers
      );
    },
    onSettled: () => {
      setCancelingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async requestId => {
      const response = await axiosInstance.post(
        `user/accept-friend-request/${requestId}`
      );
      return response.data;
    },
    onMutate: async requestIdToAccept => {
      setProcessingIncomingRequestId(requestIdToAccept);
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["incomingRequests"] });
      await queryClient.cancelQueries({ queryKey: ["friends"] });
      await queryClient.cancelQueries({ queryKey: ["recommendedUsers"] });
      const previousIncomingRequests = queryClient.getQueryData([
        "incomingRequests",
      ]);
      const previousFriends = queryClient.getQueryData(["friends"]);
      const previousRecommendedUsers = queryClient.getQueryData([
        "recommendedUsers",
      ]);
      const acceptedRequest = previousIncomingRequests?.find(
        req => req._id === requestIdToAccept
      );
      queryClient.setQueryData(
        ["incomingRequests"],
        oldData => oldData?.filter(req => req._id !== requestIdToAccept) || []
      );
      if (acceptedRequest) {
        queryClient.setQueryData(["friends"], oldData => [
          ...(oldData || []),
          acceptedRequest.sender,
        ]);
      }
      queryClient.setQueryData(
        ["recommendedUsers"],
        oldData =>
          oldData?.filter(user => user._id !== acceptedRequest?.sender._id) ||
          []
      );
      return {
        previousIncomingRequests,
        previousFriends,
        previousRecommendedUsers,
      };
    },
    onError: (err, requestIdToAccept, context) => {
      setError(
        err.response?.data?.message || "Failed to accept friend request"
      );
      queryClient.setQueryData(
        ["incomingRequests"],
        context.previousIncomingRequests
      );
      queryClient.setQueryData(["friends"], context.previousFriends);
      queryClient.setQueryData(
        ["recommendedUsers"],
        context.previousRecommendedUsers
      );
    },
    onSettled: () => {
      setProcessingIncomingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
  });

  const rejectFriendRequestMutation = useMutation({
    mutationFn: async requestId => {
      const response = await axiosInstance.delete(
        `user/reject-friend-request/${requestId}`
      );
      return response.data;
    },
    onMutate: async requestIdToReject => {
      setProcessingIncomingRequestId(requestIdToReject);
      setError(null);
      await queryClient.cancelQueries({ queryKey: ["incomingRequests"] });
      await queryClient.cancelQueries({ queryKey: ["recommendedUsers"] });
      const previousIncomingRequests = queryClient.getQueryData([
        "incomingRequests",
      ]);
      const previousRecommendedUsers = queryClient.getQueryData([
        "recommendedUsers",
      ]);
      const rejectedRequest = previousIncomingRequests?.find(
        req => req._id === requestIdToReject
      );
      queryClient.setQueryData(
        ["incomingRequests"],
        oldData => oldData?.filter(req => req._id !== requestIdToReject) || []
      );
      if (
        rejectedRequest &&
        !previousRecommendedUsers?.some(
          user => user._id === rejectedRequest.sender._id
        )
      ) {
        queryClient.setQueryData(["recommendedUsers"], oldData => [
          ...(oldData || []),
          rejectedRequest.sender,
        ]);
      }
      return { previousIncomingRequests, previousRecommendedUsers };
    },
    onError: (err, requestIdToReject, context) => {
      setError(
        err.response?.data?.message || "Failed to reject friend request"
      );
      queryClient.setQueryData(
        ["incomingRequests"],
        context.previousIncomingRequests
      );
      queryClient.setQueryData(
        ["recommendedUsers"],
        context.previousRecommendedUsers
      );
    },
    onSettled: () => {
      setProcessingIncomingRequestId(null);
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
  });

  const isLoading =
    isLoadingFriends ||
    isLoadingRecommended ||
    isLoadingOutgoingRequests ||
    isLoadingIncomingRequests ||
    isLoadingGroupChats;

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="alert alert-error mb-6 shadow-lg animate-fade-in">
            <span>{error}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-64 animate-fade-in">
            <span
              className="loading loading-spinner loading-md text-primary"
              aria-label="Loading data"
            ></span>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary">
                  Group Chats
                </h2>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsGroupModalOpen(true)}
                  aria-label="Create new group chat"
                >
                  <Users className="w-4 h-4" /> Create Group
                </button>
              </div>
              {groupChats.length === 0 ? (
                <p className="text-base-content/70">
                  You are not part of any group chats yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupChats.map(group => (
                    <div
                      key={group._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                          <img
                            src={group.image || "/default-group-avatar.png"}
                            alt={`${group.name}'s avatar`}
                            className="object-fill"
                          />
                        </div>
                      </div>
                      <div>
                        <div>{group.name}</div>
                        <Link
                          to={`/group-chat/${group._id}`}
                          className="btn btn-primary btn-sm mt-3"
                          aria-label={`Join group chat ${group.name}`}
                        >
                          Join Group
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Your Friends
              </h2>
              {friends.length === 0 ? (
                <p className="text-base-content/70">You have no friends yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map(friend => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                          <img
                            src={friend.profilePicture || "/default-avatar.png"}
                            alt={`${friend.fullName}'s avatar`}
                            className="object-fill"
                          />
                        </div>
                      </div>
                      <div>
                        <div>{friend.fullName}</div>
                        <Link
                          to={`/chat/${friend._id}`}
                          className="btn btn-primary btn-sm mt-3"
                          aria-label={`Send message to ${friend.fullName}`}
                        >
                          Send Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Incoming Friend Requests
              </h2>
              {incomingRequests.length === 0 ? (
                <p className="text-base-content/70">
                  No incoming friend requests.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incomingRequests.map(request => (
                    <div
                      key={request._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                          <img
                            src={
                              request.sender.profilePicture ||
                              "/default-avatar.png"
                            }
                            alt={`${request.sender.fullName}'s avatar`}
                            className="object-fill"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-base-content">
                          {request.sender.fullName}
                        </p>
                        <p className="text-xs text-base-content/70">
                          Wants to be friends
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-sm btn-ghost hover:bg-success/20"
                          onClick={() =>
                            acceptFriendRequestMutation.mutate(request._id)
                          }
                          disabled={processingIncomingRequestId === request._id}
                          aria-label={`Accept friend request from ${request.sender.fullName}`}
                        >
                          {processingIncomingRequestId === request._id ? (
                            <span
                              className="loading loading-spinner loading-xs text-white"
                              aria-label="Accepting request"
                            ></span>
                          ) : (
                            "Accept"
                          )}
                        </button>
                        <button
                          className="btn btn-error btn-sm btn-ghost hover:bg-error/20"
                          onClick={() =>
                            rejectFriendRequestMutation.mutate(request._id)
                          }
                          disabled={processingIncomingRequestId === request._id}
                          aria-label={`Reject friend request from ${request.sender.fullName}`}
                        >
                          {processingIncomingRequestId === request._id ? (
                            <span
                              className="loading loading-spinner loading-xs text-white"
                              aria-label="Rejecting request"
                            ></span>
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Outgoing Friend Requests
              </h2>
              {outgoingRequests.length === 0 ? (
                <p className="text-base-content/70">
                  No pending friend requests.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outgoingRequests.map(request => (
                    <div
                      key={request._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                          <img
                            src={
                              request.recipient?.profilePicture ||
                              "/default-avatar.png"
                            }
                            alt={`${
                              request.recipient?.fullName || "Unknown"
                            }'s avatar`}
                            className="object-fill"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-base-content">
                          {request.recipient?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-base-content/70">
                          Request pending
                        </p>
                      </div>
                      <button
                        className="btn btn-error btn-sm btn-ghost hover:bg-error/20"
                        onClick={() =>
                          cancelFriendRequestMutation.mutate(request._id)
                        }
                        disabled={cancelingRequestId === request._id}
                        aria-label={`Cancel friend request to ${
                          request.recipient?.fullName || "Unknown"
                        }`}
                      >
                        {cancelingRequestId === request._id ? (
                          <span
                            className="loading loading-spinner loading-xs text-white"
                            aria-label="Canceling request"
                          ></span>
                        ) : (
                          "Cancel Request"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 transition-transform hover:scale-[1.01]">
              <h2 className="text-xl font-semibold text-primary mb-4">
                Recommended Users
              </h2>
              {recommendedUsers.length === 0 ? (
                <p className="text-base-content/70">
                  No recommendations available.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedUsers.map(user => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                          <img
                            src={user.profilePicture || "/default-avatar.png"}
                            alt={`${user.fullName}'s avatar`}
                            className="object-fill"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-base-content">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-base-content/70">
                          Connect to chat
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm btn-ghost hover:bg-primary/20"
                        onClick={() =>
                          sendFriendRequestMutation.mutate(user._id)
                        }
                        disabled={
                          sendingRequestId === user._id ||
                          pendingOutgoingRequestIds.has(user._id)
                        }
                        aria-label={`Send friend request to ${user.fullName}`}
                      >
                        {sendingRequestId === user._id ? (
                          <span
                            className="loading loading-spinner loading-xs text-white"
                            aria-label="Sending request"
                          ></span>
                        ) : pendingOutgoingRequestIds.has(user._id) ? (
                          "Request Sent"
                        ) : (
                          "Add Friend"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        friends={friends}
      />
    </div>
  );
};

export default Friends;
