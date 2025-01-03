import express from 'express'
import { bodyValidator } from './middlewares/validators.js'
import { updateUserZodSchema, userZodSchema } from './lib/zodSchemas.js'
import { createUser, deleteUser, getUser, updateUser } from './userController.js'
import { isUserLogged } from './middlewares/userLogged.js'
import { isUserSelf } from './middlewares/userSelf.js'

export const usersRouter = express.Router()

usersRouter.post('/', bodyValidator({ schema: userZodSchema }), createUser)

usersRouter.use(isUserLogged)

usersRouter.get('/:id', getUser)

usersRouter.use('/:id', isUserSelf)

usersRouter.delete('/:id', deleteUser)
usersRouter.put('/:id', bodyValidator({ schema: updateUserZodSchema }), updateUser)