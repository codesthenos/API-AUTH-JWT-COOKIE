import createHttpError from 'http-errors'

export const isUserSelf = (req, res, next) => {
  try {
    const { id } = req.params

    if (req.userId !== id) {
      const error = createHttpError(403, 'Forbidden, not your profile')
      next(error)
      return
    }

    next()
  } catch (error) {
    next(error)
  }
}
