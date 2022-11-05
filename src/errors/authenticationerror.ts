/**
 * `AuthenticationError` error.
 *
 * @class
 * @api private
 */
class AuthenticationError extends Error {
  constructor(message: string, status?: number) {
    super(message);

    this.name = 'AuthenticationError';
    this.status = status || 401;
  }

  status: number;
}

// Expose constructor.
export default AuthenticationError;
