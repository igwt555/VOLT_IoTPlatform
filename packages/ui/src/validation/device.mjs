import { required, helpers } from '@vuelidate/validators';

export const device = {
  selectedUser: {
    required: helpers.withMessage('User is required', required),
  },
  reservationType: {
    required: helpers.withMessage('Reservation type is required', required),
  },
};
