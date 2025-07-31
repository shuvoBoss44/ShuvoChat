import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import Post from "./Post";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const PostList = ({ posts }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const likePostMutation = useMutation({
    mutationFn: async postId => {
      const response = await axiosInstance.post(`/posts/like/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Post liked");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Failed to like post");
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: async postId => {
      const response = await axiosInstance.delete(`/posts/unlike/${postId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Post unliked");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Failed to unlike post");
    },
  });

  if (!posts || posts.length === 0) {
    return (
      <p className="text-base-content/70 text-center">
        No posts to display on ShuvoMedia.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post
          key={post._id}
          post={post}
          authUser={authUser}
          likePostMutation={likePostMutation}
          unlikePostMutation={unlikePostMutation}
        />
      ))}
    </div>
  );
};

export default PostList;
