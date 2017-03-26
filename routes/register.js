var jwt = require('jwt-simple');

var register = {

  register: function(req, res) {


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

    // Fire a query to your DB and check if the credentials are valid
    var response = auth.validate(username, password);
   
    if (!response) { // If authentication fails, we send a 401 back
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials 2"
      });
      return;
    }

    if (response) {

      // If authentication is success, we will generate a token
      // and dispatch it to the client

      res.json(genToken(response));
    }

  },
  validate: function(username, password) {
    // spoofing the DB response for simplicity
    var response = {  
      success: 'true'
    };

    return response;
  },



}


module.exports = register;
