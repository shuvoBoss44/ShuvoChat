import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import Post from "./Post";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const PostList = ({ posts }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  console.log("PostList posts:", posts); // Debug: Log posts data

  const likePostMutation = useMutation({
    mutationFn: async postId => {
      const response = await axiosInstance.post(
        `/posts/like/${postId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log("Like post response:", response.data); // Debug: Log response
      return response.data;
    },
    onMutate: async postId => {
      await queryClient.cancelQueries({ queryKey: ["friendsPosts"] });
      await queryClient.cancelQueries({
        queryKey: ["userPosts", authUser._id],
      });
      const previousFriendsPosts = queryClient.getQueryData(["friendsPosts"]);
      const previousUserPosts = queryClient.getQueryData([
        "userPosts",
        authUser._id,
      ]);

      const updatePosts = old =>
        old?.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: [
                  ...(p.likes || []),
                  {
                    user: {
                      _id: authUser._id,
                      fullName: authUser.fullName,
                    },
                  },
                ],
              }
            : p
        ) || [];

      queryClient.setQueryData(["friendsPosts"], updatePosts);
      queryClient.setQueryData(["userPosts", authUser._id], updatePosts);

      return { previousFriendsPosts, previousUserPosts };
    },
    onSuccess: () => {
      toast.success("Post liked");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts", authUser._id] });
    },
    onError: (err, postId, context) => {
      console.error("Like post error:", err);
      queryClient.setQueryData(["friendsPosts"], context.previousFriendsPosts);
      queryClient.setQueryData(
        ["userPosts", authUser._id],
        context.previousUserPosts
      );
      toast.error(err.response?.data?.message || "Failed to like post");
    },
  });

  const unlikePostMutation = useMutation({
    mutationFn: async postId => {
      const response = await axiosInstance.delete(`/posts/unlike/${postId}`, {
        withCredentials: true,
      });
      console.log("Unlike post response:", response.data); // Debug: Log response
      return response.data;
    },
    onMutate: async postId => {
      await queryClient.cancelQueries({ queryKey: ["friendsPosts"] });
      await queryClient.cancelQueries({
        queryKey: ["userPosts", authUser._id],
      });
      const previousFriendsPosts = queryClient.getQueryData(["friendsPosts"]);
      const previousUserPosts = queryClient.getQueryData([
        "userPosts",
        authUser._id,
      ]);

      const updatePosts = old =>
        old?.map(p =>
          p._id === postId
            ? {
                ...p,
                likes: (p.likes || []).filter(
                  like => like.user._id !== authUser._id
                ),
              }
            : p
        ) || [];

      queryClient.setQueryData(["friendsPosts"], updatePosts);
      queryClient.setQueryData(["userPosts", authUser._id], updatePosts);

      return { previousFriendsPosts, previousUserPosts };
    },
    onSuccess: () => {
      toast.success("Post unliked");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts", authUser._id] });
    },
    onError: (err, postId, context) => {
      console.error("Unlike post error:", err);
      queryClient.setQueryData(["friendsPosts"], context.previousFriendsPosts);
      queryClient.setQueryData(
        ["userPosts", authUser._id],
        context.previousUserPosts
      );
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
