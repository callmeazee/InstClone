const postModel = require('../models/post.model')
const Imagekit = require("@imagekit/nodejs")
const likeModel = require('../models/like.model')


const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})





async function createPostController(req,res){
    if(!req.file){
        return res.status(400).json({
            message: "Image file is required"
        })
    }

    if(!process.env.IMAGEKIT_PRIVATE_KEY){
        return res.status(500).json({
            message: "Image upload service is not configured"
        })
    }

    try{
        const file = await imagekit.files.upload({
            file: await Imagekit.toFile(Buffer.from(req.file.buffer), req.file.originalname || 'upload'),
            fileName: req.file.originalname || `post-${Date.now()}`,
            folder: "cohort2-insta-clone-posts"
        })

        const post = await postModel.create({
            caption: req.body.caption?.trim() || "",
            imgUrl: file.url,
            user: req.user.id
        })

        res.status(201).json({
            message: "Post created Successfully",
            post
        })
    }catch(error){
        console.error("Create post error:", error)
        res.status(500).json({
            message: "Failed to create post"
        })
    }
}

async function getPostController(req, res) {

  
    const userId = req.user.id
    const posts = await postModel.find({
        user: userId
    })
    res.status(200).json({
        message: "Posts Fetched Successfully",
        posts
    })
    
}


async function getPostDetailsController(req,res){
    
    const userId = req.user.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }

    const isValidUser = post.user.toString() === userId
    if(!isValidUser){
        return res.status(403).json({
            message: "You are not authorized to view this post"
        })
    }
    res.status(200).json({
        message: "Post details fetched successfully",
        post
    })
}

// async function likePostController(req,res){
//     const username = req.user.username
//     const postId = req.params.postId

//     const post = await postModel.findById(postId)

//     if(!post){
//         return res.status(404).json({
//             message: "Post not found"
//         })
//     }




//     // if(post.likes.includes(username)){
//     //     return res.status(400).json({
//     //         message: "You have already liked this post"
//     //     })
//     // }
//     // post.likes.push(username)
//     // await post.save()
//     // res.status(200).json({
//     //     message: "Post liked successfully",
//     //     post
//     // })

// const like = await likeModel.create({
//     post: postId,
//     username: username
// })
// res.status(200).json({
//     message: "Post liked successfully",
//     like
// })


// }

async function likePostController(req, res) {
    try {
        const username = req.user.username; // Ensure this exists in your JWT
        const postId = req.params.postId;

        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Fix: Use 'user' to match your Schema
        const like = await likeModel.create({
            post: postId,
            user: username 
        });

        res.status(200).json({
            message: "Post liked successfully",
            like
        });

    } catch (error) {
        // Handle the Unique Index constraint (Error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already liked this post"
            });
        }
        
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

async function unlikePostController(req,res){
    const username = req.user.username
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }

    // if(!post.likes.includes(username)){
    //     return res.status(400).json({
    //         message: "You have not liked this post"
    //     })
    // }
    // const index = post.likes.indexOf(username)
    // post.likes.splice(index, 1)
    // await post.save()
    // res.status(200).json({
    //     message: "Post unliked successfully",
    //     post
    // })

const likeRecord = await likeModel.findOneAndDelete({
    post: postId,
    user: username
})
if(!likeRecord){
    return res.status(400).json({
        message: "You have not liked this post"     
    })
}
res.status(200).json({
    message: "Post unliked successfully"
})
}

async function deletePostController(req,res){
    const userId = req.user.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }

    const isValidUser = post.user.toString() === userId
    if(!isValidUser){
        return res.status(403).json({
            message: "You are not authorized to delete this post"
        })
    }
    await postModel.findByIdAndDelete(postId)
    res.status(200).json({
        message: "Post deleted successfully"
    })
}

async function getFeedController(req, res) {
    const user = req.user
    const username = user?.username
    const followModel = require('../models/follow.model')
    const savedModel = require('../models/saved.model')

    // Privacy-First Feed: only show posts from users the current user follows (accepted)
    // plus the user's own posts
    const acceptedFollows = await followModel.find({
        follower: username,
        status: 'accepted'
    }).select('followee').lean()

    const followedUsernames = acceptedFollows.map(f => f.followee)
    // Include the current user's own posts in their feed
    const allowedUsernames = [...followedUsernames, username]

    // Find all users (by ObjectId) whose usernames are in the allowed list
    const userModel = require('../models/user.model')
    const allowedUsers = await userModel.find({
        username: { $in: allowedUsernames }
    }).select('_id').lean()
    const allowedUserIds = allowedUsers.map(u => u._id)

    const rawPosts = await postModel
        .find({ user: { $in: allowedUserIds } })
        .sort({ _id: -1 })
        .populate('user')

    const posts = await Promise.all(
        rawPosts.map(async (post) => {
            // Check if current user liked this post
            let isLiked = false
            if (username) {
                isLiked = await likeModel.exists({
                    user: username,
                    post: post._id,
                })
            }

            // Get like count
            const likeCount = await likeModel.countDocuments({ post: post._id })

            // Check follow status for post creator
            let followStatus = null
            if (username && post.user?.username && username !== post.user.username) {
                const followRecord = await followModel.findOne({
                    follower: username,
                    followee: post.user.username
                })
                if (followRecord) {
                    followStatus = followRecord.status
                }
            }

            // Check if current user saved this post
            let isSaved = false
            if (username) {
                isSaved = await savedModel.exists({
                    user: username,
                    post: post._id,
                })
            }

            post.isLiked = !!isLiked
            post.followStatus = followStatus
            post.isSaved = !!isSaved
            post.likes = Array(likeCount)

            // Convert to plain object FIRST so Mongoose doesn't strip
            // non-schema fields (isLiked, likes, isSaved, followStatus)
            // then re-attach them on top of the plain object.
            const postObj = post.toObject ? post.toObject() : { ...post }
            postObj.isLiked = !!isLiked
            postObj.followStatus = followStatus
            postObj.isSaved = !!isSaved
            postObj.likes = Array.from({ length: likeCount })

            return postObj
        })
    )

    res.status(200).json({
        message: 'Posts fetched successfully',
        posts
    })
}

module.exports = {createPostController, getPostController, getPostDetailsController, likePostController, unlikePostController, deletePostController, getFeedController}
