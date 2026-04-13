import { getFeed, createPost } from "../services/post.api";
import { useContext, useState } from "react";
import { PostContext } from "../post.context";

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within PostContextProvider");
  }

  const { loading, setLoading, feed, setFeed, post, setPost } = context;
  const [error, setError] = useState(null);

  const handleGetFeed = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFeed();
      setFeed(data?.posts || []);
    } catch (error) {
      console.error("Hook error:", error);
      setError(error.response?.data?.message || error.message || "Unable to fetch feed");
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (imageFile, caption) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createPost(imageFile, caption);
      const createdPost = response?.post;

      if (createdPost) {
        setFeed((prevFeed) => [createdPost, ...prevFeed]);
      }

      return response;
    } catch (error) {
      console.error("Hook error:", error);
      setError(error.response?.data?.message || error.message || "Unable to create post");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, feed, post, handleGetFeed, handleCreatePost, error };
};
