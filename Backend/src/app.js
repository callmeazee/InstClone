require('dotenv').config()

const express = require('express')
const connectToDb = require('./config/database')
const cookieParser = require('cookie-parser')
const cors = require('cors')





/* require routes */
const authRouter = require('./routes/auth.routes')
const postRouter = require('./routes/post.routes')
const userRouter = require('./routes/user.routes')
const commentRouter = require('./routes/comment.routes')




const app = express()
connectToDb()
app.use(express.json())
app.use(cookieParser())

const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://127.0.0.1:5173'
]

const configuredOrigins = (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])]
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))


/* using routes */
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/users', userRouter)
app.use('/api/comments', commentRouter)

app.get('/', (req, res) => {
    res.send('API is running...')
})

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
