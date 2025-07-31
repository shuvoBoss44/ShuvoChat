import React from "react";
import { ChannelHeader } from "stream-chat-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CallButton from "./CallButton";

const CustomChannelHeader = ({ handleVideoCall }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-2 shadow-md bg-white dark:bg-gray-900">
      {/* Left side: Back button + ChannelHeader */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <ChannelHeader />
      </div>

      {/* Right side: Call button */}
      <CallButton handleVideoCall={handleVideoCall} />
    </div>
  );
};

export default CustomChannelHeader;
