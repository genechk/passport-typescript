/**
 * Module dependencies.
 */
import type { Handler } from 'express';
import type { IncomingMessage } from 'http';

import SessionStrategy from './strategies/session';
import SessionManager from './sessionmanager';
import connect from './framework/connect';
import {
  AuthenticateOptions as IAuthenticateOptions,
  Deserializer,
  IAuthenticator,
  IFramework,
  Info,
  InfoTransformer,
  InitializeOptions,
  Request,
  Serializer,
  User,
  StrategyCreated,
} from '@types';

/**
 * `Authenticator` class.
 *
 * @api public
 */
class Authenticator<
  InitializeRet = Handler,
  AuthenticateRet extends any = any,
  AuthorizeRet extends any = AuthenticateRet,
  AuthorizeOptions extends IAuthenticateOptions = IAuthenticateOptions,
> implements IAuthenticator
{
  //   IAuthenticator<InitializeRet, AuthenticateRet, AuthorizeRet>
  constructor() {
    this._key = 'passport';
    this._strategies = {};
    this._serializers = [];
    this._deserializers = [];
    this._infoTransformers = [];
    this._framework = {} as IFramework;

    this.init();
  }

  _key: string;
  _strategies: Record<
    string,
    StrategyCreated<Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>>
  >;
  _serializers: Serializer<any, any>[];
  _deserializers: Deserializer<any, any>[];
  _infoTransformers: InfoTransformer[];
  _framework: IFramework<InitializeRet, AuthenticateRet, AuthorizeRet>;

  _sm?: SessionManager;
  _userProperty?: string;

  /**
   * Initialize authenticator.
   *
   * @api protected
   */
  init() {
    this.framework(
      // FIXIT
      connect() as IFramework<InitializeRet, AuthenticateRet, AuthorizeRet>,
    );
    this.use(
      new SessionStrategy(
        { key: this._key },
        this.deserializeUser.bind(this),
      ) as unknown as StrategyCreated<
        Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>
      >,
    );
    this._sm = new SessionManager(
      { key: this._key },
      this.serializeUser.bind(this),
    );
  }

  /**
   * Utilize the given `strategy` with optional `name`, overridding the strategy's
   * default name.
   *
   * Examples:
   *
   *     passport.use(new TwitterStrategy(...));
   *
   *     passport.use('api', new http.BasicStrategy(...));
   *
   * @param {String|Strategy} name
   * @param {Strategy} strategy
   * @return {Authenticator} for chaining
   * @api public
   */
  use<
    T extends string | Strategy,
    Strategy extends StrategyCreated<
      Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>
    >,
  >(
    name: T extends string ? string : Strategy | string,
    strategy?: T extends string ? Strategy : Strategy | undefined,
  ) {
    if (!strategy) {
      strategy = name as Strategy;
      name = strategy.name;
    }
    if (!name) {
      throw new Error('Authentication strategies must have a name');
    }

    this._strategies[name as string] = strategy;
    return this;
  }

  /**
   * Un-utilize the `strategy` with given `name`.
   *
   * In typical applications, the necessary authentication strategies are static,
   * configured once and always available.  As such, there is often no need to
   * invoke this function.
   *
   * However, in certain situations, applications may need dynamically configure
   * and de-configure authentication strategies.  The `use()`/`unuse()`
   * combination satisfies these scenarios.
   *
   * Examples:
   *
   *     passport.unuse('legacy-api');
   *
   * @param {String} name
   * @return {Authenticator} for chaining
   * @api public
   */
  unuse(name: string) {
    delete this._strategies[name];
    return this;
  }

  /**
   * Setup Passport to be used under framework.
   *
   * By default, Passport exposes middleware that operate using Connect-style
   * middleware using a `fn(req, res, next)` signature.  Other popular frameworks
   * have different expectations, and this function allows Passport to be adapted
   * to operate within such environments.
   *
   * If you are using a Connect-compatible framework, including Express, there is
   * no need to invoke this function.
   *
   * Examples:
   *
   *     passport.framework(require('hapi-passport')());
   *
   * @param {Object} name
   * @return {Authenticator} for chaining
   * @api public
   */
  framework<
    X extends InitializeRet,
    Y extends AuthenticateRet,
    Z extends AuthorizeRet,
  >(fw: IFramework<X, Y, Z>) {
    this._framework = fw;
    return this;
  }

  /**
   * Passport's primary initialization middleware.
   *
   * This middleware must be in use by the Connect/Express application for
   * Passport to operate.
   *
   * Options:
   *   - `userProperty`  Property to set on `req` upon login, defaults to _user_
   *
   * Examples:
   *
   *     app.use(passport.initialize());
   *
   *     app.use(passport.initialize({ userProperty: 'currentUser' }));
   *
   * @param {Object} options
   * @return {Function} middleware
   * @api public
   */
  initialize(
    options?: InitializeOptions,
  ): InitializeRet | ((...args: any[]) => InitializeRet) {
    options = options || ({} as InitializeOptions);
    return this._framework.initialize(this, options);
  }

  /**
   * Middleware that will authenticate a request using the given `strategy` name,
   * with optional `options` and `callback`.
   *
   * Examples:
   *
   *     passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })(req, res);
   *
   *     passport.authenticate('local', function(err, user) {
   *       if (!user) { return res.redirect('/login'); }
   *       res.end('Authenticated!');
   *     })(req, res);
   *
   *     passport.authenticate('basic', { session: false })(req, res);
   *
   *     app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
   *       // request will be redirected to Twitter
   *     });
   *     app.get('/auth/twitter/callback', passport.authenticate('twitter'), function(req, res) {
   *       res.json(req.user);
   *     });
   *
   * @param {String} strategy
   * @param {Object} options
   * @param {Function} callback
   * @return {Function} middleware
   * @api public
   */
  authenticate(
    strategy:
      | string
      | string[]
      | StrategyCreated<
          Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>
        >
      | Request,
    options: AuthorizeOptions,
    callback?: (...args: any[]) => any,
  ): AuthenticateRet {
    return this._framework.authenticate(this, strategy, options, callback);
  }

  /**
   * Middleware that will authorize a third-party account using the given
   * `strategy` name, with optional `options`.
   *
   * If authorization is successful, the result provided by the strategy's verify
   * callback will be assigned to `req.account`.  The existing login session and
   * `req.user` will be unaffected.
   *
   * This function is particularly useful when connecting third-party accounts
   * to the local account of a user that is currently authenticated.
   *
   * Examples:
   *
   *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
   *
   * @param {String} strategy
   * @param {Object} options
   * @return {Function} middleware
   * @api public
   */
  authorize(
    strategy: string,
    options = {} as AuthorizeOptions,
    callback?: (...args: any[]) => any,
  ): AuthenticateRet | AuthorizeRet | ((...args: any[]) => AuthorizeRet) {
    options.assignProperty = 'account';

    const authorize = this._framework.authorize || this._framework.authenticate;
    return authorize(this, strategy, options, callback);
  }

  /**
   * Middleware that will restore login state from a session.
   *
   * Web applications typically use sessions to maintain login state between
   * requests.  For example, a user will authenticate by entering credentials into
   * a form which is submitted to the server.  If the credentials are valid, a
   * login session is established by setting a cookie containing a session
   * identifier in the user's web browser.  The web browser will send this cookie
   * in subsequent requests to the server, allowing a session to be maintained.
   *
   * If sessions are being utilized, and a login session has been established,
   * this middleware will populate `req.user` with the current user.
   *
   * Note that sessions are not strictly required for Passport to operate.
   * However, as a general rule, most web applications will make use of sessions.
   * An exception to this rule would be an API server, which expects each HTTP
   * request to provide credentials in an Authorization header.
   *
   * Examples:
   *
   *     app.use(connect.cookieParser());
   *     app.use(connect.session({ secret: 'keyboard cat' }));
   *     app.use(passport.initialize());
   *     app.use(passport.session());
   *
   * Options:
   *   - `pauseStream`      Pause the request stream before deserializing the user
   *                        object from the session.  Defaults to _false_.  Should
   *                        be set to true in cases where middleware consuming the
   *                        request body is configured after passport and the
   *                        deserializeUser method is asynchronous.
   *
   * @param {Object} options
   * @return {Function} middleware
   * @api public
   */
  session(options: AuthorizeOptions = {} as AuthorizeOptions) {
    return this.authenticate('session', options);
  }

  // TODO: Make session manager pluggable
  /*
Authenticator.prototype.sessionManager = function(mgr) {
  this._sm = mgr;
  return this;
}
*/

  /**
   * Registers a function used to serialize user objects into the session.
   *
   * Examples:
   *
   *     passport.serializeUser(function(user, done) {
   *       done(null, user.id);
   *     });
   *
   * @api public
   */
  serializeUser<TID = User, TR extends IncomingMessage = Request>(
    fn: TID | Serializer<TID, TR>,
    req?: TR,
    done?: (err?: Error | null | 0 | 'pass', id?: TID) => void,
  ) {
    if (typeof fn === 'function') {
      return this._serializers.push(fn as Serializer<TID, TR>);
    }

    // private implementation that traverses the chain of serializers, attempting
    // to serialize a user
    const user = fn;

    // For backwards compatibility
    if (typeof req === 'function') {
      done = req;
      req = undefined;
    }

    const stack = this._serializers;
    (function pass(i, err?: Error | 0 | null | 'pass', obj?: TID) {
      // serializers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or serialized object was obtained, done
      if (err || obj || obj === 0) {
        return done && done(err, obj);
      }

      const layer = stack[i];
      if (!layer) {
        return done && done(new Error('Failed to serialize user into session'));
      }

      function serialized(e: typeof err, o: typeof obj) {
        pass(i + 1, e, o);
      }

      try {
        const arity = layer.length;
        if (arity === 3) {
          layer(req, user, serialized);
        } else {
          layer(user, serialized);
        }
      } catch (e: any) {
        return done && done(e);
      }
    })(0);
  }

  /**
   * Registers a function used to deserialize user objects out of the session.
   *
   * Examples:
   *
   *     passport.deserializeUser(function(id, done) {
   *       User.findById(id, function (err, user) {
   *         done(err, user);
   *       });
   *     });
   *
   * @api public
   */
  deserializeUser<TID, TR extends IncomingMessage = Request>(
    fn: User | Deserializer<TID, TR>,
    req?: TR,
    done?: (err?: Error | 'pass' | null, user?: User | false | null) => void,
  ) {
    if (typeof fn === 'function') {
      return this._deserializers.push(fn as Deserializer<TID, TR>);
    }

    // private implementation that traverses the chain of deserializers,
    // attempting to deserialize a user
    const obj = fn;

    // For backwards compatibility
    if (typeof req === 'function') {
      done = req;
      req = undefined;
    }

    const stack = this._deserializers;
    (function pass(i, err?: Error | null | 'pass', user?: User | null) {
      // deserializers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or deserialized user was obtained, done
      if (err || user) {
        return done && done(err, user);
      }
      // a valid user existed when establishing the session, but that user has
      // since been removed
      if (user === null || user === false) {
        return done && done(null, false);
      }

      const layer = stack[i];
      if (!layer) {
        return (
          done && done(new Error('Failed to deserialize user out of session'))
        );
      }

      function deserialized(e?: Error | 'pass' | null, u?: User | null) {
        pass(i + 1, e, u);
      }

      try {
        const arity = layer.length;
        if (arity == 3) {
          layer(req, obj, deserialized);
        } else {
          layer(obj, deserialized);
        }
      } catch (e: any) {
        return done && done(e);
      }
    })(0);
  }

  /**
   * Registers a function used to transform auth info.
   *
   * In some circumstances authorization details are contained in authentication
   * credentials or loaded as part of verification.
   *
   * For example, when using bearer tokens for API authentication, the tokens may
   * encode (either directly or indirectly in a database), details such as scope
   * of access or the client to which the token was issued.
   *
   * Such authorization details should be enforced separately from authentication.
   * Because Passport deals only with the latter, this is the responsiblity of
   * middleware or routes further along the chain.  However, it is not optimal to
   * decode the same data or execute the same database query later.  To avoid
   * this, Passport accepts optional `info` along with the authenticated `user`
   * in a strategy's `success()` action.  This info is set at `req.authInfo`,
   * where said later middlware or routes can access it.
   *
   * Optionally, applications can register transforms to proccess this info,
   * which take effect prior to `req.authInfo` being set.  This is useful, for
   * example, when the info contains a client ID.  The transform can load the
   * client from the database and include the instance in the transformed info,
   * allowing the full set of client properties to be convieniently accessed.
   *
   * If no transforms are registered, `info` supplied by the strategy will be left
   * unmodified.
   *
   * Examples:
   *
   *     passport.transformAuthInfo(function(info, done) {
   *       Client.findById(info.clientID, function (err, client) {
   *         info.client = client;
   *         done(err, info);
   *       });
   *     });
   *
   * @api public
   */
  transformAuthInfo<
    Callback extends (err?: Error | 'pass' | null, info?: Info) => void,
  >(
    fn: InfoTransformer | Info,
    req?: Request | Info | Callback,
    done?: Callback,
  ) {
    if (typeof fn === 'function') {
      return this._infoTransformers.push(fn);
    }

    // private implementation that traverses the chain of transformers,
    // attempting to transform auth info
    const info = fn;

    // For backwards compatibility
    if (typeof req === 'function') {
      done = req;
      req = undefined;
    }

    const stack = this._infoTransformers;
    (function pass(i, err?: Error | null | 'pass', tinfo?: Info) {
      // transformers use 'pass' as an error to skip processing
      if ('pass' === err) {
        err = undefined;
      }
      // an error or transformed info was obtained, done
      if (err || tinfo) {
        return done!(err, tinfo);
      }

      const layer = stack[i];
      if (!layer) {
        // if no transformers are registered (or they all pass), the default
        // behavior is to use the un-transformed info as-is
        return done!(null, info);
      }

      function transformed(e: Error | null, t: typeof tinfo) {
        pass(i + 1, e, t);
      }

      try {
        const arity = layer.length;
        if (arity === 1) {
          // sync
          const t = layer<Info, undefined, undefined>(info);
          transformed(null, t);
        } else if (arity === 3) {
          layer(req as Request, info, transformed);
        } else {
          layer(info, transformed);
        }
      } catch (e: any) {
        return done && done(e);
      }
    })(0);
  }

  /**
   * Return strategy with given `name`.
   *
   * @param {String} name
   * @return {Strategy}
   * @api private
   */
  _strategy(
    name: string,
  ): StrategyCreated<
    Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>
  > {
    return this._strategies[name];
  }
}

/**
 * Expose `Authenticator`.
 */
export default Authenticator;
