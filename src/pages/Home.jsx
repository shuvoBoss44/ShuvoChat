import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import PostList from "../components/PostList";
import { Image, X } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const Home = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["friendsPosts"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/posts/friends");
        return response.data.posts;
      } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to fetch posts");
      }
    },
    onError: err => setError(err.message),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      if (content) formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await axiosInstance.post("/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      setContent("");
      setImage(null);
      toast.success("Post created successfully on ShuvoMedia");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts", authUser._id] });
    },
    onError: err => {
      setError(err.response?.data?.message || "Failed to create post");
    },
  });

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type)
    ) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must not exceed 10MB");
        return;
      }
      setImage(file);
    } else {
      toast.error("Please select a valid image (JPEG, PNG, GIF)");
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!content && !image) {
      setError("Please provide text or an image to post");
      return;
    }
    createPostMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
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

        <div className="card bg-base-200 border border-base-300 shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Share something on ShuvoMedia
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <textarea
                className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary"
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
              ></textarea>
            </div>
            <div className="flex items-center gap-4">
              <label className="btn btn-ghost btn-sm flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {image && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-base-content/70">
                    {image.name}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setImage(null)}
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-error" />
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Post"
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-md text-primary"></span>
            </div>
          ) : (
            <PostList posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
