import React from "react";
import { Video } from "lucide-react"; // You can use any icon library (Lucide, Heroicons, etc.)

const CallButton = ({ handleVideoCall }) => {
  return (
    <button
      onClick={handleVideoCall}
      className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-full shadow-md transition duration-200"
    >
      <Video className="w-4 h-4" />
      <span className="text-sm font-medium">Call</span>
    </button>
  );
};

export default CallButton;
