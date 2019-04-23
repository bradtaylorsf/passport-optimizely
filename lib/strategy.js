/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Optimizely authentication strategy authenticates requests by delegating to
 * Optimizely using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Optimizely application's client id
 *   - `clientSecret`  your Optimizely application's client secret
 *   - `callbackURL`   URL to which Optimizely will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new OptimizelyStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/optimizely/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://app.optimizely.com/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://app.optimizely.com/oauth2/token';
  options.scope = options.scope || 'all';
  options.useAuthorizationHeaderforGET = true;

  OAuth2Strategy.call(this, options, verify);
  this.name = 'optimizely';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Optimizely.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `optimizely`
 *   - `id`               the user's Optimizely ID
 *   - `username`         the user's Optimizely email
 *   - `email`            the user's Optimizely email
 *   - `accounts`         the acounts the user has access to
 *   - `current_account`  the acount the user is currently signed into
 *   - `project_roles`    the roles the user has for each project
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.useAuthorizationHeaderforGET(true);
  this._oauth2.get('https://api.optimizely.com/v2/me', accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    try {
      var json = JSON.parse(body);

      var profile = { provider: 'optimizely' };
      profile.id = json.id;
      profile.name = { last: json.profile.last_name,
                       first: json.profile.first_name };
      profile.email = json.profile.email;
      profile.username = json.profile.email;
      profile.accounts = json.accounts || [];
      profile.current_account = json.current_account || {};
      profile.project_roles = json.project_roles || [];

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
