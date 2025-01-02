import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import { BackupUser, User } from '../models/userModel.js'
import { Add, BackupAdd } from '../models/addModel.js'

export const loginController = async (req, res, next) => {
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
      { expiresIn: '1d' }
    )
    res.json({ jwToken })
  } catch (error) {
    next(error)
  }
}

export const registerController = async (req, res, next) => {
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

export const deleteUserController = async (req, res, next) => {
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

    const userAdds = await Add.find({ owner: id })

    const backupAdds = userAdds.map((add) => add.toObject())

    await BackupAdd.insertMany(backupAdds)

    await Add.deleteMany({ owner: id })

    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}

export const getUserController = async (req, res, next) => {
  try {
    const { userId } = req

    const user = await User.findById(userId)

    if (!user) {
      const error = createHttpError(404, 'User not found')
      next(error)
      return
    }

    res.json({ userId: user._id })
  } catch (error) {
    next(error)
  }
}
