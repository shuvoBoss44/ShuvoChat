import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { HomeIcon, UsersIcon, UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn btn-ghost btn-circle"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <X className="size-6 text-primary" />
        ) : (
          <Menu className="size-6 text-primary" />
        )}
      </button>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-base-200 border-r border-base-300 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 z-40`}
      >
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="ShuvoMedia Logo" className="size-9" />
            <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
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
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon className="size-5 text-primary opacity-70" />
            <span>Home</span>
          </Link>
          <Link
            to="/friends"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/friends" ? "btn-active" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <UsersIcon className="size-5 text-primary opacity-70" />
            <span>Friends</span>
          </Link>
          <Link
            to="/profile"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/profile" ? "btn-active" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="size-5 text-primary opacity-70" />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-base-300 transition-colors"
              onClick={() => {
                navigate("/onboarding");
                setIsOpen(false);
              }}
            >
              <div className="avatar">
                <div className="w-10 rounded-full border border-primary/50 overflow-hidden">
                  <img
                    src={authUser?.profilePicture || "/default-avatar.png"}
                    alt="User Avatar"
                    className="object-fill"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-primary">
                  {authUser?.fullName}
                </p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="size-2 rounded-full bg-success inline-block" />
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
