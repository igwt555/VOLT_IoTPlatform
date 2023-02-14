import { required, helpers } from '@vuelidate/validators';

export default {
  selectedUser: {
    required: helpers.withMessage('User is required', required),
  },
  selectedReservation: {
    required: helpers.withMessage('Reservation type is required', required),
  },
};
