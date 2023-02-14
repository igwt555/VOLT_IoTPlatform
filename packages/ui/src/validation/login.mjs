import { required, helpers, email } from '@vuelidate/validators';

export const loginSchema = {
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Invalid email', email),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
  },
};

export const loginEmailSchema = {
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Invalid email', email),
  },
};
