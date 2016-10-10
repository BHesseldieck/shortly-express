var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Link = require('./link');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',

  links: function() {
    return this.hasMany(Link);
  },
  initialize: function() {
    this.on('createUser', function(model, attrs, options) {
      var shasum = bcrypt.hash('sha1');
      shasum.update(model.get('url'));
      model.set('code', shasum.digest('hex').slice(0, 5));
    });
  }
  // change password function
});

module.exports = User;