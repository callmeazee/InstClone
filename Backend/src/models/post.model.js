const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    caption:{
        type: String,
        default: ""
    },
    imgUrl:{
        type: String,
        required: [true, "ImgURL is required"]
    },
    user:{
        ref:'users',
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "user id is required "]
    }

})


const postModel = mongoose.model('posts', postSchema)


module.exports = postModel