const postModel = require('../models/post.model')
const Imagekit = require("@imagekit/nodejs")
const jwt = require('jsonwebtoken')


const imagekit = new Imagekit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})





async function createPostController(req,res){
    console.log(req.body, req.file)
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Token not provided, Unauthorized access"
        })
    }
    let decoded = null
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }catch(err){
        return res.status(401).json({
            message: "User not authorized"
        })
    }
        
    // console.log(decoded)

    const file = await imagekit.files.upload({
        file: await Imagekit.toFile(Buffer.from(req.file.buffer), 'file'),
        fileName: "Test",
        folder: "cohort2-insta-clone-posts"

    })

    const post = await postModel.create({
        caption: req.body.caption,
        imgUrl: file.url,
        user: decoded.id
    })
    res.status(201).json({
        message: "Post created Successfully",
        post
    })
}

async function getPostController(req, res) {

    const token = req.cookies.token
      if(!token){
        return res.status(401).json({
            message: "Unauthorizes access"
        })
    }
    let decoded = null

    try{
        
         decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }catch(err){
        return res.status(401).json({
            message: 'Token invalid'
        })
    }
    const userId = decoded.id
    const posts = await postModel.find({
        user: userId
    })
    res.status(200).json({
        message: "Posts Fetched Successfully",
        posts
    })
    
}


async function getPostDetails(req,res){
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Unauthorizes access"
        })
    }
    let decoded = null

    try{
        
         decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }catch(err){
        return res.status(401).json({
            message: 'Token invalid'
        })
    }
    const userId = decoded.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message: "Post not found"
        })
    }

    const isValidUser = post.user === userId
}


module.exports = {createPostController, getPostController}