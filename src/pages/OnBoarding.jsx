import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import useThemeStore from "../store/useThemeStore";
import toast from "react-hot-toast";

const OnBoarding = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type)
    ) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      setError(null);
      setFormData({ ...formData, profilePicture: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setError("Please upload a JPEG, PNG, or GIF image");
    }
  };

  const handleBioChange = e => {
    const bio = e.target.value;
    if (bio.length <= 160) {
      setFormData({ ...formData, bio });
      setError(null);
    } else {
      setError("Bio must be 160 characters or less");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.bio && !formData.profilePicture) {
      setError("Please provide a bio or profile picture");
      return;
    }
    if (!authUser) {
      setError("User not authenticated");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const data = new FormData();
      if (formData.bio) data.append("bio", formData.bio);
      if (formData.profilePicture)
        data.append("profilePicture", formData.profilePicture);

      const response = await axiosInstance.patch("/user/updateProfile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to update profile");
      }
      toast.success("Profile updated successfully");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Update profile error:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme={theme}
    >
      <div className="border border-primary/25 w-full max-w-md mx-auto bg-base-100 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-primary">
            Complete Your Profile
          </h2>
          <p className="text-sm opacity-70 mt-1">
            Add a bio and profile picture to personalize your ShuvoChat
            experience.
          </p>
          <h2 className="text-2xl font-semibold text-primary">
            Welcome {authUser?.fullName || "User"}!
          </h2>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Profile Picture</span>
            </label>
            <div className="flex flex-col items-center gap-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile picture preview"
                  className="w-24 h-24 rounded-full object-cover border border-primary/50"
                />
              ) : (
                <img
                  src={authUser?.profilePicture || "/default-avatar.png"}
                  alt="Profile picture preview"
                  className="w-24 h-24 rounded-full object-cover border border-primary/50"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/jpg"
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Bio</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder={authUser?.bio || "Tell us about yourself..."}
              value={formData.bio}
              onChange={handleBioChange}
              maxLength={160}
            />
            <p className="text-xs opacity-70 mt-1">
              {formData.bio.length}/160 characters
            </p>
          </div>

          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={isPending || (!formData.bio && !formData.profilePicture)}
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => navigate("/")}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
