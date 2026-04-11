import { createContext, useState } from "react";
/* eslint-disable react-refresh/only-export-components */
export const PostContext = createContext()

export const PostContextProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [feed, setFeed] = useState([]);
    const [post, setPost] = useState(null);
    return (
        <PostContext.Provider value={{ loading, setLoading, feed, setFeed, post, setPost }}>
            {children}
        </PostContext.Provider>
    );
};

export default PostContext