import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  MessageSquare,
  Users,
  User,
} from "lucide-react";
import useThemeStore from "../store/useThemeStore";
import { useState } from "react";
import { THEMES } from "../constants";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

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
        <Link
          to="/profile"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/profile" ? "btn-active" : ""
          }`}
        >
          <User className="size-5 text-base-content opacity-70" />
          <span>Profile</span>
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
              {THEMES.map(themeOption => (
                <button
                  key={themeOption.name}
                  className={`
                w-full px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200
                ${
                  theme === themeOption.name
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "hover:bg-base-300 text-base-content"
                }
              `}
                  onClick={() => setTheme(themeOption.name)}
                  aria-label={`Select ${themeOption.label} theme`}
                >
                  <PaletteIcon className="size-4" />
                  <span className="text-sm font-medium flex-1 text-left">
                    {themeOption.label}
                  </span>
                  {/* THEME PREVIEW COLORS */}
                  <div className="flex gap-1">
                    {themeOption.colors.map((color, i) => (
                      <span
                        key={i}
                        className="size-3 rounded-full border border-base-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        className="p-4 border-t border-base-300 cursor-pointer hover:bg-base-300 transition-colors"
        onClick={() => navigate(`/profile`)}
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
