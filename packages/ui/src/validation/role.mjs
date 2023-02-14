import { required, helpers } from '@vuelidate/validators';

export const role = {
  role: {
    required: helpers.withMessage('Role is required', required),
  },
  description: {
    required: helpers.withMessage('Description is required', required),
  },
};
