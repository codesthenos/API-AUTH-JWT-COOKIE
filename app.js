import path from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import createHttpError from 'http-errors'
import morgan from 'morgan'
import cors from 'cors'
import { login, logout } from './userController.js'
import { bodyValidator } from './middlewares/validators.js'
import { userZodSchema } from './lib/zodSchemas.js'
import { usersRouter } from './usersRouter.js'

export const app = express()

// MAIN MIDDLEWARES
app.use(express.static(path.join(import.meta.dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://codesthenos.github.io'],
  credentials: true
}))

// DOCS as HOME
app.get('/', (req, res, next) => {
  res.sendFile(path.join(import.meta.dirname, 'public', 'docs.html'))
})
// USER AUTH
app.post('/login', bodyValidator({ schema: userZodSchema }), login)
app.post('/logout', logout)
// USER ROUTER
app.use('/users', usersRouter)

// 404 MIDDLEWARE
app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'))
})
// ERROR MIDDLEWARE
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({ error: error.message })
})
