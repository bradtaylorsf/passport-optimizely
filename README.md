# Passport-Optimizely

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Optimizely](https://www.optimizely.com/) using the OAuth 2.0 API.

For more information about Optimizely OAuth and the REST API please visit our [Developers Site](https://developers.optimizely.com/)

This module lets you authenticate using Optimizely in your Node.js applications.
By plugging into Passport, Optimizely authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-optimizely

## Usage

#### Configure Strategy

The Optimizely authentication strategy authenticates users using a Optimizely
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

You can get setup a new application in your [Optimizely Account settings](https://app.optimizely.com/v2/accountsettings/registered-apps) under the registered-apps tab

    passport.use(new OptimizelyStrategy({
        clientID: OPTIMIZELY_CLIENT_ID,
        clientSecret: OPTIMIZELY_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/optimizely/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ optimizelyId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'optimizely'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/optimizely',
      passport.authenticate('optimizely'));

    app.get('/auth/optimizely/callback',
      passport.authenticate('optimizely', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

#### Profile Example
```
{
  id: 1827373sw82js83j88sk88,
  username: brad@optimizely.com,
  email: brad@optimizey.com,
  name: {
    first: 'Brad',
    last: 'Taylor'
  },
  current_account: {
    id: 123456
  },
  accounts: [
    {
      id: 12345,
      name: 'My First Account'
    },
    {
      id: 987654,
      name: 'My Second Account'
    }
  ],
  project_roles: [
    {
      id: 12345,
      role: 'administrator'
    },
    {
      id: 262736,
      role: 'viewer'
    }
  ]
}
```
## Working Example

For a complete, working example, refer to the [login example](https://github.com/optimizely/passport-optimizely/tree/master/example).

## Tests

    $ npm install --dev
    $ npm test

## Credits

  - [Brad Taylor](http://github.com/bradtaylorsf)

## License

[The MIT License](http://opensource.org/licenses/MIT)
