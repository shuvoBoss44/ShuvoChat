import React from "react";
import ThemeSelector from "../components/ThemeSelector";
import useThemeStore from "../store/useThemeStore";

const Header = () => {
  const { theme } = useThemeStore();

  return (
    <header
      className="bg-base-200 border-b border-base-300 p-4 flex items-center justify-between"
      data-theme={theme}
    >
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          ShuvoMedia
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSelector />
      </div>
    </header>
  );
};

export default Header;
