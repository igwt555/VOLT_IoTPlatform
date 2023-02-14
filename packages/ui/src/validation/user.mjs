import { required, helpers, email, sameAs, minLength } from '@vuelidate/validators';

export const userValidations = password => ({
  full_name: {
    required: helpers.withMessage('Full Name is required', required),
    minLength: helpers.withMessage('Full Name must be at least 3 characters', minLength(3)),
  },
  role: {
    required: helpers.withMessage('Role is required', required),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
  },
  confirm_password: {
    required: helpers.withMessage('Password confirmation is required', required),
    sameAs: helpers.withMessage('Confirm password must be same as password', sameAs(password)),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Invalid email', email),
  },
  organization_id: {
    required: helpers.withMessage('Account is required', required),
  },
});

export const accountSettingSchema = () => ({
  name: {
    required: helpers.withMessage('Fullname is required', required),
  },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Invalid email', email),
  },
});
