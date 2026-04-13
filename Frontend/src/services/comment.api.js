import { createApi } from "./api.config";

const api = createApi()

export const createComment = async (postId, text) => {
    try {
        const res = await api.post(`/comments/${postId}`, { text })
        return res.data
    } catch (error) {
        console.error("createComment failed:", error.response?.data || error.message)
        throw error
    }
};

export const getComments = async (postId) => {
    try {
        const res = await api.get(`/comments/${postId}`)
        return res.data
    } catch (error) {
        console.error("getComments failed:", error.response?.data || error.message)
        throw error
    }
};

export const deleteComment = async (commentId) => {
    try {
        const res = await api.delete(`/comments/${commentId}`)
        return res.data
    } catch (error) {
        console.error("deleteComment failed:", error.response?.data || error.message)
        throw error
    }
};
