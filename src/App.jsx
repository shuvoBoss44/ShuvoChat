import React from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/Chat";
import GroupChat from "./pages/GroupChat";
import Call from "./pages/Call";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import toast, { Toaster } from "react-hot-toast";
import Loading from "./components/Loading";
import useAuthUser from "./hooks/useAuthUser";
import OnBoarding from "./pages/OnBoarding";
import Layout from "./components/Layout";
import useThemeStore from "./store/useThemeStore";
import Header from "./pages/Header";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-screen" data-theme={theme}>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <Home />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/friends"
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <Friends />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            authUser ? (
              <Layout showSidebar={true}>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chat/:id"
          element={
            authUser ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/group-chat/:id"
          element={
            authUser ? (
              <Layout showSidebar={false}>
                <GroupChat />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/call/:id"
          element={authUser ? <Call /> : <Navigate to="/login" />}
        />
        <Route
          path="/onboarding"
          element={authUser ? <OnBoarding /> : <Navigate to="/signup" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
