require('dotenv').config()

const express = require('express')
const fs = require('fs')
const path = require('path')
const connectToDb = require('./config/database')
const cookieParser = require('cookie-parser')
const cors = require('cors')





/* require routes */
const authRouter = require('./routes/auth.routes')
const postRouter = require('./routes/post.routes')
const userRouter = require('./routes/user.routes')
const commentRouter = require('./routes/comment.routes')




const app = express()
app.set('trust proxy', 1)
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
    .flatMap((origin) => {
        if (/^https?:\/\//i.test(origin)) {
            return [origin]
        }

        return [`https://${origin}`, `http://${origin}`]
    })

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])]
const frontendDistPath = path.resolve(__dirname, '../../Frontend/dist')
const hasFrontendBuild = fs.existsSync(frontendDistPath)
app.use(cors((req, callback) => {
    const requestOrigin = req.header('Origin')
    const sameOrigin = `${req.protocol}://${req.get('host')}`
    const isAllowedOrigin = !requestOrigin || allowedOrigins.includes(requestOrigin) || requestOrigin === sameOrigin

    callback(null, {
        origin: isAllowedOrigin,
        credentials: true
    })
}))


/* using routes */
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)
app.use('/api/users', userRouter)
app.use('/api/comments', commentRouter)

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok'})
})

if (hasFrontendBuild) {
    app.use(express.static(frontendDistPath))

    app.get(/^(?!\/api|\/health).*/, (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'))
    })
} else {
    app.get('/', (req, res) => {
        res.send('API is running...')
    })
}

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
