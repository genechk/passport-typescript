/**
 * Module dependencies.
 */
import type Express from 'express';

import initialize from '../middleware/initialize';
import authenticate from '../middleware/authenticate';
import type passport from '@types';

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
    initialize: initialize,
    authenticate: authenticate,
  } as passport.Framework<Express.Handler, ReturnType<typeof authenticate>>;
}
