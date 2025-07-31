import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import PostList from "../components/PostList";
import { Image } from "lucide-react";

const Home = () => {
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
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["friendsPosts"] });
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
      setImage(file);
    } else {
      toast.error("Please select a valid image (JPEG, PNG, GIF)");
    }
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

        <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Create a Post
          </h2>
          <div className="form-control">
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
            ></textarea>
            <div className="flex items-center gap-4">
              <label className="btn btn-ghost btn-sm">
                <Image className="w-5 h-5" />
                <span>Add Image</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {image && <span className="text-sm">{image.name}</span>}
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={() => createPostMutation.mutate()}
              disabled={createPostMutation.isPending || (!content && !image)}
            >
              {createPostMutation.isPending ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </div>
  );
};

export default Home;
