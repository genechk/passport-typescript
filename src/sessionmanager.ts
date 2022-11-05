import merge from 'utils-merge';

import type {
  LoginOptions,
  LogoutOptions,
  Request,
  SerializeUser,
  SessionOptions,
  User,
} from '@types';

class SessionManager {
  constructor(
    options?: SessionOptions | SerializeUser,
    serializeUser?: SerializeUser,
  ) {
    if (typeof options == 'function') {
      serializeUser = options;
      options = undefined;
    }
    options = (options as SessionOptions) || ({} as SessionOptions);

    this._key = options.key || 'passport';
    this._serializeUser = serializeUser;
  }

  private _key: string;
  private _serializeUser?: SerializeUser;

  logIn(
    req: Request,
    user: User,
    options: LoginOptions,
    cb: (err?: Error | 'pass') => void,
  ) {
    if (typeof options == 'function') {
      cb = options;
      options = {};
    }
    options = options || {};

    if (!req.session) {
      return cb(
        new Error(
          'Login sessions require session support. Did you forget to use `express-session` middleware?',
        ),
      );
    }

    const prevSession = req.session;

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(err => {
      if (err) {
        return cb(err);
      }

      this._serializeUser!<User>(
        user,
        req,
        (err: Error | null | 0 | 'pass' | undefined, obj?: User) => {
          if (err) {
            return cb(err);
          }
          if (options.keepSessionInfo) {
            merge(req.session, prevSession);
          }
          const session = req.session!;
          if (!session[this._key]) {
            session[this._key] = {};
          }
          // store user information in session, typically a user id
          session[this._key].user = obj;
          // save the session before redirection to ensure page
          // load does not happen before session is saved
          session.save(err => {
            if (err) {
              return cb(err);
            }
            cb();
          });
        },
      );
    });
  }

  logOut(req: Request, options: LogoutOptions, cb: (err?: Error) => void) {
    if (typeof options == 'function') {
      cb = options;
      options = {};
    }
    options = options || {};

    if (!req.session) {
      return cb(
        new Error(
          'Login sessions require session support. Did you forget to use `express-session` middleware?',
        ),
      );
    }

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    if (req.session[this._key]) {
      delete req.session![this._key].user;
    }
    const prevSession = req.session;

    req.session.save((err?: Error) => {
      if (err) {
        return cb(err);
      }

      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session!.regenerate((err?: Error) => {
        if (err) {
          return cb(err);
        }
        if (options.keepSessionInfo) {
          merge(req.session, prevSession);
        }
        cb();
      });
    });
  }
}

export default SessionManager;
