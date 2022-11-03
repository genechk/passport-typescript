import type { LoginOptions, LogoutOptions } from './options';
import type { Session } from './session';
import type SessionManager from '@src/sessionmanager';
import type { PassportStatic } from '@types';

type Logout = {
  <T extends LogoutOptions | ((err?: Error) => void)>(
    options?: T,
    done?: T extends LogoutOptions ? (err?: Error) => void : undefined,
  ): void;
};

type Login = {};

interface Request extends Record<'user' | string, Express.User | null> {
  authInfo?: AuthInfo | undefined;
  user?: User | undefined;
  session?: Session;

  _userProperty: string;
  _sessionManager?: SessionManager;
  _passport: { instance: PassportStatic };

  flash?: (type: string, msg: string) => void;

  // These declarations are merged into express's Request type
  login(user: User, options: LoginOptions, done: (err?: Error) => void): void;
  // login(user: User, done: (err: any) => void): void;
  logIn(user: User, options: LoginOptions, done: (err?: Error) => void): void;
  // logIn(user: User, done: (err: any) => void): void;

  logout: Logout;
  logOut: Logout;

  isAuthenticated(): this is AuthenticatedRequest;
  isUnauthenticated(): this is UnauthenticatedRequest;
}

export { Login, Logout, Request };
