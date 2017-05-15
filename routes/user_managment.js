var user_managment = {
    invite: function(req, res){
        var client = req.app.get('db');
        var user = req.user;

        var group = req.group;

        var email = req.body.invited_email || '';

        var isAdmin = group.admin == user.user_id;
        console.log("invite")
        if (isAdmin) {

            getIdForEmail(client, email, function(id){
                console.log(id)
                if (id == null) {
                    res.status(400);
                    res.json({
                        "status": 400,
                        "message": "Can not invite user"
                    });
                    return;
                }
                var query = client.query(`INSERT INTO "membership" ("group", member, accepted) VALUES ($1, $2, $3)`, [group.group_id ,id, true])
                query.on('error', function(result){
                    console.log(result);
                    res.status(400);
                    res.json({
                        "status": 400,
                        "message": "Can not invite user " + id
                    });
                })
                query.on("end", function(result){
                    res.status(200);
                    res.json({
                        "status": 200,
                        "message": "User invited to the group"
                    })
                })
            })
        }else {

            res.status(401);
            res.json({
                "status": 401,
                "message": "User doesnt have permission to invite other users"
            });

        }

    },
    remove: function(req, res){

        var client = req.app.get('db');
        var user = req.user;

        var group = req.group;

        var invited = req.params.userid;
        var isAdmin = group.admin == user.user_id;

        if (isAdmin) {

            var query = client.query(`DELETE FROM "membership" WHERE "group" = $1 AND member = $2`, [group.group_id ,invited])
            query.on('error', function(result){
                console.log(result);
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Can not remove user"
                });
            })

            query.on("end", function(result){
                res.status(200);
                res.json({
                    "status": 200,
                    "message": "User removed from the group"
                })
            })
        }else {

            res.status(401);
            res.json({
                "status": 401,
                "message": "User doesnt have permission to remove other users"
            });

        }
    }
}

function getIdForEmail(client, email, next){
    var query = client.query(`SELECT user_id FROM user_account WHERE email = $1`, [email])

    query.on('error', function(result) {
        next(null)
    })

    query.on('row', function (result) {
        next(result.user_id)
    })

    query.on('end', function (result) {
        if (result.rowCount == 0) {
            next(null)
        }
    })
}

module.exports = user_managment;