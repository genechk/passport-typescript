import { Request } from './request';
import { StrategyOptions } from './options';

interface IStrategy {
  // name: string;
  authenticate(
    this: StrategyCreated<this>,
    req: Request,
    options?: StrategyOptions,
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

export { IStrategy, StrategyCreated, StrategyCreatedStatic };
