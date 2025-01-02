import express from 'express'
import cookieParser from 'cookie-parser'
import createHttpError from 'http-errors'
import morgan from 'morgan'
import cors from 'cors'
import {
  login,
  logout,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from './userController.js'
import { isUserLogged } from './middlewares/userLogged.js'
import { isUserSelf } from './middlewares/userSelf.js'
import { bodyValidator } from './middlewares/validators.js'
import { updateUserZodSchema, userZodSchema } from './lib/zodSchemas.js'

export const app = express()

// MAIN MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))
app.use(cors({ origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://codesthenos.github.io'] }))

// USER AUTH
app.post('/login', bodyValidator({ schema: userZodSchema }), login)
app.post('/logout', logout)
// USER CRUD
app.post('/users', bodyValidator({ schema: userZodSchema }), createUser)
app.get('/users/:id', isUserLogged, getUser)
app.delete('/users/:id', isUserLogged, isUserSelf, deleteUser)
app.put('/users/:id', isUserLogged, isUserSelf, bodyValidator({ schema: updateUserZodSchema }), updateUser)

// 404 MIDDLEWARE
app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'))
})
// ERROR MIDDLEWARE
app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({ error: error.message })
})
