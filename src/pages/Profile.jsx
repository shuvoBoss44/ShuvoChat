import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Save, X, Edit2 } from "lucide-react";
import PostList from "../components/PostList";
import useAuthUser from "../hooks/useAuthUser";

const Profile = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    school: "",
    college: "",
    relationshipStatus: "",
    profilePicture: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["userProfile", authUser?._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/user/profile/${authUser._id}`);
      return response.data.user;
    },
    enabled: !!authUser,
    onSuccess: data => {
      setFormData({
        fullName: data.fullName || "",
        bio: data.bio || "",
        school: data.school || "",
        college: data.college || "",
        relationshipStatus: data.relationshipStatus || "",
        profilePicture: data.profilePicture || "/default-avatar.png",
      });
    },
    onError: err =>
      setError(err.response?.data?.message || "Failed to fetch profile"),
  });

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", authUser?._id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/user/posts/${authUser._id}`);
      return response.data.posts;
    },
    enabled: !!authUser,
    onError: err =>
      setError(err.response?.data?.message || "Failed to fetch posts"),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      if (formData.fullName) form.append("fullName", formData.fullName);
      if (formData.bio) form.append("bio", formData.bio);
      if (formData.school) form.append("school", formData.school);
      if (formData.college) form.append("college", formData.college);
      if (formData.relationshipStatus)
        form.append("relationshipStatus", formData.relationshipStatus);
      if (imageFile) form.append("profilePicture", imageFile);

      const response = await axiosInstance.patch("/user/updateProfile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      setIsEditing(false);
      setImageFile(null);
      toast.success("Profile updated successfully on ShuvoMedia");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser._id],
      });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: err => {
      setError(err.response?.data?.message || "Failed to update profile");
    },
  });

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        profilePicture: URL.createObjectURL(file),
      }));
    } else {
      toast.error("Please select a valid image (JPEG, PNG, GIF)");
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Your ShuvoMedia Profile
            </h2>
            <button
              className="btn btn-ghost btn-sm text-primary hover:bg-primary/10"
              onClick={() => setIsEditing(!isEditing)}
              aria-label={isEditing ? "Cancel editing" : "Edit profile"}
            >
              {isEditing ? (
                <X className="w-5 h-5" />
              ) : (
                <Edit2 className="w-5 h-5" />
              )}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex justify-center">
              <div className="avatar relative group">
                <div className="w-40 h-40 rounded-full border border-primary/50 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={formData.profilePicture || "/default-avatar.png"}
                    alt="Profile picture"
                    className="object-cover w-full h-full"
                    onError={e => (e.target.src = "/default-avatar.png")}
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 btn btn-ghost btn-circle btn-sm bg-base-100/80 hover:bg-base-100">
                    <Image className="w-4 h-4 text-primary" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/jpg"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-primary">
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-primary">
                        Bio
                      </span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-primary">
                        School
                      </span>
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                      placeholder="Enter your school"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-primary">
                        College
                      </span>
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary"
                      placeholder="Enter your college"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-primary">
                        Relationship Status
                      </span>
                    </label>
                    <select
                      name="relationshipStatus"
                      value={formData.relationshipStatus}
                      onChange={handleInputChange}
                      className="select select-bordered w-full focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="In a relationship">
                        In a relationship
                      </option>
                      <option value="Married">Married</option>
                      <option value="Complicated">Complicated</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary mt-4 hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" /> Save Profile
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Name:</span>
                    <span className="text-base-content">
                      {user?.fullName || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Bio:</span>
                    <span className="text-base-content">
                      {user?.bio || "No bio provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">School:</span>
                    <span className="text-base-content">
                      {user?.school || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">College:</span>
                    <span className="text-base-content">
                      {user?.college || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">
                      Relationship Status:
                    </span>
                    <span className="text-base-content">
                      {user?.relationshipStatus || "Not specified"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border border-base-300 shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            Your ShuvoMedia Posts
          </h2>
          {isLoadingPosts ? (
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

export default Profile;
