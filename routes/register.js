var jwt = require('jwt-simple');

var register = {

  register: function(req, res) {

    var client = req.app.get('db');


    var username = req.body.username || '';
    var password = req.body.password || '';
    var email = req.body.email || '';

    if (username == '' || password == '' || email == '') {
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
    console.log("doing")
    // Fire a query to your DB and check if the credentials are valid
    register.validate(username, password, email, client, function(response){

      console.log("done")

      if (!response) { // If authentication fails, we send a 401 back
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials"
        });
        return;
      }else {
        res.json(response);
      }

    });
  },

  insert: function(username, password, email, client, done){

    var query = client.query("INSERT INTO user_account (username, email, password) VALUES ($1, $2, $3)", [username, email, password])
    query.on('end', function(result) {
        var response = {  
          success: 'true'
        };
        done(response);
    });
    query.on('error', function(result){
      done(null);
    });



  },

  validate: function(username, password, email, client, done) {

    var validator = require("email-validator");

    if (!validator.validate(email)) {
        done(null);
        return;
    }
    var query = client.query("SELECT * FROM user_account WHERE username = ($1) OR email = ($2)", [username, email])

    query.on('end', function(result) {
        if (result.rowCount > 0) {
          done(null);
          return;
        }
        register.insert(username, password, email, client, done);
    })
    query.on('error', function(result){
      done(null)
    })
  },



}


module.exports = register;
