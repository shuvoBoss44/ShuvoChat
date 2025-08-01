import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const timeSince = date => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return `${Math.floor(seconds)} seconds ago`;
};

const Post = ({ post, authUser, likePostMutation, unlikePostMutation }) => {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState(null);

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", post._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/comments/${post._id}`);
      return response.data.comments || [];
    },
    enabled: showComments,
    onError: err => {
      console.error("Comments fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch comments");
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`/posts/comment/${post._id}`, {
        content: commentContent,
      });
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments", post._id] });
      const previousComments = queryClient.getQueryData(["comments", post._id]);
      queryClient.setQueryData(["comments", post._id], old => [
        ...(old || []),
        {
          _id: `temp-${Date.now()}`,
          user: {
            _id: authUser._id,
            fullName: authUser.fullName,
            profilePicture: authUser.profilePicture,
          },
          content: commentContent,
          createdAt: new Date(),
        },
      ]);
      return { previousComments };
    },
    onSuccess: () => {
      setCommentContent("");
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
    },
    onError: (err, _, context) => {
      console.error("Comment error:", err);
      setError(err.response?.data?.message || "Failed to add comment");
      queryClient.setQueryData(
        ["comments", post._id],
        context.previousComments
      );
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/posts/${post._id}`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["friendsPosts"] });
      await queryClient.cancelQueries({
        queryKey: ["userPosts", authUser._id],
      });
      const previousFriendsPosts = queryClient.getQueryData(["friendsPosts"]);
      const previousUserPosts = queryClient.getQueryData([
        "userPosts",
        authUser._id,
      ]);
      queryClient.setQueryData(
        ["friendsPosts"],
        old => old?.filter(p => p._id !== post._id) || []
      );
      queryClient.setQueryData(
        ["userPosts", authUser._id],
        old => old?.filter(p => p._id !== post._id) || []
      );
      return { previousFriendsPosts, previousUserPosts };
    },
    onSuccess: () => {
      toast.success("Post deleted");
    },
    onError: (err, _, context) => {
      console.error("Delete post error:", err);
      toast.error(err.response?.data?.message || "Failed to delete post");
      queryClient.setQueryData(["friendsPosts"], context.previousFriendsPosts);
      queryClient.setQueryData(
        ["userPosts", authUser._id],
        context.previousUserPosts
      );
    },
  });

  const handleLikeToggle = () => {
    const isLiked =
      post.likes?.some(like => like.user._id === authUser._id) || false;

    const updatePosts = (old, postId, addLike) => {
      return (
        old?.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: addLike
                  ? [
                      ...(p.likes || []),
                      {
                        user: {
                          _id: authUser._id,
                          fullName: authUser.fullName,
                        },
                      },
                    ]
                  : (p.likes || []).filter(
                      like => like.user._id !== authUser._id
                    ),
              }
            : p
        ) || []
      );
    };

    const mutation = isLiked ? unlikePostMutation : likePostMutation;

    mutation.mutate(post._id, {
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ["friendsPosts"] });
        await queryClient.cancelQueries({
          queryKey: ["userPosts", authUser._id],
        });
        const previousFriendsPosts = queryClient.getQueryData(["friendsPosts"]);
        const previousUserPosts = queryClient.getQueryData([
          "userPosts",
          authUser._id,
        ]);

        queryClient.setQueryData(["friendsPosts"], old =>
          updatePosts(old, post._id, !isLiked)
        );
        queryClient.setQueryData(["userPosts", authUser._id], old =>
          updatePosts(old, post._id, !isLiked)
        );

        return { previousFriendsPosts, previousUserPosts };
      },
      onError: (err, _, context) => {
        console.error(`${isLiked ? "Unlike" : "Like"} error:`, err);
        queryClient.setQueryData(
          ["friendsPosts"],
          context.previousFriendsPosts
        );
        queryClient.setQueryData(
          ["userPosts", authUser._id],
          context.previousUserPosts
        );
      },
    });
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
      {error && (
        <div className="alert alert-error mb-4 shadow-lg animate-fade-in">
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
      <div className="flex items-center gap-3 mb-3">
        <div className="avatar">
          <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
            <img
              src={post.user.profilePicture || "/default-avatar.png"}
              alt={`${post.user.fullName}'s avatar`}
              className="object-cover"
              onError={e => (e.target.src = "/default-avatar.png")}
            />
          </div>
        </div>
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="font-semibold hover:underline text-primary"
          >
            {post.user.fullName}
          </Link>
          <p className="text-xs text-base-content/70">
            {timeSince(post.createdAt)}
          </p>
        </div>
        {post.user._id === authUser._id && (
          <button
            className="btn btn-ghost btn-sm ml-auto text-error hover:bg-error/10"
            onClick={() => deletePostMutation.mutate()}
            disabled={deletePostMutation.isPending}
            aria-label="Delete post"
          >
            {deletePostMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {post.content && <p className="mb-3 text-base-content">{post.content}</p>}
      {post.image && (
        <img
          src={post.image}
          alt="Post image"
          className="w-full object-contain rounded-lg mb-3"
          onError={e => (e.target.src = "/default-post-image.png")}
        />
      )}
      <div className="flex justify-between items-center mb-3">
        <button
          className="btn btn-ghost btn-sm flex items-center gap-2"
          onClick={handleLikeToggle}
          disabled={likePostMutation.isPending || unlikePostMutation.isPending}
          aria-label={
            post.likes?.some(like => like.user._id === authUser._id)
              ? "Unlike post"
              : "Like post"
          }
        >
          <Heart
            className={`w-5 h-5 ${
              post.likes?.some(like => like.user._id === authUser._id)
                ? "fill-current text-red-500"
                : "text-base-content"
            }`}
          />
          <span>{(post.likes || []).length} Likes</span>
        </button>
        <button
          className="btn btn-ghost btn-sm flex items-center gap-2"
          onClick={() => setShowComments(!showComments)}
          aria-label={showComments ? "Hide comments" : "Show comments"}
        >
          <MessageCircle className="w-5 h-5 text-base-content" />
          <span>{comments.length || 0} Comments</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-4">
          <div className="form-control mb-4">
            <div className="flex gap-2">
              <textarea
                className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
              ></textarea>
              <button
                className="btn btn-primary btn-sm hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
                onClick={() => commentMutation.mutate()}
                disabled={commentMutation.isPending || !commentContent}
                aria-label="Post comment"
              >
                {commentMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          {isLoadingComments ? (
            <div className="flex justify-center items-center">
              <span className="loading loading-spinner loading-xs text-primary"></span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-base-content/70">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment._id} className="flex items-start gap-3">
                  <div className="avatar">
                    <div className="w-8 rounded-full border border-primary/50 overflow-hidden">
                      <img
                        src={
                          comment.user.profilePicture || "/default-avatar.png"
                        }
                        alt={`${comment.user.fullName}'s avatar`}
                        className="object-cover"
                        onError={e => (e.target.src = "/default-avatar.png")}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-base-100 p-3 rounded-lg shadow-sm">
                      <Link
                        to={`/profile/${comment.user._id}`}
                        className="font-semibold hover:underline text-primary"
                      >
                        {comment.user.fullName}
                      </Link>
                      <p className="text-sm text-base-content">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-base-content/70 mt-1">
                      {timeSince(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
