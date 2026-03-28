const postModel = require('../models/post.model')
const Imagekit = require("@imagekit/nodejs")
const jwt = require('jsonwebtoken')
const likeModel = require('../models/like.model')


const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})





async function createPostController(req,res){
    
        
    // console.log(decoded)

    const file = await imagekit.files.upload({
        file: await Imagekit.toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: "Test",
        folder: "cohort2-insta-clone-posts"

    })

    const post = await postModel.create({
        caption: req.body.caption,
        imgUrl: file.url,
        user: req.user.id
    })
    res.status(201).json({
        message: "Post created Successfully",
        post
    })
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

async function likePostController(req,res){
    const username = req.user.username
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }



    // if(post.likes.includes(username)){
    //     return res.status(400).json({
    //         message: "You have already liked this post"
    //     })
    // }
    // post.likes.push(username)
    // await post.save()
    // res.status(200).json({
    //     message: "Post liked successfully",
    //     post
    // })

const like = await likeModel.create({
    post: postId,
    username: username
})
res.status(200).json({
    message: "Post liked successfully",
    like
})


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

const likeRecord = await likeModel.findOne({
    post: postId,
    username: username
})
if(!likeRecord){
    return res.status(400).json({
        message: "You have not liked this post"     
    })
}
await likeRecord.remove()
res.status(200).json({
    message: "Post unliked successfully"
})
}

module.exports = {createPostController, getPostController, getPostDetailsController, likePostController, unlikePostController}