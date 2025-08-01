import React from "react";
import ThemeSelector from "../components/ThemeSelector";
import useThemeStore from "../store/useThemeStore";

const Header = () => {
  const { theme } = useThemeStore();

  return (
    <div className="relative" data-theme={theme}>
      <div className="absolute top-4 right-4 z-50">
        <ThemeSelector />
      </div>
    </div>
  );
};

export default Header;
