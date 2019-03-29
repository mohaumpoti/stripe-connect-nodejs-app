
/*
    ************** Secret API Test Key *****************

    Replace this with your Secret Test Key from here >>
    https://dashboard.stripe.com/account/apikeys
*/
var API_KEY = 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx';

/*
    ************** Stripe Connect Settings - client_id *****************

    Replace this with your Development client_id from here >>
    https://dashboard.stripe.com/account/applications/settings
*/
var CLIENT_ID = 'ca_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';


var AUTHORIZE_URI = 'https://connect.stripe.com/oauth/authorize';
var TOKEN_URI = 'https://connect.stripe.com/oauth/token';

var express = require('express');
var app = express();
var queryString = require('querystring');
var request = require('request');

app.set('port', (process.env.PORT || 5000));


// views is directory for all template files
app.use(express.static(__dirname + '/views/pages'));
app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.send('Congrats on setting up your Node.js App! The Server is Running on Port: ' + app.get('port') + '...')
});

app.get("/authorize", function(req, res) {
  // Authorization (initiated from your Swift App) is requested at this endpoint

  res.redirect(AUTHORIZE_URI + "?" + queryString.stringify({
    response_type: "code",
    scope: "read_write",
    client_id: CLIENT_ID,
    force_login: true

  }));
});


app.get('/redirect', function(req, res){

  //Users are redirected to this endpoint after their request to connect to Stripe is approved.

  var authCode = req.param('code');
  var scope = req.param('scope');
  var error = req.param('error');
  var errorDescription = req.param('error_description');
  var objectID = req.param('object_id');


  if (error) {
    res.render('pages/fail');
  } else {

    // Make /oauth/token endpoint POST request
    request.post({
      url: TOKEN_URI,
      form: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: authCode,
        client_secret: API_KEY
      }
    }, function(err, response, body) {

      if (err) {
        res.render('pages/fail');
        return;
      }

      // {
      //   "token_type": "bearer",
      //   "stripe_publishable_key": PUBLISHABLE_KEY,
      //   "scope": "read_write",
      //   "livemode": false,
      //   "stripe_user_id": USER_ID,
      //   "refresh_token": REFRESH_TOKEN,
      //   "access_token": ACCESS_TOKEN
      // }

      var stripeUserID = JSON.parse(body).stripe_user_id;

      var qs = queryString.stringify({
        stripe_user_id: stripeUserID
      });

      res.redirect('/success?'+qs);

    });
  }
});

app.get('/success', function(req, res) {
  var stripeUserID = req.query.stripe_user_id;

  res.render('pages/success', {
    stripe_user_id: stripeUserID
  });

});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
