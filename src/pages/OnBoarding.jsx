import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthUser from "../hooks/useAuthUser";
import axiosInstance from "../lib/axios";
import useThemeStore from "../store/useThemeStore";

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

  // Handle file input change
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        setError("Please upload a JPEG, PNG, or GIF image");
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      setError(null);
      setFormData({ ...formData, profilePicture: file });

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle bio input change
  const handleBioChange = e => {
    const bio = e.target.value;
    if (bio.length <= 160) {
      setFormData({ ...formData, bio });
      setError(null);
    } else {
      setError("Bio must be 160 characters or less");
    }
  };

  // Handle form submission
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
      // Prepare form data for upload
      const data = new FormData();
      if (formData.bio) data.append("bio", formData.bio);
      if (formData.profilePicture)
        data.append("profilePicture", formData.profilePicture);

      const response = await axiosInstance.patch("/user/updateProfile", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to update profile");
      }
      // Redirect to home on success
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
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
        {/* Header */}
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

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
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
                  src={authUser?.profilePicture}
                  alt="Profile picture preview"
                  className="w-24 h-24 rounded-full object-cover border border-primary/50"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="file-input file-input-bordered w-full max-w-xs"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Bio Input */}
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

          {/* Submit Button */}
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

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => navigate("/dashboard")}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
