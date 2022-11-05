// Type definitions for Passport 1.0
// Project: http://passportjs.org
// Definitions by: Horiuchi_H <https://github.com/horiuchi>
//                 Eric Naeseth <https://github.com/enaeseth>
//                 Igor Belagorudsky <https://github.com/theigor>
//                 Tomek Łaziuk <https://github.com/tlaziuk>
//                 Daniel Perez Alvarez <https://github.com/unindented>
//                 Kevin Stiehl <https://github.com/kstiehl>
//                 Oleg Vaskevich <https://github.com/vaskevich>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

import { IncomingMessage } from 'http';

import type { Serializer } from './authenticator';
import type {
  Request as ExtendedRequest,
  IAuthInfo,
  IAuthenticatedRequest,
  IUnauthenticatedRequest,
} from './request';
import type {
  FlashMessage,
  InitializeOptions,
  SessionOptions,
} from './options';
import type SessionManager from '@src/sessionmanager';

export * from './authenticate';
export * from './authenticator';
export * from './framework';
export * from './options';
export * from './request';
export * from './session';
export * from './strategy';
export * from './user';

declare global {
  namespace Express {
    // tslint:disable-next-line:no-empty-interface
    interface AuthInfo extends IAuthInfo {}
    // tslint:disable-next-line:no-empty-interface
    interface User {}

    interface Request extends ExtendedRequest {}

    interface AuthenticatedRequest extends IAuthenticatedRequest {}

    interface UnauthenticatedRequest extends IUnauthenticatedRequest {}
  }
}

import type { Handler } from 'express';

declare namespace passport {
  interface AuthenticateOptions {
    authInfo?: boolean | undefined;
    assignProperty?: string | undefined;
    failureFlash?: string | boolean | FlashMessage | undefined;
    failureMessage?: boolean | string | undefined;
    failureRedirect?: string | undefined;
    failWithError?: boolean | undefined;
    keepSessionInfo?: boolean | undefined;
    session?: boolean | undefined;
    scope?: string | string[] | undefined;
    successFlash?: string | boolean | FlashMessage | undefined;
    successMessage?: boolean | string | undefined;
    successRedirect?: string | undefined;
    successReturnToOrRedirect?: string | undefined;
    state?: string | undefined;
    pauseStream?: boolean | undefined;
    userProperty?: string | undefined;
    passReqToCallback?: boolean | undefined;
    prompt?: string | undefined;
  }

  interface Authenticator<
    InitializeRet = Handler,
    AuthenticateRet = any,
    AuthorizeRet = AuthenticateRet,
    AuthorizeOptions = AuthenticateOptions,
  > {
    use(strategy: Strategy): this;
    use(name: string, strategy: Strategy): this;
    unuse(name: string): this;
    framework<
      X extends InitializeRet,
      Y extends AuthenticateRet,
      Z extends AuthorizeRet,
    >(
      fw: Framework<X, Y, Z>,
    ): Authenticator<X, Y, Z>;
    initialize(options?: InitializeOptions): InitializeRet;
    session(options?: SessionOptions): AuthenticateRet;

    authenticate(
      strategy: string | string[] | Strategy | ExtendedRequest,
      callback?: (...args: any[]) => any,
    ): AuthenticateRet;
    authenticate(
      strategy: string | string[] | Strategy | ExtendedRequest,
      options: AuthenticateOptions,
      callback?: (...args: any[]) => any,
    ): AuthenticateRet;
    authorize(
      strategy: string | string[],
      callback?: (...args: any[]) => any,
    ): AuthorizeRet;
    authorize(
      strategy: string | string[],
      options: AuthorizeOptions,
      callback?: (...args: any[]) => any,
    ): AuthorizeRet;
    serializeUser<TID>(
      fn: (user: Express.User, done: (err: any, id?: TID) => void) => void,
    ): void;
    serializeUser<TID, TR extends IncomingMessage = ExtendedRequest>(
      req: TR,
      user: Express.User,
      done: (err?: any, id?: TID) => void,
    ): void;
    serializeUser<TID, TR extends IncomingMessage = ExtendedRequest>(
      fn: Serializer<TID, TR>,
    ): void;
    deserializeUser<TID>(
      fn: (
        id: TID,
        done: (err: any, user?: Express.User | false | null) => void,
      ) => void,
    ): void;
    deserializeUser<TID, TR extends IncomingMessage = ExtendedRequest>(
      fn: (
        req: TR,
        id: TID,
        done: (err: any, user?: Express.User | false | null) => void,
      ) => void,
    ): void;
    transformAuthInfo(
      fn: (info: any, done?: (err: any, info: any) => void) => void,
    ): void;
  }

