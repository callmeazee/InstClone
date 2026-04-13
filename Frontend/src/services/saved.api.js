import axios from "axios";
import { API_BASE_URL } from "./api.config";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export const savePost = async (postId) => {
    try {
        const res = await api.post(`/users/save/${postId}`)
        return res.data
    } catch (error) {
        console.error("savePost failed:", error.response?.data || error.message)
        throw error
    }
};

export const unsavePost = async (postId) => {
    try {
        const res = await api.post(`/users/unsave/${postId}`)
        return res.data
    } catch (error) {
        console.error("unsavePost failed:", error.response?.data || error.message)
        throw error
    }
};

export const getSavedPosts = async () => {
    try {
        const res = await api.get(`/users/saved/posts`)
        return res.data
    } catch (error) {
        console.error("getSavedPosts failed:", error.response?.data || error.message)
        throw error
    }
};
