var jwt = require('jwt-simple');
var bcrypt = require('bcrypt')

var auth = {

  login: function(req, res) {


    var username = req.body.username || '';
    var password = req.body.password || '';

    if (username == '' || password == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
    var client = req.app.get('db');
    console.log("client");

    // Fire a query to your DB and check if the credentials are valid
    auth.validate(username, bcrypt.hashSync(password), client, function(dbUserObj){
      console.log("validate");
      if (!dbUserObj) { // If authentication fails, we send a 401 back
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials"
        });
        return;
      }else {
        res.json(genToken(dbUserObj));
      }

    });
   

  },

  validate: function(username, password, client, next) {

    var query = client.query("SELECT user_id, username, email, verified FROM user_account WHERE username = ($1) AND password = ($2) LIMIT 1", [username, password])

    query.on('error', function(result){
      console.log("sql error " + result);
      next(null);
    });

    query.on('row', function(result){
        next(result);
    });
    query.on('end', function(result) {
      if (result.rowCount != 1) {
        next(null);
      }
    })

  },

  validateUser: function(userid, client, next) {

    var query = client.query("SELECT user_id, username, email, verified FROM user_account WHERE user_id = ($1) LIMIT 1", [userid])
    query.on('error', function(result){
        next(null)
    })
    query.on('row', function(result){
        next(result);
    })
    query.on('end', function(result){
      if (result.rowCount != 1) {
        next(null)
      }
    })
  }
}

// private method
function genToken(user) {
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
    exp: expires,
    user: user['user_id']
  }, require('../config/secret')());

  return {
    token: token,
    expires: expires,
    user: user
  };
}

function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;
