async function idenfityUser(req,res,next){
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Unauthorizes access"
        })
    }
    let decoded = null

    try{
        
         decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    }catch(err){
        return res.status(401).json({
            message: 'Token invalid, user not authorised'
        })
    }
    req.user = decoded
    next()
}

module.exports = idenfityUser