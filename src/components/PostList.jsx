// PostList.jsx
import React from "react";
import Post from "./Post";
import useAuthUser from "../hooks/useAuthUser";

const PostList = ({ posts }) => {
  const { authUser } = useAuthUser();

  console.log("PostList posts:", posts); // Debug: Log posts data

  if (!posts || posts.length === 0) {
    return (
      <p className="text-base-content/70 text-center">
        No posts to display on ShuvoMedia.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <Post key={post._id} post={post} authUser={authUser} />
      ))}
    </div>
  );
};

export default PostList;
