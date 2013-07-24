var express = require('express')
  , routes = require('./routes')
  , profile = require('./routes/profile')
  , http = require('http')
  , path = require('path')
  , RedisStore = require('connect-redis')(express)
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

var app = express();

var redis = require('redis').createClient();

passport.use(new FacebookStrategy({
  //Get this information from your app's page on developers.facebook.com
 	clientID: 'INSERT FACEBOOK CLIENT ID',
  clientSecret: 'INSERT FACEBOOK SECRET',
	callbackURL: '/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
  	// YOLO - use the entire public facebook profile as the session cookie
  	done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({
	secret: "secretysecret",
  //Change this location if you are running Redis remotely
	store: new RedisStore({ host: 'localhost', port: 6397, client: redis})
}));
app.use(passport.initialize());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/profile', profile.show);
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
	passport.authenticate('facebook', { successRedirect: '/profile',
										failureRedirect: '/'}));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
