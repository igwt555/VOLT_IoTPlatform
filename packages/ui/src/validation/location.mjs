import { required, helpers } from '@vuelidate/validators';

export const locationRules = {
  name: {
    required: helpers.withMessage('Location name is required', required),
  },
  organization: {
    required: helpers.withMessage('Account is required', required),
  },
};
