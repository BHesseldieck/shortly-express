var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Link = require('./link');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',

  links: function() {
    return this.hasMany(Link);
  },
  // Listen on create
  initialize: function() {
    this.on('create', function(model, attrs, options) {
      bcrypt.hash(attrs.password, null, null, function(err, hash) {
        // Store hash in your password DB.
        console.log('encrypt is running');
      });
      // shasum.update(model.get('url'));
      // model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
  // Listen on update (change password or username)
});

module.exports = User;