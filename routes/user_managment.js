var user_managment = {
	invite: function(req, res){
		var client = req.app.get('db');
    	var user = req.user;

    	var group = req.group;

    	var invited = req.params.userid;
    	var isAdmin = group.admin == user.user_id;

    	if (isAdmin) {

    		var query = client.query(`INSERT INTO "membership" ("group", member, accepted) VALUES ($1, $2, $3)`, [group.group_id ,invited, true])
    		query.on('error', function(result){
    			console.log(result);
	    		res.status(400);
		        res.json({
		            "status": 400,
		            "message": "Can not invite user"
		        });
    		})

    		query.on("end", function(result){
    			res.status(200);
    			res.json({
    				"status": 200,
    				"message": "User invited to the group"
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

module.exports = user_managment;