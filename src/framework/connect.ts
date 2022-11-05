/**
 * Module dependencies.
 */
import type { Handler } from 'express';

import initialize from '../middleware/initialize';
import authenticate from '../middleware/authenticate';
import type { IFramework } from 'types';

/**
 * Framework support for Connect/Express.
 *
 * This module provides support for using Passport with Express.  It exposes
 * middleware that conform to the `fn(req, res, next)` signature.
 *
 * @return {Object}
 * @api protected
 */
export default function () {
  return {
    initialize,
    authenticate,
  } as IFramework<Handler>;
}
