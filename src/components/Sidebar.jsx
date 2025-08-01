import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import {
  HomeIcon,
  ShipWheelIcon,
  Users,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log out");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn btn-ghost btn-circle bg-base-100/80 hover:bg-base-100"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-base-200 border-r border-base-300 flex flex-col h-screen fixed lg:sticky top-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 overflow-y-auto`}
      >
        <div className="p-5 border-b border-base-300">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ShuvoMedia
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-base-content hover:bg-primary/10 ${
              currentPath === "/" ? "btn-active bg-primary/20" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon className="size-5 opacity-70" />
            <span>Home</span>
          </Link>
          <Link
            to="/friends"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-base-content hover:bg-primary/10 ${
              currentPath === "/friends" ? "btn-active bg-primary/20" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Users className="size-5 opacity-70" />
            <span>Friends</span>
          </Link>
          <Link
            to="/profile"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-base-content hover:bg-primary/10 ${
              currentPath === "/profile" ? "btn-active bg-primary/20" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <User className="size-5 opacity-70" />
            <span>Profile</span>
          </Link>
        </nav>

        <div
          className="p-4 border-t border-base-300"
          onClick={() => {
            navigate(`/profile`);
            setIsOpen(false);
          }}
        >
          <div className="flex items-center gap-3 cursor-pointer hover:bg-base-300 transition-colors duration-200">
            <div className="avatar">
              <div className="w-10 rounded-full border border-primary/50">
                <img
                  src={authUser?.profilePicture || "/default-avatar.png"}
                  alt="User Avatar"
                  onError={e => (e.target.src = "/default-avatar.png")}
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-base-content">
                {authUser?.fullName}
              </p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-base-300">
          <button
            className="btn btn-ghost btn-sm w-full flex items-center gap-2 text-base-content hover:bg-error/10"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5 text-error" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
