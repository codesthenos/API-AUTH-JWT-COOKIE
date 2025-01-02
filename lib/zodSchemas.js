import z from 'zod'

export const userZodSchema = z.object({
  username: z.string({
    required_error: 'Provide a username'
  }).email({
    required_error: 'Invalid email'
  }),
  password: z.string({
    required_error: 'Provide a password'
  }).min(6, {
    message: 'Password must have at least 6 characters'
  })
})

export const updateUserZodSchema = userZodSchema.extend({
  username: userZodSchema.shape.username.optional(),
  password: userZodSchema.shape.password.optional()
})