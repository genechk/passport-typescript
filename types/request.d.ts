import type { IncomingMessage } from 'http';

import type { LoginOptions, LogoutOptions } from './options';
import type { Session } from './session';
import type { User } from './user';
import type SessionManager from '@src/sessionmanager';
import type Authenticator from '@src/authenticator';

type Logout = {
  <T extends LogoutOptions | ((err?: Error) => void)>(
    options?: T,
    done?: T extends LogoutOptions ? (err?: Error) => void : undefined,
  ): void;
};

type Login = {
  <
    Callback extends (err?: Error | null | 'pass') => void,
    T extends LoginOptions | Callback,
  >(
    user: User,
    options: T,
    done?: T extends LoginOptions ? Callback : undefined,
  ): void;
};

interface Request extends IncomingMessage {
  authInfo?: IAuthInfo | undefined;
  session?: Session;
  user?: User | null | undefined;
  [userProperty: string]: User | null | undefined;

  _userProperty: string;
  _sessionManager?: SessionManager;
  _passport: { instance: Authenticator };

  flash?: (type: string, msg: string) => void;

  // These declarations are merged into express's Request type
  login: Login;
  logIn: Login;

  logout: Logout;
  logOut: Logout;

  isAuthenticated(): this is IAuthenticatedRequest;
  isUnauthenticated(): this is IUnauthenticatedRequest;
}

interface IAuthInfo {}

interface IAuthenticatedRequest extends Request {
  user: User;
}

interface IUnauthenticatedRequest extends Request {
  user?: undefined;
}

export {
  IAuthenticatedRequest,
  IAuthInfo,
  IUnauthenticatedRequest,
  Login,
  Logout,
  Request,
};
