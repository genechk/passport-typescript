"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
var pause_1 = __importDefault(require("pause"));
/**
 * Creates an instance of `Strategy`.
 *
 * @class
 * @api public
 */
var Strategy = /** @class */ (function () {
    function Strategy() {
    }
    /**
     * Authenticate request.
     *
     * This function must be overridden by subclasses.  In abstract form, it always
     * throws an exception.
     *
     * @param {Object} req The request to authenticate.
     * @param {Object} [options] Strategy-specific options.
     * @api public
     */
    Strategy.prototype.authenticate = function (req, options) {
        throw new Error('Strategy#authenticate must be overridden by subclass');
    };
    return Strategy;
}());
/**
 * `SessionStrategy`.
 *
 * @class
 * @api public
 */
var SessionStrategy = /** @class */ (function (_super) {
    __extends(SessionStrategy, _super);
    function SessionStrategy(options, deserializeUser) {
        var _this = _super.call(this) || this;
        _this.error = function (error) {
            throw error;
        };
        _this.pass = function () { };
        if (typeof options === 'function') {
            deserializeUser = options;
            options = undefined;
        }
        options = options || {};
        _this.name = 'session';
        _this._key = options.key || 'passport';
        _this._deserializeUser = deserializeUser;
        return _this;
    }
    /**
     * Authenticate request based on the current session state.
     *
     * The session authentication strategy uses the session to restore any login
     * state across requests.  If a login session has been established, `req.user`
     * will be populated with the current user.
     *
     * This strategy is registered automatically by Passport.
     *
     * @param {Object} req
     * @param {Object} options
     * @api protected
     */
    SessionStrategy.prototype.authenticate = function (req, options) {
        var _this = this;
        if (!req.session) {
            return this.error(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?'));
        }
        options = options || {};
        var session = req.session;
        var self = this;
        var su;
        if (session[this._key]) {
            su = session[this._key].user;
        }
        if (su || su === 0) {
            // NOTE: Stream pausing is desirable in the case where later middleware is
            //       listening for events emitted from request.  For discussion on the
            //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
            var paused_1 = options.pauseStream
                ? (0, pause_1.default)(req)
                : null;
            // @ts-ignore
            this._deserializeUser(su, req, function (err, user) {
                if (err) {
                    return _this.error(err);
                }
                if (!user) {
                    delete session[_this._key].user;
                }
                else {
                    var property = req._userProperty || 'user';
                    req[property] = user;
                }
                _this.pass();
                if (paused_1) {
                    paused_1.resume();
                }
            });
        }
        else {
            this.pass();
        }
    };
    return SessionStrategy;
}(Strategy));
/**
 * Expose `SessionStrategy`.
 */
exports.default = SessionStrategy;
