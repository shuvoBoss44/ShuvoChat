import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose, friends }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/chats/create-group", {
        name: groupName,
        members: selectedMembers,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Group created successfully!");
      queryClient.invalidateQueries({ queryKey: ["groupChats"] });
      setGroupName("");
      setSelectedMembers([]);
      onClose();
    },
    onError: err => {
      toast.error(err.response?.data?.message || "Failed to create group");
    },
  });

  const handleMemberToggle = userId => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Create Group Chat
        </h2>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Group Name</span>
          </label>
          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter group name"
          />
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Select Members</span>
          </label>
          <div className="max-h-60 overflow-y-auto">
            {friends.map(friend => (
              <div key={friend._id} className="flex items-center gap-2 p-2">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(friend._id)}
                  onChange={() => handleMemberToggle(friend._id)}
                  className="checkbox checkbox-primary"
                />
                <span>{friend.fullName}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Cancel group creation"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => createGroupMutation.mutate()}
            disabled={
              createGroupMutation.isPending ||
              !groupName ||
              selectedMembers.length === 0
            }
            aria-label="Create group"
          >
            {createGroupMutation.isPending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
