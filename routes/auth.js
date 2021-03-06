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
    auth.validate(username, password, client, function(dbUserObj){
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

    var query = client.query("SELECT user_id, username, email, verified, password, CASE WHEN private_key IS NULL THEN 'False' ELSE 'True' END AS has_keys FROM user_account WHERE username = ($1) LIMIT 1", [username])

    query.on('error', function(result){
      console.log("sql error " + result);
      next(null);
    });

    query.on('row', function(result){
      console.log(result)
      result.has_keys = (result.has_keys == 'True');
      if (bcrypt.compareSync(password, result.password))
      {
          result.password = null
          next(result);
      }
      else{
          next(null)
      }

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
