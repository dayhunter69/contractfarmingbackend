import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwtConfig.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: Number(user.role) },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.accessTokenExpiry,
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: Number(user.role) },
    jwtConfig.refreshSecret,
    {
      expiresIn: jwtConfig.refreshTokenExpiry,
    }
  );
};