  interface PassportStatic extends Authenticator {
    _sm: SessionManager;
    _userProperty: string;
    instance: PassportStatic;
    _strategy: (
      layer: string | FlashMessage,
    ) => StrategyCreated<PassportStatic>;

    Authenticator: { new (): Authenticator };
    Passport: PassportStatic['Authenticator'];
    Strategy: { new (): Strategy & StrategyCreatedStatic };
  }

  interface Strategy {
    name: string;
    authenticate(
      this: StrategyCreated<this>,
      req: ExtendedRequest,
      options?: any,
    ): any;
  }

  interface StrategyCreatedStatic {
    name: string;
    /**
     * Authenticate `user`, with optional `info`.
     *
     * Strategies should call this function to successfully authenticate a
     * user.  `user` should be an object supplied by the application after it
     * has been given an opportunity to verify credentials.  `info` is an
     * optional argument containing additional user information.  This is
     * useful for third-party authentication strategies to pass profile
     * details.
     */
    success(user: Express.User, info?: object): void;
    /**
     * Fail authentication, with optional `challenge` and `status`, defaulting
     * to 401.
     *
     * Strategies should call this function to fail an authentication attempt.
     */
    fail(
      challenge?: { message?: string; [key: string]: any } | string | number,
      status?: number,
    ): void;
    /**
     * Redirect to `url` with optional `status`, defaulting to 302.
     *
     * Strategies should call this function to redirect the user (via their
     * user agent) to a third-party website for authentication.
     */
    redirect(url: string, status?: number): void;
    /**
     * Pass without making a success or fail decision.
     *
     * Under most circumstances, Strategies should not need to call this
     * function.  It exists primarily to allow previous authentication state
     * to be restored, for example from an HTTP session.
     */
    pass(): void;
    /**
     * Internal error while performing authentication.
     *
     * Strategies should call this function when an internal error occurs
     * during the process of performing authentication; for example, if the
     * user directory is not available.
     */
    error(err: any): void;
  }

  type StrategyCreated<T, O = T & StrategyCreatedStatic> = {
    [P in keyof O]: O[P];
  };

  interface Profile {
    provider: string;
    id: string;
    displayName: string;
    username?: string | undefined;
    name?:
      | {
          familyName: string;
          givenName: string;
          middleName?: string | undefined;
        }
      | undefined;
    emails?:
      | Array<{
          value: string;
          type?: string | undefined;
        }>
      | undefined;
    photos?:
      | Array<{
          value: string;
        }>
      | undefined;
  }

  interface Framework<
    InitializeRet = any,
    AuthenticateRet = any,
    AuthorizeRet = AuthenticateRet,
  > {
    initialize(
      passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
      options?: InitializeOptions,
    ): (...args: any[]) => InitializeRet;
    authenticate(
      passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
      name: string | string[] | Strategy | ExtendedRequest,
      options?: any,
      callback?: (...args: any[]) => any,
    ): (...args: any[]) => AuthenticateRet;
    authorize?(
      passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
      name: string,
      options?: any,
      callback?: (...args: any[]) => any,
    ): (...args: any[]) => AuthorizeRet;
  }
}

declare const passport: passport.PassportStatic;

// export = passport;
