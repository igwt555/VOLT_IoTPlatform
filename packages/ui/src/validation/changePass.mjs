import { helpers, required, sameAs } from '@vuelidate/validators';

export const changePass = password => ({
  password: {
    required: helpers.withMessage('Password is required', required),
  },
  cpassword: {
    required: helpers.withMessage('Confirm password is required', required),
    sameAs: helpers.withMessage('Passwords do not match', sameAs(password)),
  },
});
