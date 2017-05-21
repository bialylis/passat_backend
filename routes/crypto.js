var  ursa = require('ursa')

var crypto = {

	generate_new_keypair: function(req, res) {
		var client = req.app.get('db');
    	var user = req.user;
    	var encription_pass = req.body.encription_pass;

    	generate(user.user_id,client, encription_pass, function(success){
    		console.log("generate")
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

	decrypt: function(req, res){
		var client = req.app.get('db');
    	var user = req.user;
    	var encription_pass = req.body.encription_pass;
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
    				var key = ursa.createPrivateKey(pem, encription_pass)
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
    	getPublicKey(user.user_id, client, function(pem){
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

	console.log("getPublicKey " + userid)

	var query = client.query(`SELECT public_key FROM user_account WHERE user_id = ($1)`, [userid])
	var pem = null

	query.on("row", function(result){
		console.log(result)

		pem = result.public_key

	})
	query.on("error", function(result){
		done(null)
	})
	query.on("end", function(result){

		done(pem)
	})

}

function generate(userid, client, encription_pass, done) {

	key = ursa.generatePrivateKey()
	pem = key.toEncryptedPrivatePem(encription_pass, "aes-128-cfb")

	// console.log(key)

	// public = ursa.createPublicKey(key.toPublicPem())
	var query = client.query(`UPDATE user_account SET private_key = ($1), public_key = ($2) WHERE user_id = ($3)`, [pem, key.toPublicPem(), userid]);
	query.on("error", function(error){
		console.log(error);
		done(false)
	})

	query.on("end", function(result){
		console.log("end")
		done(true)
	})


	// var fs = require('fs');
	// fs.writeFile("file.pem",pem, function(err) {
	// fs.writeFile("pub.pem",key.toPublicPem(), function(err) {

	//   key = ursa.createPrivateKey(fs.readFileSync('file.pem'), "pass");
	//   crt = ursa.createPublicKey(fs.readFileSync('pub.pem'));

	//   console.log('Encrypt with Public');
	//   msg = crt.encrypt("Everything is going to be 200 OK", 'utf8', 'base64');
	//   console.log('encrypted', msg, '\n');

	//   console.log('Decrypt with Private');
	//   msg = key.decrypt(msg, 'base64', 'utf8');
	//   console.log('decrypted', msg, '\n');

	//   console.log('############################################');
	//   console.log('Reverse Public -> Private, Private -> Public');
	//   console.log('############################################\n');

	//   console.log('Encrypt with Private (called public)');
	//   msg = crt.encrypt("Everything is going to be 200 OK", 'utf8', 'base64');
	//   console.log('encrypted', msg, '\n');

	//   console.log('Decrypt with Public (called private)');
	//   msg = key.decrypt(msg, 'base64', 'utf8');
	//   console.log('decrypted', msg, '\n');

	// }); 
	// }); 


	// done()

}


module.exports = crypto;
