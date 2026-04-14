import { createApi } from "./api.config";

const api = createApi()

/**
 * Search users by username or bio
 * @param {string} query - The search query
 * @returns {Promise<Object>} - The search results
 */
export const searchUsers = async (query) => {
    try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
        return res.data
    } catch (error) {
        console.error("searchUsers failed:", error.response?.data || error.message)
        throw error
    }
};

/**
 * Search posts by caption
 * @param {string} query - The search query
 * @returns {Promise<Object>} - The search results
 */
export const searchPosts = async (query) => {
    try {
        const res = await api.get(`/posts/search?q=${encodeURIComponent(query)}`)
        return res.data
    } catch (error) {
        console.error("searchPosts failed:", error.response?.data || error.message)
        throw error
    }
};
