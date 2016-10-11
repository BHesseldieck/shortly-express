Shortly.createSignupView = Backbone.View.extend({
  className: 'creator',

  template: Templates['signup'],

  events: {
    'submit': 'signup'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  signup: function(e) {
    e.preventDefault();
    var $username = this.$el.find('#username');
    var $password = this.$el.find('#password');
    // might be cause of error so might to be changed
    var userSignup = new Shortly.Signup({ username: $username, password: $password });
    userSignup.on('request', this.startSpinner, this);
    userSignup.on('sync', this.success, this);
    userSignup.on('error', this.failure, this);
    userSignup.save({});
    $username.val('');
    $password.val('');
  },

  success: function(signup) {
    this.stopSpinner();
    var view = new Shortly.SignupView({ model: signup });
    this.$el.find('.message').append(view.render().$el.hide().fadeIn());
  },

  failure: function(model, res) {
    this.stopSpinner();
    this.$el.find('.message')
      .html('Please enter a valid username and/or password')
      .addClass('error');
    return this;
  },

  startSpinner: function() {
    this.$el.find('img').show();
    this.$el.find('form input[type=submit]').attr('disabled', 'true');
    this.$el.find('.message')
      .html('')
      .removeClass('error');
  },

  stopSpinner: function() {
    this.$el.find('img').fadeOut('fast');
    this.$el.find('form input[type=submit]').attr('disabled', null);
    this.$el.find('.message')
      .html('')
      .removeClass('error');
  }
});
