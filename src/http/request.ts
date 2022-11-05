import type { LoginOptions, LogoutOptions, Request, User } from '@types';

const req = {} as Request;

/**
 * Initiate a login session for `user`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logIn(user, { session: false });
 *
 *     req.logIn(user, function(err) {
 *       if (err) { throw err; }
 *       // session saved
 *     });
 *
 * @param {User} user
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.login = req.logIn = function <
  Callback extends (err?: Error | null | 'pass') => void,
  //   T extends LoginOptions | Callback,
>(user: User, options: LoginOptions | Callback, done?: Callback) {
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  options = options || {};

  const property = this._userProperty || 'user';
  const session = options.session === undefined ? true : options.session;

  this[property] = user;
  if (session && this._sessionManager) {
    if (typeof done !== 'function') {
      throw new Error('req#login requires a callback function');
    }

    this._sessionManager.logIn(this, user, options, (err?: Error | 'pass') => {
      if (err) {
        this[property] = null;
        return done!(err);
      }
      done!();
    });
  } else {
    done && done();
  }
};

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logout = req.logOut = function (
  options?: LogoutOptions | ((err?: Error) => void),
  done?: (err?: Error) => void,
) {
  if (typeof options === 'function') {
    done = options;
    options = {} as LogoutOptions;
  }
  options = options || ({} as LogoutOptions);

  const property = this._userProperty || 'user';

  this[property] = null;
  if (this._sessionManager) {
    if (typeof done !== 'function') {
      throw new Error('req#logout requires a callback function');
    }

    this._sessionManager.logOut(this, options, done);
  } else {
    done && done();
  }
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function () {
  const property = this._userProperty || 'user';
  return this[property] ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function () {
  return !this.isAuthenticated();
};

export default req;
