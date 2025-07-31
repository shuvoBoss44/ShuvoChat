import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import Loading from "./Loading";
import ThemeSelector from "./ThemeSelector";

const Navbar = () => {
  const { authUser, isLoading } = useAuthUser();
  const { logoutMutation, isPending } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname?.startsWith("/chat");

  // Handle profile click to navigate to onboarding
  const handleProfileClick = () => {
    navigate("/onboarding");
  };

  if (isLoading) {
    return (
      <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <Loading
            size="sm"
            fullScreen={false}
            color="text-primary"
            ariaLabel="Loading user data"
          />
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-4 lg:px-6 flex items-center justify-between">
        {/* LOGO - ONLY IN THE CHAT PAGE */}
        {isChatPage && (
          <div className="flex items-center pl-3 sm:pl-4">
            <Link to="/" className="flex items-center gap-2">
              <ShipWheelIcon className="size-8 sm:size-9 text-primary" />
              <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                ShuvoChat
              </span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* User Avatar */}
          <button
            className="avatar tooltip"
            data-tip="Edit Profile"
            onClick={handleProfileClick}
            aria-label={`Edit profile for ${authUser?.fullName || "User"}`}
          >
            <div className="w-8 sm:w-9 rounded-full border border-primary/50 overflow-hidden">
              <img
                src={authUser?.profilePicture || "/default-avatar.png"}
                alt={`${authUser?.fullName || "User"}'s avatar`}
                className="object-fill"
              />
            </div>
          </button>
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
