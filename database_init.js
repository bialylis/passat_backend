function initalizeUserAccountTable(err, client) {
  	if (err) {
  		console.error(err);
  		response.send(err);
  	}else {
	  	client.query(`CREATE TABLE IF NOT EXISTS user_account (
	  		user_id bigserial primary key,  
	  		username varchar(100) NOT NULL,  
	  		password varchar(200) NOT NULL,  
	  		email varchar(250) NOT NULL,
	  		salt varchar(50),
	  		hash_algorithm varchar(50),
	  		verified BOOLEAN NOT NULL DEFAULT '0',
	  		)`, function(err, result) {
	      if (err)
	       { 
	       		console.error(err);  
	       }  
	    });

	  }
	}

function connect_and_init(pg) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	if (err) {
  		console.error(err);
  	}else {
	  	initalizeUserAccountTable(err, client)


	  	done();
  	}
  });
}

module.exports.connect_and_init = connect_and_init;