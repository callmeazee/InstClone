const jwt = require('jsonwebtoken')


async function identifyUser(req,res,next){
    
   
   
     
    //   if (!process.env.JWT_SECRET_KEY) {
    //     throw new Error("JWT_SECRET_KEY is missing");
    // }
    const token = req.cookies.token
      
    if(!token){
        return res.status(401).json({
            message: "Token not found - Unauthorizes access"
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
            message: 'Token invalid, user not authorised',
        });
    }
}

module.exports = identifyUser