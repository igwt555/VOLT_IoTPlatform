import multer from 'multer';
import os from 'os';
import getUserFromToken from './helpers/getUserFromToken.mjs';

const tmpfsPath = os.tmpdir();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, tmpfsPath);
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

export const upload = multer({ storage });

export const globalErrorHandler = (error, req, res, _next) => {
  console.error(`Err in ${req.url}`, error);
  // TODO: Manually notify airbrake/sentry
  return res.status(error.status || 500).json({ error: { success: false, message: error.message || 'An expected error occured' } });
};

export const setCurrentUser = async (req, res, next) => {
  if (!req.header('authorization')) return next();
  const token = req.header('authorization').replace(/^Bearer\s+/, '');
  // look up the user based on the token
  const user = await getUserFromToken(token);
  // append the user object to the request object
  req.user = user;
  // call next middleware in the stack
  return next();
};
