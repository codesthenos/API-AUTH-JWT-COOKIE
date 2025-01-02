import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

export const isUserLogged = (req, res, next) => {
  try {
    const jwToken = req.get('Authorization') || req.query.jwToken || req.body.jwToken

    if (!jwToken) {
      const error = createHttpError(401, 'Token required')
      next(error)
      return
    }

    const payload = jwt.verify(jwToken, process.env.JWT_SECRET)

    req.userId = payload.id

    if (!req.userId) {
      const error = createHttpError(401, 'Invalid token')
      next(error)
      return
    }

    next()
  } catch (error) {
    next(error)
  }
}
