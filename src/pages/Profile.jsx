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
        profilePicture: data.profilePicture || "",
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
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser._id],
      });
      queryClient.invalidateQueries({ queryKey: ["authUser"] }); // Update sidebar avatar
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

        <div className="card bg-base-100 border border-primary/25 shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">Your Profile</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEditing(!isEditing)}
              aria-label={isEditing ? "Cancel editing" : "Edit profile"}
            >
              {isEditing ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bio</span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="textarea textarea-bordered w-full"
                      placeholder="Tell us about yourself"
                    ></textarea>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">School</span>
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter your school"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">College</span>
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter your college"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Relationship Status</span>
                    </label>
                    <select
                      name="relationshipStatus"
                      value={formData.relationshipStatus}
                      onChange={handleInputChange}
                      className="select select-bordered w-full"
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
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Profile Picture</span>
                    </label>
                    <label className="btn btn-ghost btn-sm">
                      <Image className="w-5 h-5" />
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/jpg"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    {imageFile && (
                      <span className="text-sm ml-4">{imageFile.name}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary mt-4"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    {user?.fullName}
                  </div>
                  <div>
                    <span className="font-semibold">Bio:</span>{" "}
                    {user?.bio || "No bio provided"}
                  </div>
                  <div>
                    <span className="font-semibold">School:</span>{" "}
                    {user?.school || "Not specified"}
                  </div>
                  <div>
                    <span className="font-semibold">College:</span>{" "}
                    {user?.college || "Not specified"}
                  </div>
                  <div>
                    <span className="font-semibold">Relationship Status:</span>{" "}
                    {user?.relationshipStatus || "Not specified"}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="avatar">
                <div className="w-32 md:w-48 rounded-full border border-primary/50 overflow-hidden">
                  <img
                    src={formData.profilePicture || "/default-avatar.png"}
                    alt="Profile picture"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-primary/25 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Your Posts
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
