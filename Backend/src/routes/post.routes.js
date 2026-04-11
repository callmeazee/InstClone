const express = require('express')
const postRouter = express.Router()
const postController = require('../controllers/post.controller')
const multer = require("multer")
const upload = multer({storage: multer.memoryStorage()})
const identifyUser = require('../middlewares/auth.middlewares')
/* POST  /api/posts [protected]
req.body = {caption, image-field}
*/

/* 
POST /api/posts 
Create a post with caption and image, also the post should be associated with the user that is creating the post
Private route, only authenticated user can create a post
*/
/* @route GET /api/posts/feed
@desc get the feed of the authenticated user, the feed should contain posts from the users that the authenticated user is following
@access public
*/
postRouter.get('/feed', postController.getFeedController)

/* LIKE /api/posts/like/:postId
  like a post with the given id
Private route, only authenticated user can like a post
*/
postRouter.post('/like/:postId', identifyUser, postController.likePostController)

/* @route POST /api/posts/unlike/:postId
@desc unlike a post with the given id
@access private
*/
postRouter.post('/unlike/:postId', identifyUser, postController.unlikePostController)

/* GET  /api/posts/details/:postid
  return an detail about specific post with id, also check weather the post belong to the user that is requesting 
Private route, only authenticated user can get their post details
*/
postRouter.get('/details/:postId', identifyUser, postController.getPostDetailsController)

postRouter.post('/', upload.single("image"),identifyUser, postController.createPostController)

/* 
GET /api/posts/ [protected] 
get all posts of the user that is requesting, also check weather the post belong to the user that is requesting
Private route, only authenticated user can get their posts
*/

postRouter.get('/',identifyUser, postController.getPostController)

/* @route DELETE /api/posts/:postId
@desc delete a post with the given id, also check weather the post belong to the user that is requesting 
@access private   
*/
postRouter.delete('/:postId', identifyUser, postController.deletePostController)



module.exports = postRouter