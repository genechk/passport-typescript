import type { IncomingMessage } from 'http';

import type { Request } from './request';
import type { Info } from './options';
import type { User } from './user';

type Serializer<TID = User, TR extends IncomingMessage = Request> = {
  (req: TR, user?: TID, done?: (err?: Error | null, id?: TID) => void): void;
  // (user: User, done: (err?: Error | null, id?: TID) => void): void;
};

type Deserializer<TID, TR extends IncomingMessage = Request> = {
  (
    id: TID,
    done: (err?: Error | 'pass' | null, user?: User | false | null) => void,
  ): void;
  (
    req: TR,
    id: TID,
    done: (err?: Error | 'pass' | null, user?: User | false | null) => void,
  ): void;
};

type InfoTransformer = {
  <
    Req extends Request | Info,
    Callback extends ((err: Error, info: Info) => void) | undefined,
    T extends Req extends Request ? Info | undefined : Callback | undefined,
  >(
    req: Request | Info,
    info?: T,
    done?: T extends Info ? Callback : undefined,
  ): T extends undefined ? Info : void;
};

type SerializeUser = {
  // <TID>(
  //   fn: (user: User, done: (err: Error | null, id?: TID) => void) => void,
  // ): void;
  <TID = User, TR extends IncomingMessage = Request>(
    user: TID | Serializer<TID, TR>,
    req?: TR,
    callback?: (err?: Error | null | 0 | 'pass', id?: TID) => void,

    // (
    //   req: TR,
    //   user: User,
    //   done: (err?: Error | null, id?: TID) => void,
    // ) => void,
  ): void;
};

type DeserializeUser = {
  // <TID>(
  //   fn: (
  //     id: TID,
  //     done: (err?: Error | null, user?: User | false | null) => void,
  //   ) => void,
  // ): void;
  <TID, TR extends IncomingMessage = Request>(
    fn: User | Deserializer<TID, TR>,
    req?: TR,
    callback?: (
      err?: Error | 'pass' | null,
      user?: User | false | null,
    ) => void,
    // (
    //   req: TR,
    //   id: TID,
    //   done: (err?: Error | null, user?: User | false | null) => void,
    // ) => void,
  ): void;
};

type TransformAuthInfo = {
  fn: InfoTransformer;
  req?: Request;
  done?: (err?: Error | null, info?: Info) => void;
};

interface IAuthenticator {
  serializeUser: SerializeUser;
  deserializeUser: DeserializeUser;
}

export {
  Deserializer,
  DeserializeUser,
  IAuthenticator,
  InfoTransformer,
  Serializer,
  SerializeUser,
  TransformAuthInfo,
};
