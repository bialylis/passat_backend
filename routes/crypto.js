var  ursa = require('ursa')

var crypto = {

	generate_new_keypair: function(req, res) {
		var client = req.app.get('db');
    	var user = req.user;
    	var encryption_pass = req.body.encryption_pass;
    	console.log("encryption_pass1 " + encryption_pass)

    	generate(user.user_id,client, encryption_pass, function(success){


    		console.log("generate")
    		if (success) {

	    		query = client.query("DELETE FROM stored_password WHERE owner = ($1)", [user.user_id])
	    		query.on("error", function(result){
		             res.status(400);
		             res.json({
		              'status':400,
		              "message": "Database error"
		            })
	    		})

	    		query.on("end", function(result){
		    		var response = {
		                success: 'true'
		            };
		            res.json(response);
	    		})

    		}else {
	             res.status(400);
	             res.json({
	              'status':400,
	              "message": "Failed generating new keys"
	            })

    		}
    	})
	},

	decrypt: function(req, res){
		var client = req.app.get('db');
    	var user = req.user;
    	var encryption_pass = req.body.encryption_pass;
    	var data = req.body.data

    	getPrivateKey(user.user_id, client, function(pem){
    		if (pem == null) {
	             res.status(400);
	             res.json({
	              'status':400,
	              "message": "User doesn't have a key"
	            })

    		}else {
    			try {
    				var key = ursa.createPrivateKey(pem, encryption_pass)
    				var decrypted = key.decrypt(data, 'base64', 'utf8')
		    		var response = {
		                data: decrypted
		            };
		            res.json(response);

    			}catch (err){
    				console.log(err)
			         res.status(400);
			         res.json({
			          'status':400,
			          "message": "Error decrypting data"
			        })

    			}
    		}
    	})
	},


	publicKeyPem: function(req, res){
		var client = req.app.get('db');
    	var user = req.user;
    	var id = req.params.id;

    	getPublicKey(id, client, function(pem){
    		if (pem == null) {
	             res.status(400);
	             res.json({
	              'status':400,
	              "message": "User doesn't have a key"
	            })

    		}else {
	            res.type('pem')
	            res.end(pem);
    		}
    	})
	},


	privateKeyPem: function(req, res){
		var client = req.app.get('db');
    	var user = req.user;

    	getPrivateKey(user.user_id, client, function(pem){
    		if (pem == null) {
	             res.status(400);
	             res.json({
	              'status':400,
	              "message": "User doesn't have a key"
	            })

    		}else {
	            res.type('pem')
	            res.end(pem);
    		}
    	})
	},

	encrypt: function(req, res){
		var client = req.app.get('db');

    	var data = req.body.data
		var userid = req.body.destination_user_id;

		getPublicKey(userid, client, function(pem){
			console.log("get public key")

			if (pem == null) {
	             res.status(400);
	             res.json({
	              'status':400,
	              "message": "User doesn't have a key"
	            })
			}else {
				try {
					var key = ursa.createPublicKey(pem)
					var encripted = key.encrypt(data, 'utf8', 'base64');
		    		var response = {
		                data: encripted
		            };
		            res.json(response);
				}catch (err){
					console.log(err)
			         res.status(400);
			         res.json({
			          'status':400,
			          "message": "Error decrypting data"
			        })

				}
			}
		})

	},
	getPrivateKey: function(userid, client, done){
		getPrivateKey(userid, client, done)
	},
	getPublicKey: function(userid, client, done) {
		getPublicKey(userid, client, done)
	}



}


function getPrivateKey(userid, client , done) {

	var query = client.query(`SELECT  private_key FROM user_account WHERE user_id = ($1)`, [userid])
	var pem = null

	query.on("row", function(result){
		pem = result.private_key
	})
	query.on("error", function(result){
		done(null)
	})
	query.on("end", function(result){
		done(pem)
	})
}

function getPublicKey(userid, client, done){


	var query = client.query(`SELECT public_key FROM user_account WHERE user_id = ($1)`, [userid])
	var pem = null

	query.on("row", function(result){
		pem = result.public_key

	})
	query.on("error", function(result){
		console.log("getPublicKey errorr")
		done(null)
	})
	query.on("end", function(result){

		done(pem)
	})

}

function generate(userid, client, encryption_pass, done) {

	key = ursa.generatePrivateKey()
	pem = key.toEncryptedPrivatePem(encryption_pass, "aes-128-cfb", "utf8")

	console.log("Pass: " + encryption_pass)

	if (encryption_pass == null) {
		done(false)
		return
	}

	// public = ursa.createPublicKey(key.toPublicPem())
	var query = client.query(`UPDATE user_account SET private_key = ($1), public_key = ($2) WHERE user_id = ($3)`, [pem.toString("utf8"), key.toPublicPem(), userid]);
	query.on("error", function(error){
		console.log(error);
		done(false)
	})

	query.on("end", function(result){
		console.log("end")
		done(true)
	})
}


module.exports = crypto;
