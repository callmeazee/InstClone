const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true,'username already exist'],
        required: [true, 'username is required'],
    },
    email: {
        type: String,
        unique: [true, 'Email already exist'],
        required: [true, 'email is required']
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        select: false // this is to make sure that password is not returned when we query the user

    },
    bio: String,
    profileImage: {
        type: String,
        default: 'https://ik.imagekit.io/9baqry75t/defaultProfile.jpg'

    }
})
const userModel = mongoose.model('users', userSchema)

module.exports = userModel