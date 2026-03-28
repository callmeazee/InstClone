const followModel = require("../models/follow.model")
const userModel = require("../models/user.model")

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
      return res.status(409).json({
        message: `Already ${existing.status}`,
        follow: existing
      })
    }

    return res.status(500).json({ message: "Server error" })
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
    return res.json({ status: "none" })
  }

  return res.json({ status: follow.status })
}

/* GET PENDING REQUESTS */
async function getPendingRequestsController(req, res) {
  const currentUser = req.user.username

  const requests = await followModel.find({
    followee: currentUser,
    status: "pending"
  })

  return res.json({ requests })
}

module.exports = {
  followUserController,
  acceptFollowController,
  rejectFollowController,
  unfollowUserController,
  getFollowStatusController,
  getPendingRequestsController
}