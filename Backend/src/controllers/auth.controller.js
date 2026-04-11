

const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')

async  function registerController (req,res){
    const{email, username, password, bio, profileImage} = req.body

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
   
   // Generate default profile image if not provided
   const defaultProfileImage = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
   
   const hash = await bcrypt.hash(password, 10)
   const user = await userModel.create({
    username, 
    email, 
    bio: bio || '', 
    profileImage: defaultProfileImage, 
    password: hash
   })
   const token = jwt.sign({
    id: user._id,
    username: user.username
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

       if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is missing");
    }
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
    }).select('+password')
    if(!user){
        return res.status(404).json({
            message: 'user not found' 
        })
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password)
   if(!isPasswordValid){
   return res.status(401).json({
        message: "invalid password"
    })
   }
     const token =jwt.sign(
      {id:user._id, username: user.username},
      process.env.JWT_SECRET_KEY,
      {expiresIn: "1d"}
    )
    // res.cookie("token", token)

    res.cookie("token", token, {
    httpOnly: true,     // Prevents JavaScript from stealing the token
    secure: false,      // Set to false for localhost (HTTP)
    sameSite: 'lax',    // Allows the cookie to be sent on cross-origin requests from the same site
    maxAge: 24 * 60 * 60 * 1000 ,// 1 day
    path: '/'
});
   

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

async function logoutController(req,res){
    res.clearCookie('token')
    res.json({
        message: "Logged out successfully"
    })
}

async function getMeController(req,res){
    const userId = req.user.id
    const user = await userModel.findById(userId)

    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    res.status(200).json({
        user: {
            username: user.username,
            email: user.email,
            bio: user.bio,
            profileImage: user.profileImage
        }
    })
}

module.exports = {registerController, loginController, getMeController, logoutController}

