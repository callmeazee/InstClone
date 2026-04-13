import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
})

export const getFeed = async () => {
    try {
        const res = await api.get("/posts/feed")
        return res.data
    } catch (error) {
        console.error("getFeed failed:", error.response?.data || error.message)
        throw error
    }
};

export const likePost = async (postId) => {
    try {
        const res = await api.post(`/posts/like/${postId}`)
        return res.data
    } catch (error) {
        console.error("likePost failed:", error.response?.data || error.message)
        throw error
    }
};

export const unlikePost = async (postId) => {
    try {
        const res = await api.post(`/posts/unlike/${postId}`)
        return res.data
    } catch (error) {
        console.error("unlikePost failed:", error.response?.data || error.message)
        throw error
    }
};

export const createPost = async (imageFile, caption) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', caption);

        const res = await api.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    } catch (error) {
        console.error("createPost failed:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePost = async (postId) => {
    try {
        const res = await api.delete(`/posts/${postId}`);
        return res.data;
    } catch (error) {
        console.error("deletePost failed:", error.response?.data || error.message);
        throw error;
    }
};