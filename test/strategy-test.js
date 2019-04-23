var vows = require('vows');
var assert = require('assert');
var util = require('util');
var OptimizelyStrategy = require('../lib/strategy');


vows.describe('OptimizelyStrategy').addBatch({

  'strategy': {
    topic: function() {
      return new OptimizelyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },

    'should be named optimizely': function (strategy) {
      assert.equal(strategy.name, 'optimizely');
    },
  },

  'strategy when loading user profile': {
    topic: function() {
      var strategy = new OptimizelyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{"accounts": [{"id": 5935064, "name": "Optimizely Production"}, {"id": 2760371216, "name": "Playground - Brad Taylor"}], "current_account": {"id": 5935064}, "id": "abcdefghijklmn123456789", "profile": {"email": "brad@optimizely.com", "first_name": "Brad", "last_name": "Taylor"}, "project_roles": [{"project_id": 3551628801, "role": "administrator"}, {"project_id": 7772270544, "role": "administrator"}], "_raw": "", "_json": {}}';

        callback(null, body, undefined);
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'optimizely');
        assert.equal(profile.id, 'abcdefghijklmn123456789');
        assert.equal(profile.username, 'brad@optimizely.com');
        assert.equal(profile.email, 'brad@optimizely.com');
        assert.equal(profile.name.first, 'Brad');
        assert.equal(profile.name.last, 'Taylor');
      },
      'should set current account property' : function(err, profile) {
        assert.isObject(profile.current_account);
      },
      'should set accounts property' : function(err, profile) {
        assert.isArray(profile.accounts);
      },
      'should set project_roles property' : function(err, profile) {
        assert.isArray(profile.project_roles);
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new OptimizelyStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
