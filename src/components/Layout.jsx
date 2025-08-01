import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ showSidebar = true, children }) => {
  return (
    <div className="flex min-h-screen bg-base-100">
      {showSidebar && <Sidebar />}
      <div
        className={`flex-1 flex flex-col ${
          showSidebar ? "lg:ml-64" : ""
        } transition-all duration-300`}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-2 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
