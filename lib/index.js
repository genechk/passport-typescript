"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
var authenticator_1 = __importDefault(require("./authenticator"));
var session_1 = __importDefault(require("./strategies/session"));
/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new authenticator_1.default();
/**
 * Expose constructors.
 */
exports.Passport = exports.Authenticator = authenticator_1.default;
exports.Strategy = require('passport-strategy');
/**
 * Expose strategies.
 */
exports.strategies = {};
exports.strategies.SessionStrategy = session_1.default;
