import React from "react";
import { ChannelHeader } from "stream-chat-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CallButton from "./CallButton";

const CustomChannelHeader = ({ handleVideoCall }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md bg-white dark:bg-gray-900 w-full">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/friends")}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back to messages"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <ChannelHeader className="text-lg font-semibold text-gray-900 dark:text-gray-100" />
      </div>
      <div className="flex items-center mr-10">
        <CallButton handleVideoCall={handleVideoCall} />
      </div>
    </div>
  );
};

export default CustomChannelHeader;
