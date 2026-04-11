const express = require('express')
const commentRouter = express.Router()
const commentController = require('../controllers/comment.controller')
const identifyUser = require('../middlewares/auth.middlewares')

/* 
POST /api/comments/:postId [protected]
Create a comment on a post
Private route, only authenticated user can create a comment
*/
commentRouter.post('/:postId', identifyUser, commentController.createCommentController)

/* 
GET /api/comments/:postId
Get all comments for a post
Public route
*/
commentRouter.get('/:postId', commentController.getCommentsController)

/* 
DELETE /api/comments/:commentId [protected]
Delete a comment
Private route, only the comment author can delete
*/
commentRouter.delete('/:commentId', identifyUser, commentController.deleteCommentController)

module.exports = commentRouter
