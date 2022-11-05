import type Authenticator from '@src/authenticator';
import type { IStrategy } from '@types';
import type { InitializeOptions, AuthOptions } from './options';
import type { Request } from './request';

type Callback<T extends any[] = any[], Ret = any> = { (...args: T): Ret };

interface IFramework<
  InitializeRet = any,
  AuthenticateRet = any,
  AuthorizeRet = AuthenticateRet,
  CallbackArgsType extends any[] = any[],
> {
  initialize(
    passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
    options?: InitializeOptions,
  ): InitializeRet | Callback<CallbackArgsType, InitializeRet>;
  authenticate<R>(
    passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
    name: string | string[] | IStrategy | Request,
    options?: AuthOptions,
    callback?: Callback<CallbackArgsType, R>,
  ): AuthenticateRet;
  authorize?<R>(
    passport: Authenticator<InitializeRet, AuthenticateRet, AuthorizeRet>,
    name: string,
    options?: AuthOptions,
    callback?: Callback<CallbackArgsType, R>,
  ): AuthorizeRet | Callback<CallbackArgsType, AuthorizeRet>;
}

export { IFramework };
