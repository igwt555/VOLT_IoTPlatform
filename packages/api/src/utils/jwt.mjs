import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const { JsonWebTokenError } = jwt;
export const { NotBeforeError } = jwt;
export const { TokenExpiredError } = jwt;
export const decode = promisify(jwt.decode);
export const sign = promisify(jwt.sign);
export const verify = promisify(jwt.verify);
