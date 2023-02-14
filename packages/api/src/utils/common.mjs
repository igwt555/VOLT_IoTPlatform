import cryptoRandomString from 'crypto-random-string';

// eslint-disable-next-line import/prefer-default-export
export const generatePincode = async () => cryptoRandomString({
  length: 5,
  type: 'numeric',
});
