const followModel = require("../models/follow.model")
const userModel = require("../models/user.model")
const savedModel = require("../models/saved.model")
const postModel = require("../models/post.model")
const likeModel = require("../models/like.model")

/* FOLLOW REQUEST */
async function followUserController(req, res) {
  const follower = req.user.username
  const followee = req.params.username

  if (follower === followee) {
    return res.status(400).json({ message: "You cannot follow yourself" })
  }

  const userExists = await userModel.findOne({ username: followee })
  if (!userExists) {
    return res.status(404).json({ message: "User not found" })
  }

  try {
    const follow = await followModel.create({
      follower,
      followee,
      status: "pending"
    })

    return res.status(201).json({
      message: "Follow request sent",
      follow
    })

  } catch (err) {
    if (err.code === 11000) {
      const existing = await followModel.findOne({ follower, followee })
      if (existing) {
        return res.status(409).json({
          message: `Already ${existing.status}`,
          follow: existing
        })
      } else {
        return res.status(409).json({
          message: "Follow request already exists"
        })
      }
    }

    console.error("Follow error:", err)
    return res.status(500).json({ message: "Server error: " + err.message })
  }
}

/* ACCEPT REQUEST */
async function acceptFollowController(req, res) {
  const currentUser = req.user.username
  const requester = req.params.username

  const follow = await followModel.findOneAndUpdate(
    {
      follower: requester,
      followee: currentUser,
      status: "pending"
    },
    { status: "accepted" },
    { new: true }
  )

  if (!follow) {
    return res.status(404).json({ message: "Request not found" })
  }

  return res.json({
    message: "Request accepted",
    follow
  })
}

/* REJECT REQUEST */
async function rejectFollowController(req, res) {
  const currentUser = req.user.username
  const requester = req.params.username

  const deleted = await followModel.findOneAndDelete({
    follower: requester,
    followee: currentUser,
    status: "pending"
  })

  if (!deleted) {
    return res.status(404).json({ message: "Request not found" })
  }

  return res.json({
    message: "Request rejected"
  })
}

/* UNFOLLOW */
async function unfollowUserController(req, res) {
  const follower = req.user.username
  const followee = req.params.username

  const deleted = await followModel.findOneAndDelete({
    follower,
    followee,
    status: "accepted"
  })

  if (!deleted) {
    return res.status(404).json({
      message: "Not following this user"
    })
  }

  return res.json({
    message: "Unfollowed successfully"
  })
}

/* GET STATUS */
async function getFollowStatusController(req, res) {
  const follower = req.user.username
  const followee = req.params.username

  const follow = await followModel.findOne({ follower, followee })

  if (!follow) {
    return res.json({ followStatus: null })
  }

  return res.json({ followStatus: follow.status })
}

/* GET PENDING REQUESTS */
async function getPendingRequestsController(req, res) {
  try {
    const currentUser = req.user.username

    const requests = await followModel.find({
      followee: currentUser,
      status: "pending"
    })

    // Fetch user details for each follower
    const requestsWithUserDetails = await Promise.all(
      requests.map(async (req) => {
        const followerUser = await userModel.findOne(
          { username: req.follower },
          'username profileImage email'
        ).lean()
        return {
          _id: req._id,
          follower: req.follower,
          followee: req.followee,
          status: req.status,
          followerDetails: followerUser,
          createdAt: req.createdAt
        }
      })
    )

    return res.json({ 
      requests: requestsWithUserDetails,
      message: "Pending requests fetched successfully"
    })
  } catch (err) {
    console.error("Get pending requests error:", err)
    return res.status(500).json({ message: "Server error: " + err.message })
  }
}

/* SAVE POST */
async function savePostController(req, res) {
  try {
    const username = req.user.username
    const postId = req.params.postId

    const post = await postModel.findById(postId)
    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    const saved = await savedModel.create({
      user: username,
      post: postId
    })

    return res.status(201).json({
      message: "Post saved successfully",
      saved
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Post already saved"
      })
    }
    return res.status(500).json({ message: "Server error" })
  }
}

