import React from "react";
import useThemeStore from "../store/useThemeStore";

const Loading = () => {
  const { theme } = useThemeStore();
  return (
    <>
      {/* loading with spinner */}
      <div
        className="flex items-center justify-center h-screen"
        data-theme={theme}
      >
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    </>
  );
};

export default Loading;
