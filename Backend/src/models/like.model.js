const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
    user:{
        type: String,
        
        required: [true, "user id is required"]
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        // type: String,
        ref: 'posts',
        required: [true, "post id is required"]
    }
},{
    timestamps: true
})

//this index is to make sure that same user like the same post only once 
likeSchema.index({user: 1, post: 1}, {unique: true})

const likeModel = mongoose.model('likes', likeSchema)

module.exports = likeModel