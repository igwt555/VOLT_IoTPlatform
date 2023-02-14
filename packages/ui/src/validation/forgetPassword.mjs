import { required, helpers, email } from '@vuelidate/validators';

export const forgetPasswordSchema = {
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Email is required', email),
  },
};
