/**
 * Module dependencies.
 */
import pause from 'pause';
import type { Stream } from 'stream';

// TODO: Refactor  library to TS as well
// import Strategy from 'passport-strategy';

import type {
  PassportStatic,
  SessionOptions,
  StrategyOptions,
  Strategy as IStrategy,
  Request,
} from '@types';

/**
 * Creates an instance of `Strategy`.
 *
 * @class
 * @api public
 */
class Strategy implements IStrategy {
  /**
   * Authenticate request.
   *
   * This function must be overridden by subclasses.  In abstract form, it always
   * throws an exception.
   *
   * @param {Object} req The request to authenticate.
   * @param {Object} [options] Strategy-specific options.
   * @api public
   */
  authenticate(req: Request, options: StrategyOptions) {
    throw new Error('Strategy#authenticate must be overridden by subclass');
  }
}

/**
 * `SessionStrategy`.
 *
 * @class
 * @api public
 */
class SessionStrategy extends Strategy {
  constructor(
    options?: SessionOptions | PassportStatic['deserializeUser'],
    deserializeUser?: PassportStatic['deserializeUser'],
  ) {
    super();
    if (typeof options === 'function') {
      deserializeUser = options as PassportStatic['deserializeUser'];
      options = undefined;
    }
    options = options || ({} as SessionOptions);

    this.name = 'session';
    this._key = options.key || 'passport';
    this._deserializeUser = deserializeUser!;
  }

  name: string;
  error: (error: Error) => never = (error: Error) => {
    throw error;
  };
  pass = () => {};

  private _key: string;
  private _deserializeUser: PassportStatic['deserializeUser'];

  /**
   * Authenticate request based on the current session state.
   *
   * The session authentication strategy uses the session to restore any login
   * state across requests.  If a login session has been established, `req.user`
   * will be populated with the current user.
   *
   * This strategy is registered automatically by Passport.
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  authenticate(req: Request, options: SessionOptions) {
    if (!req.session) {
      return this.error(
        new Error(
          'Login sessions require session support. Did you forget to use `express-session` middleware?',
        ),
      );
    }
    options = options || {};
    const session = req.session!;

    const self = this;
    let su;
    if (session[this._key]) {
      su = session[this._key].user;
    }

    if (su || su === 0) {
      // NOTE: Stream pausing is desirable in the case where later middleware is
      //       listening for events emitted from request.  For discussion on the
      //       matter, refer to: https://github.com/jaredhanson/passport/pull/106

      const paused = options.pauseStream
        ? pause(req as unknown as Stream)
        : null;
      // @ts-ignore
      this._deserializeUser(su, req, (err, user) => {
        if (err) {
          return this.error(err);
        }
        if (!user) {
          delete session[this._key].user;
        } else {
          var property = req._userProperty || 'user';
          req[property] = user;
        }
        this.pass();
        if (paused) {
          paused.resume();
        }
      });
    } else {
      this.pass();
    }
  }
}

/**
 * Expose `SessionStrategy`.
 */
export default SessionStrategy;
