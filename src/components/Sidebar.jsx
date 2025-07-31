import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  MessageSquare,
  Users,
} from "lucide-react";
import useThemeStore from "../store/useThemeStore";
import { useState } from "react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themes = ["light", "dark", "cupcake", "bumblebee", "emerald"];

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            ShuvoMedia
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>
        <Link
          to="/messages"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/messages" ? "btn-active" : ""
          }`}
        >
          <MessageSquare className="size-5 text-base-content opacity-70" />
          <span>Messages</span>
        </Link>
        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <Users className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-base-300">
        <div className="relative">
          <button
            className="btn btn-ghost w-full justify-start"
            onClick={() => setIsThemeOpen(!isThemeOpen)}
          >
            Theme: {theme}
          </button>
          {isThemeOpen && (
            <ul className="absolute bottom-full left-0 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg mb-2">
              {themes.map(t => (
                <li
                  key={t}
                  className="p-2 hover:bg-primary hover:text-white cursor-pointer"
                  onClick={() => {
                    setTheme(t);
                    setIsThemeOpen(false);
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className="p-4 border-t border-base-300 cursor-pointer hover:bg-base-300 transition-colors"
        onClick={() => navigate(`/profile/${authUser._id}`)}
      >
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img
                src={authUser?.profilePicture || "/default-avatar.png"}
                alt="User Avatar"
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
