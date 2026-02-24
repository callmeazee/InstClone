const express = require('express')
const postRouter = express.Router()
const postController = require('../controllers/post.controller')
const multer = require("multer")
const upload = multer({Storage: multer.memoryStorage})

/* POST  /api/posts [protected]
req.body = {caption, image-field}
*/

/* /api/posts */
postRouter.post('/', upload.single("image"), postController.createPostController)

/* GET /api/posts/ [protected] */

postRouter.get('/', postController.getPostController)

/* GET  /api/posts/details/:postid
  return an detail about specific post with id, also check weather the post belong to the user that is requesting 
*/
postRouter.get('/details/:postId', postController.getPostDetails)
 
module.exports = postRouter