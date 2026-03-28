const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
    follower:{
        type: String
      
     },
     followee:{
        type: String
      
     },
     status:{
        type: String,
        enum: {values: ['pending', 'accepted', 'rejected'], message: 'status can nly be pending, accepted or rejected'},
        default: 'pending'
     } 




},{
    timestamps: true
})

//this index is to make sure that same user follow the same user only once 
followSchema.index({follower: 1, followee: 1}, {unique: true})

const followModel = mongoose.model('follows', followSchema)

module.exports = followModel