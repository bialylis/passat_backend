var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;

module.exports = function(req, res, next) {

  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 

  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-auth-token'];

  if (token) {
    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());

      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }
      // Authorize the user to see if s/he can access our resources
      var client = req.app.get('db');

      validateUser(decoded.user, client, function(dbUser){
          if (dbUser) {
            req.user = dbUser;
            next();
          } else {
            // No user with this name exists, respond back with a 401
            res.status(401);
            res.json({
              "status": 401,
              "message": "Invalid User"
            });
            return;
          }
      }); // The key would be the logged in user's username

    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};
