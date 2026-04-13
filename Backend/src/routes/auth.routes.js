const express = require('express')

const authRouter = express.Router()

const authController = require('../controllers/auth.controller')

const identifyUser = require('../middlewares/auth.middlewares')
/* 
POST: /api/auth/register 
*/


authRouter.post('/register',authController.registerController )

/* 
POST: /api/auth/login
*username password or email pass
{username: a, email: undefined, password: test} = req.body
*/

authRouter.post('/login', authController.loginController )

/* @route POST: /api/auth/logout
@desc logout the authenticated user
@access private
*/

authRouter.post('/logout', identifyUser, authController.logoutController )    

/* @route GET: /api/auth/me
@desc get the authenticated user details
@access private
*/

authRouter.get('/me', identifyUser, authController.getMeController)
authRouter.get('/get-me', identifyUser, authController.getMeController)




module.exports = authRouter
