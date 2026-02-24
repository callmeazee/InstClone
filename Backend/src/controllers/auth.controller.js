
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')


async  function registerController (req,res){
    const{email, username, password, bio, profileImage} = req.body

//    const isUserExistByEmail = await userModel.findOne(email)

//    if(isUserExistByEmail){
//     return res.status(409).json({
//         messgae: 'User already exist with same email'
//     })
//    }

//    const isUserExistByUsername = await userModel.findOne(username)

//    if(isUserExistByUsername){
//     return res.status(409).json({
//         messgae: "username already exists "
//     })
//    }

   const isUserExist = await userModel.findOne({
    $or:[
        {username},
        {email}
    ]
   })
   if(isUserExist){
    return res.status(409).json({
        message: "User already exist" + (isUserExist).email === email ? "email already exist": 'username already exist'
    })
   }
   const hash = crypto.createHash('sha256').update(password).digest('hex')
   const user = await userModel.create({
    username, email, bio, profileImage, 
    password: hash
   })
   const token = jwt.sign({
    id: user._id
    
   }, process.env.JWT_SECRET_KEY, {expiresIn: '1d'})

   res.cookie('token', token)

   res.status(201).json({
    message: "user register succesfully",
    user:{
        email: user.email,
        username: user.username,
        bio: user.bio,
        profileImage: user.profileImage
    }
   })
   
}



async function loginController (req,res) {
    const {username, email, password} = req.body

    const user = await userModel.findOne({
        $or:[
            {
                
                email: email 


            },
            {
               
                username: username  
            },

        ]
    })
    if(!user){
        return res.status(404).json({
            message: 'user not found' 
        })
    }
    const hash = crypto.createHash('sha256').update(password).digest('hex')
    const isPasswordValid = hash == user.password
   if(!isPasswordValid){
    res.status(401).json({
        message: "invalid password"
    })
   }
     const token =jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET_KEY,
      {expiresIn: "1d"}
    )
    res.cookie("token", token)

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            username: user.username,
            email: user.email,
            bio: user.bio,
            profileImage: user.profileImage
        }
    })
}

module.exports = {registerController, loginController}