/* UNSAVE POST */
async function unsavePostController(req, res) {
  try {
    const username = req.user.username
    const postId = req.params.postId

    const deleted = await savedModel.findOneAndDelete({
      user: username,
      post: postId
    })

    if (!deleted) {
      return res.status(404).json({
        message: "Post not saved"
      })
    }

    return res.json({
      message: "Post unsaved successfully"
    })
  } catch (err) {
    return res.status(500).json({ message: "Server error" })
  }
}

/* GET SAVED POSTS */
async function getSavedPostsController(req, res) {
  try {
    const username = req.user.username

    const saved = await savedModel
      .find({ user: username })
      .populate({
        path: 'post',
        populate: {
          path: 'user',
          select: 'username email bio profileImage'
        }
      })
      .sort({ createdAt: -1 })
      .lean()

    const hydratedSavedPosts = await Promise.all(
      saved.map(async (savedItem) => {
        if (!savedItem.post) {
          return null
        }

        const likeCount = await likeModel.countDocuments({ post: savedItem.post._id })
        const isLiked = await likeModel.exists({
          user: username,
          post: savedItem.post._id
        })

        let followStatus = null
        if (savedItem.post.user?.username && savedItem.post.user.username !== username) {
          const followRecord = await followModel.findOne({
            follower: username,
            followee: savedItem.post.user.username
          })

          if (followRecord) {
            followStatus = followRecord.status
          }
        }

        return {
          ...savedItem,
          post: {
            ...savedItem.post,
            isLiked: !!isLiked,
            isSaved: true,
            followStatus,
            likes: Array.from({ length: likeCount })
          }
        }
      })
    )

    const filteredSavedPosts = hydratedSavedPosts.filter(Boolean)

    return res.json({
      message: "Saved posts fetched successfully",
      saved: filteredSavedPosts,
      count: filteredSavedPosts.length
    })
  } catch (err) {
    return res.status(500).json({ message: "Server error" })
  }
}

/* GET USER STATS (followers and following count) */
async function getUserStatsController(req, res) {
  try {
    const username = req.params.username || req.user.username
    
    // Get user ObjectId by username
    const targetUser = await userModel.findOne({ username })
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Count followers (people following this user)
    const followersCount = await followModel.countDocuments({
      followee: username,
      status: "accepted"
    })

    // Count following (people this user is following)
    const followingCount = await followModel.countDocuments({
      follower: username,
      status: "accepted"
    })

    // Count posts by user ObjectId (not username)
    const postsCount = await postModel.countDocuments({
      user: targetUser._id
    })

    return res.json({
      message: "User stats fetched successfully",
      username,
      followers: followersCount,
      following: followingCount,
      posts: postsCount
    })
  } catch (err) {
    console.error("Get user stats error:", err)
    return res.status(500).json({ message: "Server error" })
  }
}

/* SEARCH USERS */
async function searchUsersController(req, res) {
  try {
    const currentUsername = req.user.username
    const query = (req.query.q || '').trim()

    if (!query) {
      return res.json({ users: [] })
    }

    // Case-insensitive regex search on username and bio
    const regex = new RegExp(query, 'i')
    const users = await userModel
      .find({
        $or: [{ username: regex }, { bio: regex }],
        username: { $ne: currentUsername } // exclude self
      })
      .select('username bio profileImage')
      .limit(20)
      .lean()

    // Attach follow status for each result
    const enriched = await Promise.all(
      users.map(async (u) => {
        const followRecord = await followModel.findOne({
          follower: currentUsername,
          followee: u.username
        })
        return {
          ...u,
          followStatus: followRecord ? followRecord.status : null
        }
      })
    )

    return res.json({ users: enriched })
  } catch (err) {
    console.error('Search users error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  followUserController,
  acceptFollowController,
  rejectFollowController,
  unfollowUserController,
  getFollowStatusController,
  getPendingRequestsController,
  savePostController,
  unsavePostController,
  getSavedPostsController,
  getUserStatsController,
  searchUsersController
}
