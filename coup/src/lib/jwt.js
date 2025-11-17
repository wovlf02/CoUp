// src/lib/jwt.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export function signJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

