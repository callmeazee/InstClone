

const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')

function getCookieOptions() {
    // If we're using a remote deployed client, we MUST use secure and SameSite=None
    const isDeployed = !!process.env.CLIENT_ORIGINS || process.env.NODE_ENV === 'production'
    const secure = process.env.COOKIE_SECURE === 'true' || isDeployed
    const sameSite = process.env.COOKIE_SAME_SITE || (secure ? 'none' : 'lax')

    return {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
    }
}

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
        message: isUserExist.email === email ? "Email already exists" : "Username already exists"
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

   res.cookie('token', token, getCookieOptions())

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
    res.cookie("token", token, getCookieOptions());
   

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
    const { maxAge, ...clearCookieOptions } = getCookieOptions()
    res.clearCookie('token', clearCookieOptions)
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
