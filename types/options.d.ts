import type Authenticator from '@src/authenticator';
import { StrategyCreated } from '@types';

type FlashMessage = {
  type: 'error' | 'success' | 'notice' | 'info';
  message: string;
};
type MaybeFlashMessage = FlashMessage | undefined;
type Info = FlashMessage & Record<string, string>;
type MaybeInfoOrStrategy =
  | string
  | Info
  | StrategyCreated<Authenticator>
  | undefined;

interface AuthenticateOptions
  extends AuthOptions,
    SessionOptions,
    InitializeOptions,
    LoginOptions,
    LogoutOptions {
  passReqToCallback?: boolean | undefined;
  prompt?: string | undefined;
  scope?: string | string[] | undefined;
  state?: string | undefined;
}

interface AuthOptions {
  assignProperty?: string | undefined;
  authInfo?: boolean | undefined;
  failureFlash?: string | boolean | FlashMessage;
  failureMessage?: boolean | string | undefined;
  failureRedirect?: string | undefined;
  failWithError?: boolean | undefined;
  successFlash?: string | boolean | FlashMessage;
  successMessage?: boolean | string | undefined;
  successRedirect?: string | undefined;
  successReturnToOrRedirect?: string | undefined;
}

interface InitializeOptions {
  userProperty?: string;
  compat?: boolean;
}

interface LoginOptions extends AuthOptions {
  keepSessionInfo?: boolean;
  session?: boolean;
}

interface LogoutOptions {
  keepSessionInfo?: boolean;
}

interface SessionOptions extends StrategyOptions {
  pauseStream?: boolean;
}

interface StrategyOptions {
  key?: string;
}

export {
  AuthenticateOptions,
  AuthOptions,
  FlashMessage,
  Info,
  MaybeFlashMessage,
  MaybeInfoOrStrategy,
  InitializeOptions,
  LoginOptions,
  LogoutOptions,
  SessionOptions,
  StrategyOptions,
};
