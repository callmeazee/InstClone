const jwt = require('jsonwebtoken')

function getTokenFromRequest(req){
    const cookieToken = req.cookies?.token
    if(cookieToken){
        return cookieToken
    }

    const authHeader = req.headers.authorization || req.headers.Authorization
    if(typeof authHeader === 'string' && authHeader.startsWith('Bearer ')){
        return authHeader.slice(7).trim()
    }

    return null
}

async function identifyUser(req,res,next){
    
   
   
     
    //   if (!process.env.JWT_SECRET_KEY) {
    //     throw new Error("JWT_SECRET_KEY is missing");
    // }
    const token = getTokenFromRequest(req)
      
    if(!token){
        return res.status(401).json({
            message: "Authentication token not found"
        })
    }
    let decoded = null
   

    // try{
         
    //      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        
    // }catch(err){
         
    //     return res.status(401).json({
    //         message: 'Token invalid, user not authorised'
    //     })
    // }


    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        return next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return res.status(401).json({
            message: 'Authentication token is invalid or expired',
        });
    }
}

module.exports = identifyUser
