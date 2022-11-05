"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_merge_1 = __importDefault(require("utils-merge"));
var SessionManager = /** @class */ (function () {
    function SessionManager(options, serializeUser) {
        if (typeof options == 'function') {
            serializeUser = options;
            options = undefined;
        }
        options = options || {};
        this._key = options.key || 'passport';
        this._serializeUser = serializeUser;
    }
    SessionManager.prototype.logIn = function (req, user, options, cb) {
        var _this = this;
        if (typeof options == 'function') {
            cb = options;
            options = {};
        }
        options = options || {};
        if (!req.session) {
            return cb(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?'));
        }
        var prevSession = req.session;
        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
            if (err) {
                return cb(err);
            }
            _this._serializeUser(user, req, function (err, obj) {
                if (err) {
                    return cb(err);
                }
                if (options.keepSessionInfo) {
                    (0, utils_merge_1.default)(req.session, prevSession);
                }
                var session = req.session;
                if (!session[_this._key]) {
                    session[_this._key] = {};
                }
                // store user information in session, typically a user id
                session[_this._key].user = obj;
                // save the session before redirection to ensure page
                // load does not happen before session is saved
                session.save(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                });
            });
        });
    };
    SessionManager.prototype.logOut = function (req, options, cb) {
        if (typeof options == 'function') {
            cb = options;
            options = {};
        }
        options = options || {};
        if (!req.session) {
            return cb(new Error('Login sessions require session support. Did you forget to use `express-session` middleware?'));
        }
        // clear the user from the session object and save.
        // this will ensure that re-using the old session id
        // does not have a logged in user
        if (req.session[this._key]) {
            delete req.session[this._key].user;
        }
        var prevSession = req.session;
        req.session.save(function (err) {
            if (err) {
                return cb(err);
            }
            // regenerate the session, which is good practice to help
            // guard against forms of session fixation
            req.session.regenerate(function (err) {
                if (err) {
                    return cb(err);
                }
                if (options.keepSessionInfo) {
                    (0, utils_merge_1.default)(req.session, prevSession);
                }
                cb();
            });
        });
    };
    return SessionManager;
}());
exports.default = SessionManager;
