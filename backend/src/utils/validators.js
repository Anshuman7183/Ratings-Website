import { body } from 'express-validator'

export const nameValidator = body('name')
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be 20-60 characters')

export const addressValidator = body('address')
  .isLength({ max: 400 })
  .withMessage('Address max 400 chars')

export const emailValidator = body('email').isEmail().withMessage('Invalid email')

export const passwordValidator = body('password')
  .isLength({ min: 8, max: 16 }).withMessage('Password 8-16 chars')
  .matches(/[A-Z]/).withMessage('At least one uppercase')
  .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('At least one special char')

export const ratingValueValidator = body('value')
  .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1..5')
