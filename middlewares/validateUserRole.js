module.exports = function(req, res, next) {

  var client = req.app.get('db');
    var user = req.user;
    var groupid = req.params.id;

    console.log("validation")

    var query = client.query(`SELECT * FROM "group" WHERE admin = ($1) AND "group_id" = ($2)
                                UNION
                               SELECT group_id, name, admin, secret_word FROM "group" INNER JOIN membership ON "group".group_id = membership."group"
                                WHERE membership.member = ($1) AND membership.accepted = TRUE AND membership."group" = ($2)`, [user.user_id, groupid]);

    query.on("row", function(result){

      console.log(result);
      req.group = result;
      next();
    });
    query.on("end", function(result){
      if (result.rowCount == 0) {
        res.status(401);
        res.json({
          'status':401,
          "message": "This user does not have access to this group"
        })

      }
    })
    query.on("error", function(result){
       console.log("validation")
      res.status(401);
        res.json({
          'status':401,
          "message": "This user does not have access to this group"
        })
    });


};
