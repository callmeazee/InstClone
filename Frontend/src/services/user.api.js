import { createApi } from "./api.config";

const api = createApi()

export const followUser = async (username) => {
    try {
        const res = await api.post(`/users/follow/${username}`)
        return res.data
    } catch (error) {
        console.error("followUser failed:", error.response?.data || error.message)
        throw error
    }
};

export const unfollowUser = async (username) => {
    try {
        const res = await api.post(`/users/unfollow/${username}`)
        return res.data
    } catch (error) {
        console.error("unfollowUser failed:", error.response?.data || error.message)
        throw error
    }
};

export const getFollowStatus = async (username) => {
    try {
        const res = await api.get(`/users/status/${username}`)
        return res.data
    } catch (error) {
        console.error("getFollowStatus failed:", error.response?.data || error.message)
        throw error
    }
};

export const getPendingRequests = async () => {
    try {
        const res = await api.get(`/users/requests`)
        return res.data
    } catch (error) {
        console.error("getPendingRequests failed:", error.response?.data || error.message)
        throw error
    }
};

export const acceptFollowRequest = async (username) => {
    try {
        const res = await api.post(`/users/accept/${username}`)
        return res.data
    } catch (error) {
        console.error("acceptFollowRequest failed:", error.response?.data || error.message)
        throw error
    }
};

export const rejectFollowRequest = async (username) => {
    try {
        const res = await api.post(`/users/reject/${username}`)
        return res.data
    } catch (error) {
        console.error("rejectFollowRequest failed:", error.response?.data || error.message)
        throw error
    }
};

export const cancelFollowRequest = async (username) => {
    try {
        const res = await api.post(`/users/unfollow/${username}`)
        return res.data
    } catch (error) {
        console.error("cancelFollowRequest failed:", error.response?.data || error.message)
        throw error
    }
};

export const getUserStats = async (username) => {
    try {
        const res = await api.get(`/users/stats/${username}`)
        return res.data
    } catch (error) {
        console.error("getUserStats failed:", error.response?.data || error.message)
        throw error
    }
};

export const getMyStats = async () => {
    try {
        const res = await api.get(`/users/my/stats`)
        return res.data
    } catch (error) {
        console.error("getMyStats failed:", error.response?.data || error.message)
        throw error
    }
};
