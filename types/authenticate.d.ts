import type { User } from './user';
import type { FlashMessage, MaybeInfoOrStrategy } from './options';

type AuthenticateCallback = {
  (
    err: Error | null,
    maybeUser?: User | false,
    message?: MaybeInfoOrStrategy | MaybeInfoOrStrategy[],
    status?: number | number[],
  ): void;
};

type MaybeCallback = AuthenticateCallback | undefined;

interface Failure {
  challenge?: string | FlashMessage;
  status: number;
}

export { AuthenticateCallback, Failure, MaybeCallback };
