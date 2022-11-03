import { Strategy, StrategyCreated, PassportStatic } from '@types';

type Challenge = { type: 'error' | 'success' | string; message: string };
type MaybeChallenge =
  | string
  | Challenge
  | StrategyCreated<PassportStatic>
  | undefined;

interface AuthOptions {
  failureFlash?: string | boolean | Challenge;
  failureMessage?: string;
  failureRedirect?: string;
  failWithError?: boolean;
  successFlash?: string | boolean | Challenge;
  successMessage?: string;
  successRedirect?: string;
  assignProperty?: string;
  successReturnToOrRedirect?: string;
  // authInfo?: string | false;

  authInfo?: boolean | undefined;
  //   assignProperty?: string | undefined;
  //   failureFlash?: string | boolean | undefined;
  //   failureMessage?: boolean | string | undefined;
  //   failureRedirect?: string | undefined;
  //   failWithError?: boolean | undefined;
  //   keepSessionInfo?: boolean | undefined;
  //   session?: boolean | undefined;
  //   scope?: string | string[] | undefined;
  //   successFlash?: string | boolean | undefined;
  //   successMessage?: boolean | string | undefined;
  //   successRedirect?: string | undefined;
  //   successReturnToOrRedirect?: string | undefined;
  //   state?: string | undefined;
  //   pauseStream?: boolean | undefined;
  //   userProperty?: string | undefined;
  //   passReqToCallback?: boolean | undefined;
  // prompt?: string | undefined;
}

interface InitializeOptions {
  userProperty: string;
  compat?: boolean;
}

interface LoginOptions extends AuthOptions {
  keepSessionInfo?: boolean;
  session?: boolean;
}

interface LogoutOptions {
  keepSessionInfo?: boolean;
}

interface StrategyOptions {
  key: string;
}

interface SessionOptions extends StrategyOptions {
  pauseStream?: boolean;
}

export {
  AuthOptions,
  Challenge,
  MaybeChallenge,
  InitializeOptions,
  LoginOptions,
  LogoutOptions,
  SessionOptions,
  StrategyOptions,
};
