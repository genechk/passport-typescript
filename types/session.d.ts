import type { User } from './user';

type Session = Record<
  string,
  {
    user?: User;
  }
> & {
  messages?: string[];
  returnTo?: string;
  save: (fn: (err?: Error) => void) => void;
  regenerate: (fn: (err?: Error) => void) => void;
};

export { Session };
