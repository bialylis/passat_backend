var groups = {

  getAll: function(req, res) {
    var client = req.app.get('db');
    var user = req.user;
    var data=[]

    var query = client.query(`SELECT * FROM "group" WHERE admin = ($1)
                                UNION
                               SELECT group_id, name, admin, secret_word FROM "group" INNER JOIN membership ON "group".group_id = membership."group"
                                WHERE membership.member = ($1) AND membership.accepted = TRUE`, [user.user_id]);
    query.on('end', function(result){
        if ( result.rowCount > 0) {
            res.json(data)
        }
        else{
            res.json([])
        }
    })
    query.on('row', function(row){
      data.push(row)
    })
      query.on('error', function(result){
          res.status(400)
                  res.json({
            'status':400,
            "message": "Database error"
          })

      })
    //var allgroups = data; // Spoof a DB call
    //test
    //res.json(allgroups);
  },

  getOne: function(req, res) {
    var client = req.app.get('db');
    var user = req.user;

    var id = req.params.id;
    var query = client.query(`SELECT * FROM "group" WHERE group_id = ($1)`, [id]);
    query.on('error', function(result){
        res.status(400);
        res.json({
            "status": 400,
            "message": "No such group"
        });
    });
    query.on('row', function(result){
        res.json(result);
                res.json({
            'status':400,
            "message": "Database error"
          })

    })
  },

  create: function(req, res) {
    console.log("create")
    var client = req.app.get('db');
    var user = req.user

    var newgroup = req.body;


    var query = client.query(`INSERT INTO "group" (name, admin, secret_word) VALUES ($1, $2, $3)`, [newgroup.name ,user.user_id, "secret"]);
      query.on('end', function(result) {
            console.log("end")

          var response = {
              success: 'true'
          };
          res.json(newgroup);
      });
      query.on('error', function(result){
          console.log(result)

          res.status(400);
          res.json({
            'status':400,
            "message": "Database error"
          })
      });
  },

  update: function(req, res) {
    var client = req.app.get('db');
    var user = req.user;

    var updategroup = req.body;
    var id = req.params.id;
    var query = client.query(`UPDATE "group" SET name = ($1), secret_word = ($2) WHERE group_id = ($3)`, [updategroup.name, "secret", id]);
      query.on('end', function(result) {
          if(result.rowCount != 1){
              res.status(400);
              res.json({
                  "status": 400,
                  "message": "No such group"
              });
          }
      });
      query.on('row', function(result){
          var response = {
              success: 'true'
          };
          res.json(newgroup);
      })
      query.on('error', function(result){
            res.status(400);
           res.json({
            'status':400,
            "message": "Database error"
          })

      });
  },

  delete: function(req, res) {
    var client = req.app.get('db');
    var user = req.user
    var id = req.params.id;

    var query = client.query(`DELETE FROM "group" WHERE group_id = ($1)`, [id]);

    query.on('end', function(result){
        res.json(true);
    });
    query.on('error', function(result){
        res.status(400);
                res.json({
            'status':400,
            "message": "Database error"
          })

    });
  },
};

var data = [{
  name: 'group 1',
  id: 0
}, {
  name: 'group 2',
  id: 1
}, {
  name: 'group 3',
  id: 2
}];

module.exports = groups;