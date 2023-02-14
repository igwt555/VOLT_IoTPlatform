import { required, helpers } from '@vuelidate/validators';

export const organization = {
  organization: {
    required: helpers.withMessage('Organization name is required', required),
  },
  parent_org_id: {
    required: helpers.withMessage('Parent organization is required', required),
  },
};
