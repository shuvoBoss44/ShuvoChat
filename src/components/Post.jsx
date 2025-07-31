import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const Post = ({ post, authUser, likePostMutation, unlikePostMutation }) => {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState(null);

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["comments", post._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/posts/comments/${post._id}`);
      return response.data.comments;
    },
    enabled: showComments,
    onError: err =>
      setError(err.response?.data?.message || "Failed to fetch comments"),
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(`/posts/comment/${post._id}`, {
        content: commentContent,
      });
      return response.data;
    },
    onSuccess: () => {
      setCommentContent("");
      toast.success("Comment added");
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
    },
    onError: err => {
      setError(err.response?.data?.message || "Failed to add comment");
    },
  });

  const handleLikeToggle = () => {
    if (post.likes?.some(like => like.user._id === authUser._id)) {
      unlikePostMutation.mutate(post._id);
    } else {
      likePostMutation.mutate(post._id);
    }
  };

  return (
    <div className="card bg-base-100 border border-primary/25 shadow-lg p-4">
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
            />
          </div>
        </div>
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="font-semibold hover:underline"
          >
            {post.user.fullName}
          </Link>
          <p className="text-xs text-base-content/70">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {post.content && <p className="mb-3">{post.content}</p>}
      {post.image && (
        <img
          src={post.image}
          alt="Post image"
          className="w-full max-h-96 object-cover rounded-lg mb-3"
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
                : ""
            }`}
          />
          <span>{post.likes?.length || 0} Likes</span>
        </button>
        <button
          className="btn btn-ghost btn-sm flex items-center gap-2"
          onClick={() => setShowComments(!showComments)}
          aria-label={showComments ? "Hide comments" : "Show comments"}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length} Comments</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-4">
          <div className="form-control mb-4">
            <div className="flex gap-2">
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
              ></textarea>
              <button
                className="btn btn-primary btn-sm"
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
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-base-200 p-3 rounded-lg">
                      <Link
                        to={`/profile/${comment.user._id}`}
                        className="font-semibold hover:underline"
                      >
                        {comment.user.fullName}
                      </Link>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-base-content/70 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
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
