var crypto  = require('./crypto.js');
var  ursa = require('ursa')

var password = {

    add_group_password: function(req, res){
        var client = req.app.get('db');
        var group_id = req.params.id;
        var user = req.user;
        var name = req.body.pass_name;
        var login = req.body.encrypted_login;
        console.log(login)
        var pass = req.body.encrypted_password;
        var note = req.body.note;
        var isAdmin = req.group.admin == user.user_id;

        var user2 = req.body.user
        if (isAdmin) {
            addPassword(client, name, login, pass, note, user2.user_id, group_id, function (success) {
                console.log("add password ")
                if (success) {
                    var response = {
                        success: 'true'
                    };
                    res.json(response);
                } else {
                    res.status(400);
                    res.json({
                        'status': 400,
                        "message": "Database error"
                    })

                }
            })
        }else{
            res.json({
                'status': 400,
                'message': "No credentials"
            })
        }
    },

    get_group_password: function(req, res){
        var client = req.app.get('db');
        var pass_id = req.params.passid;
        var key_password = req.headers.key_password

        var user = req.user

        crypto.getPrivateKey(user.user_id, client, function(pem){
            if (pem == null) {
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Cant fetch private key"
                });
                return
            }

            getPassword(client, pass_id, function (response) {
                if (response == null) {
                    res.status(400);
                    res.json({
                        "status": 400,
                        "message": "Can not find password"
                    });
                    return;
                }

                try {
                    if (key_password == null) {
                        throw Error
                    }
                    // console.log(response.login.toString('utf8'))
                    var key = ursa.createPrivateKey(pem, key_password)
                    response.login = key.decrypt(response.login.toString('utf8'), 'base64', 'utf8')
                    response.password = key.decrypt(response.password.toString('utf8'), 'base64', 'utf8')
                    response.note = key.decrypt(response.note.toString('utf8'), 'base64', 'utf8')
                    
                    res.json(response);

                }catch (err){
                    console.log(err)
                     res.status(400);
                     res.json({
                      'status':400,
                      "message": "Error decrypting data"
                    })

                }


            })

        })


    },

    get_group_passwords: function(req, res){
        var client = req.app.get('db');
        var user = req.user;
        var group_id = req.params.id;

        getPasswords(client, group_id, user.user_id, function (response) {
            console.log("getting passwords finished");
            res.json(response)
        })
    },

    get_password_ids: function(req, res){
        var client = req.app.get('db');
        var group_id = req.params.id;
        var pass_name = req.body.passname;
        console.log('in');
        var group = req.group;
        var isAdmin = group.admin == user.user_id;

        if (isAdmin) {
            getPasswordsByName(client, group_id, pass_name, function (response) {
                console.log("getting passwords by name finished");
                res.json(response)
            })
        }else {
            res.status(401);
            res.json({
                "status": 401,
                "message": "User doesnt have permission to get data of these passwords"
            });

        }

    },

    delete_password: function(req, res) {
        var client = req.app.get('db');
        var pass_id = req.param.passid;

        var group = req.group;
        var isAdmin = group.admin == user.user_id;

        if (isAdmin) {
            deletePassword(client,pass_id,function(success){
                if (success) {
                    var response = {
                        success: 'true'
                    };
                    res.json(response);
                } else {
                    res.status(400);
                    res.json({
                        'status': 400,
                        "message": "Could not delete password"
                    })

                }
            })
        }else {
            res.status(401);
            res.json({
                "status": 401,
                "message": "User doesnt have permission to delete password"
            });

        }

    },
};

function getPasswords(client, group_id, user, next){
        var query = client.query(`SELECT pass_id, pass_name from stored_password WHERE "group" = $1 and owner = $2`, [group_id, user]);

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

function getPasswordsByName(client, group_id, pass_name, next){
    var query = client.query(`SELECT pass_id from stored_password WHERE "group" = $1 and pass_name = $2`, [group_id, pass_name]);

    passwords = []
    query.on('error', function (error) {
        console.log(error)
        next(error)
    })

    query.on('row', function(result){
        passwords.push(result);
    })

    query.on('end', function (result) {
        next(passwords)
    })
}

function addPassword(client, pass_name, login_data, pass, note, owner, group, done){

    addPassword.login_data = login_data
    addPassword.pass = pass
    addPassword.note = note

    crypto.getPublicKey(owner, client, function(pem){

        if (pem == null) {
            done(false);
            return;
        }

        var key = ursa.createPublicKey(pem)

        var login_data = key.encrypt(addPassword.login_data, 'utf8', 'base64');
        var pass = key.encrypt(addPassword.pass, 'utf8', 'base64');
        var note = key.encrypt(addPassword.note, 'utf8', 'base64');

        if (group==null){
            var query = client.query(`INSERT INTO stored_password (login, password, note, owner, pass_name)
             VALUES ($1, $2, $3, $4, $5)`, [login_data, pass, note, owner, pass_name]);

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
            var query = client.query(`INSERT INTO stored_password (login, password, note, owner, "group", pass_name)
             VALUES ($1, $2, $3, $4, $5, $6)`, [login_data, pass, note, owner, group, pass_name]);

            query.on('error', function(error){
                console.log(error);
                done(false)
            })

            query.on('end', function(result){
                console.log("end");
                done(true)
            })

        }

    })


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

function deletePassword(client, pass_id, next){
    var query = client.query(`DELETE FROM stored_password CASCADE WHERE pass_id = ($1)`, [pass_id]);

    query.on('error', function (error) {
        console.log(error);
        next(false)
    })
    query.on('end', function (result) {
        console.log('password deleted');
        next(true)
    })
}
module.exports = password;
