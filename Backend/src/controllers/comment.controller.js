const commentModel = require('../models/comment.model')
const postModel = require('../models/post.model')

async function createCommentController(req, res) {
    try {
        const { text } = req.body
        const postId = req.params.postId
        const username = req.user.username

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment text is required"
            })
        }

        const post = await postModel.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        const comment = await commentModel.create({
            user: username,
            post: postId,
            text: text.trim()
        })

        res.status(201).json({
            message: "Comment created successfully",
            comment
        })
    } catch (error) {
        res.status(500).json({
            message: "Unable to create comment",
            error: error.message
        })
    }
}

async function getCommentsController(req, res) {
    try {
        const postId = req.params.postId

        const post = await postModel.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        const comments = await commentModel.find({ post: postId }).sort({ createdAt: -1 })

        res.status(200).json({
            message: "Comments fetched successfully",
            comments,
            count: comments.length
        })
    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch comments",
            error: error.message
        })
    }
}

async function deleteCommentController(req, res) {
    try {
        const commentId = req.params.commentId
        const username = req.user.username

        const comment = await commentModel.findById(commentId)
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            })
        }

        if (comment.user !== username) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            })
        }

        await commentModel.findByIdAndDelete(commentId)

        res.status(200).json({
            message: "Comment deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Unable to delete comment",
            error: error.message
        })
    }
}

module.exports = {
    createCommentController,
    getCommentsController,
    deleteCommentController
}
