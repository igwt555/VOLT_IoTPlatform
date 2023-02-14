import jwt from 'jsonwebtoken';
import * as UserService from '../services/user.mjs';

const { JWT_SECRET_KEY } = process.env;

const getUserFromToken = async token => {
  if (!token) return null;
  const decode = await jwt.verify(token, JWT_SECRET_KEY);
  if (decode) {
    const { sub } = decode;
    const user = await UserService.getUserById(sub);
    return user;
  }
  return null;
};

export default getUserFromToken;
