const express = require('express')
const identifyUser = require('../middlewares/auth.middlewares')
const userController = require('../controllers/user.controller')

const userRouter = express.Router()

/* 
POST /api/users/follow/:username [protected]
follow a user
Private route, only authenticated user can follow other users

*/
userRouter.post('/follow/:username', identifyUser, userController.followUserController)


/* 
POST /api/users/unfollow/:username [protected]
unfollow a user
Private route, only authenticated user can unfollow other users

*/
userRouter.post('/unfollow/:username', identifyUser, userController.unfollowUserController)


/* 
POST /api/users/accept/:username [protected]
accept a follow request from a user
Private route, only authenticated user can accept follow requests

*/
userRouter.post('/accept/:username', identifyUser, userController.acceptFollowController)

/* 
POST /api/users/reject/:username [protected]
reject a follow request from a user
Private route, only authenticated user can reject follow requests
*/
userRouter.post('/reject/:username', identifyUser, userController.rejectFollowController)


/* 
GET /api/users/status/:username [protected]
get the follow status of a user
Private route, only authenticated user can get follow status
*/
userRouter.get('/status/:username', identifyUser, userController.getFollowStatusController)

/* 
GET /api/users/requests [protected]
get pending follow requests
Private route, only authenticated user can get pending requests
*/
userRouter.get('/requests', identifyUser, userController.getPendingRequestsController)

/* 
POST /api/users/save/:postId [protected]
save a post
Private route, only authenticated user can save posts
*/
userRouter.post('/save/:postId', identifyUser, userController.savePostController)

/* 
POST /api/users/unsave/:postId [protected]
unsave a post
Private route, only authenticated user can unsave posts
*/
userRouter.post('/unsave/:postId', identifyUser, userController.unsavePostController)

/* 
GET /api/users/saved [protected]
get all saved posts for the current user
Private route, only authenticated user can get their saved posts
*/
userRouter.get('/saved/posts', identifyUser, userController.getSavedPostsController)

/* 
GET /api/users/stats/:username [protected]
get user stats (followers, following, posts count)
Private route, only authenticated user can get user stats
*/
userRouter.get('/stats/:username', identifyUser, userController.getUserStatsController)

/*
GET /api/users/my/stats [protected]
get current user's stats
Private route, only authenticated user can get their own stats
*/
userRouter.get('/my/stats', identifyUser, userController.getUserStatsController)

module.exports = userRouter