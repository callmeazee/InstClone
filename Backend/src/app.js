const express = require('express')
const connectToDb = require('./config/database')
const cookieParser = require('cookie-parser')





/* require routes */
const authRouter = require('./routes/auth.routes')
const postRouter = require('./routes/post.routes')
const userRouter = require('./routes/user.routes')




const app = express()
connectToDb()
app.use(express.json())
app.use(cookieParser())


/* using routes */
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/users', userRouter)

// [
//     {
//        status: "pending"
//     },
//     {
//       status: "delivered"
//     },
//     {
//       status: 'cancelled'
//     }
// ]


module.exports = app