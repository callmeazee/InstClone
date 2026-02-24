const express = require('express')
const connectToDb = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.routes')
const postRouter = require('./routes/post.routes')
const app = express()
connectToDb()

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)

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