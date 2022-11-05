"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var initialize_1 = __importDefault(require("../middleware/initialize"));
var authenticate_1 = __importDefault(require("../middleware/authenticate"));
/**
 * Framework support for Connect/Express.
 *
 * This module provides support for using Passport with Express.  It exposes
 * middleware that conform to the `fn(req, res, next)` signature.
 *
 * @return {Object}
 * @api protected
 */
function default_1() {
    return {
        initialize: initialize_1.default,
        authenticate: authenticate_1.default,
    };
}
exports.default = default_1;
