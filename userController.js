import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { BackupUser, User } from './userModel.js'

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const formattedUsername = username.toLowerCase().trim()

    const user = await User.findOne({ username: formattedUsername })

    if (!user || !(await user.comparePassword({ password }))) {
      const error = createHttpError(401, 'Invalid credentials')
      next(error)
      return
    }

    const jwToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookies('jwToken', jwToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.json({ userId: user._id })
  } catch (error) {
    next(error)
  }
}

export const createUser = async (req, res, next) => {
  try {
    const { username, password } = req.body

    const formattedUsername = username.toLowerCase().trim()
    const hashedPassword = await User.hashPassword({ password })

    const newUser = new User({ username: formattedUsername, password: hashedPassword })

    const savedUser = await newUser.save()

    res.status(201).json({ message: 'User registered', user: savedUser })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const userToDelete = await User.findById(id)

    if (!userToDelete) {
      const error = createHttpError(404, 'User not found')
      next(error)
      return
    }

    const backupUser = new BackupUser({
      ...userToDelete.toObject(),
      _id: userToDelete._id
    })

    await backupUser.save()

    await User.findByIdAndDelete(id)

    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      const error = createHttpError(404, 'User not found')
      next(error)
      return
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    // REVIEW
    const { userId } = req
    const { username, password } = req.body

    const formattedUsername = username.toLowerCase().trim()
    const hashedPassword = await User.hashPassword({ password })

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: formattedUsername, password: hashedPassword },
      { new: true }
    )

    if (!updatedUser) {
      const error = createHttpError(404, 'User not found')
      next(error)
      return
    }

    res.json({ message: 'User updated', user: updatedUser })
  } catch (error) {
    next(error)
  }
}
