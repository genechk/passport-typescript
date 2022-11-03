import type { User } from './user';
import type { Challenge, MaybeChallenge } from './options';

type AuthenticateCallback = {
  (
    err: Nullable<Error>,
    maybeUser?: User | false,
    message?: MaybeChallenge | MaybeChallenge[],
    status?: number | number[],
  ): void;
};

export { AuthenticateCallback };
