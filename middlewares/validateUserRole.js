module.exports = function(req, res, next) {

	var client = req.app.get('db');
   	var user = req.user;
    var groupid = req.params.id;

console.log("userid " + user.user_id)

    var query = client.query(`SELECT * FROM "group" WHERE admin = ($1) AND "group_id" = ($2)
                                `, [user.user_id, groupid]);

    query.on("row", function(result){
    	// console.log(result);
    	req.group = result;
   		next();
    });
    query.on("end", function(result){
      console.log(result)
          if(result.rowCount == 0){
                  res.status(401);
                  res.json({
                    'status':401,
                    "message": "This user does not have access to this group"
                  })

          }
    })
    query.on("error", function(result){
    	res.status(401);
        res.json({
          'status':401,
          "message": "This user does not have access to this group"
        })
    });


};

