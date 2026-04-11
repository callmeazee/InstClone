const mongoose = require('mongoose')

const savedSchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, "user is required"]
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
        required: [true, "post id is required"]
    }
}, {
    timestamps: true
})

// Make sure a user can only save a post once
savedSchema.index({user: 1, post: 1}, {unique: true})

const savedModel = mongoose.model('saveds', savedSchema)

module.exports = savedModel
