var password = {

    add_group_password: function(req, res){
        var client = req.app.get('db');
        var group_id = req.params.id;
        var login = req.body.encrypted_login;
        var pass = req.body._encrypted_password;
        var note = req.body.note;

        addPassword(client, login, pass, note, null, group_id, function(success){
            console.log("add password")
            if (success) {
                var response = {
                    success: 'true'
                };
                res.json(response);
            }else {
                res.status(400);
                res.json({
                    'status':400,
                    "message": "Database error"
                })

            }
        })
    },

    get_group_password: function(req, res){
        var client = req.app.get('db');
        var pass_id = req.params.passid;

        getPassword(client, pass_id, function (response) {
            if (response == null) {
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Can not find password"
                });
                return;
            }
            res.json(response);
        })

    },

    get_group_passwords: function(req, res){
        var client = req.app.get('db');
        var user = req.user;
        var group_id = req.params.id;

        getPasswords(client, group_id, null, function (response) {
            console.log("getting passwords finished");
            res.json(response)
        })
    }
}

function getPasswords(client, group_id, user, next){
        var query = client.query(`SELECT pass_id, pass_name from stored_password WHERE "group" = $1 and owner == $2`, [group_id, user]);

        passwords = []
        query.on('error', function (error) {
            console.log(error);
            next(error)
        })

        query.on('row', function (result) {
            passwords.push(result);
        })

        query.on('end', function (result) {
            next(passwords)
        })

}

function addPassword(client, login, pass, note, owner, group, done){
    if (group==null){
        var query = client.query(`INSERT INTO stored_password (login, password, note, owner)
         VALUES ($1, $2, $3, $4)`, [login, pass, note, owner]);

        query.on('error', function (error) {
            console.log(error);
            done(false)
        })

        query.on('end', function (result) {
            console.log("end");
            done(true)
        })
    }
    else{
        var query = client.query(`INSERT INTO stored_password (login, password, note, group)
         VALUES ($1, $2, $3, $4)`, [login, pass, note, group]);

        query.on('error', function(error){
            console.log(error);
            done(false)
        })

        query.on('end', function(result){
            console.log("end");
            done(true)
        })

    }

}

function getPassword(client, pass_id, next) {
    var query = client.query(`SELECT * FROM stored_password WHERE pass_id = $1`, [pass_id]);

    query.on('error', function (error) {
        next(error)
    })
    query.on('row', function (result) {
        next(result)
    })
    query.on('end', function (result) {
        if (result.rowCount == 0){
            next(null)
        }
    })
}

module.exports = password;
