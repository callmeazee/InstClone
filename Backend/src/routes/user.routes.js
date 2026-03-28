const express = require('express')
const idenfityUser = require('../middlewares/auth.middlewares')
const userController = require('../controllers/user.controller')

const userRouter = express.Router()

/* 
POST /api/users/follow/:username [protected]
follow a user
Private route, only authenticated user can follow other users

*/
userRouter.post('/follow/:username', idenfityUser, userController.followUserController)


/* 
POST /api/users/unfollow/:username [protected]
unfollow a user
Private route, only authenticated user can unfollow other users

*/
userRouter.post('/unfollow/:username', idenfityUser, userController.unfollowUserController)


/* 
POST /api/users/accept/:username [protected]
accept a follow request from a user
Private route, only authenticated user can accept follow requests

*/
userRouter.post('/accept/:username', idenfityUser, userController.acceptFollowController)

/* 
POST /api/users/reject/:username [protected]
reject a follow request from a user
Private route, only authenticated user can reject follow requests
*/
userRouter.post('/reject/:username', idenfityUser, userController.rejectFollowController)


/* 
GET /api/users/status/:username [protected]
get the follow status of a user
Private route, only authenticated user can get follow status
*/
userRouter.get('/status/:username', idenfityUser, userController.getFollowStatusController)

/* 
GET /api/users/requests [protected]
get pending follow requests
Private route, only authenticated user can get pending requests
*/
userRouter.get('/requests', idenfityUser, userController.getPendingRequestsController)

module.exports = userRouter