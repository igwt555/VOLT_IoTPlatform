/**
 *
 * @param fn
 * handle errors without using try catch
 */
// eslint-disable-next-line import/prefer-default-export
export const errorHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
