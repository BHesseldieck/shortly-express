var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var Session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(Session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));


var restrict = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
};

app.get('/', restrict, 
function(req, res) {
  console.log(req.session);
  res.render('index');
});

app.get('/create', restrict,
function(req, res) {
  res.render('index');
});

app.get('/links', restrict,
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.render('login');
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

app.post('/login', 
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
/************************************************************/
// Add utility functions to check for valid username and password
/************************************************************/

  // if (!util.isValidUrl(uri)) {
  //   console.log('Not a valid url: ', uri);
  //   return res.sendStatus(404);
  // }
  console.log('req.session', req.session);

  // new User({ username: username, password: password }).fetch().then(function(found) {
    // if (found) {
    //   // need to add a session when found
    //   req.session.regenerate(function() {
    //     req.session.user = username;
    //     res.writeHead(200, {location: '/links'});
    //     res.end();
    //   });
    // } else {
    //   res.redirect('login');
    // }

  new User({ username: username, password: password }).fetch().then(function(found) {
    if (found) {
      // need to add a session when found
      req.session.regenerate(function() {
        req.session.user = username;
        res.redirect('/');
      });
    } else {
      res.writeHead(404, {location: '/login'});
      res.end();
    }
  });
});


app.post('/signup', 
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
/************************************************************/
// Add utility functions to check for valid username and password
/************************************************************/

  // if (!util.isValidUrl(uri)) {
  //   console.log('Not a valid url: ', uri);
  //   return res.sendStatus(404);
  // }

  new User({ username: username }).fetch().then(function(found) {
    if (found) {
      res.status(409).send('Username already taken');
    } else {
      Users.create({
        username: username,
        password: password,
      })
      .then(function(newLink) {
        req.session.regenerate(function() {
          req.session.user = username;
          // res.render('index');
          res.redirect('/');
        });
      });
    }
  });
});
/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
