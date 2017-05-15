function initializeUserAccountTable(err, client, done) {
    if (err) {
        console.error(err);
    }else {
        client.query(`CREATE TABLE IF NOT EXISTS user_account (
	  		user_id bigserial primary key,  
	  		username varchar(100) NOT NULL,  
	  		password varchar(200) NOT NULL,  
	  		email varchar(250) NOT NULL,
	  		salt varchar(50),
	  		hash_algorithm varchar(50),
	  		verified BOOLEAN NOT NULL DEFAULT '0'
	  		);`, function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });
    }
}

function initializeGroupTable(err, client, done) {
    if (err) {
        console.error(err);
    }else {
        client.query('CREATE TABLE IF NOT EXISTS "group" (\
                            group_id bigserial primary key,\
                            name character varying(100) NOT NULL,\
                            admin integer references user_account(user_id) NOT NULL,\
                            secret_word character varying(200) NOT NULL);', function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });

    }
}

function initializeMembershipTable(err, client, done) {
    if (err) {
        console.error(err);
    }else {
        client.query(`CREATE TABLE IF NOT EXISTS membership (\
                            membership_id bigserial primary key,\
                            "group" integer references "group"(group_id) NOT NULL,\
                            member integer references user_account(user_id) NOT NULL,\
                            accepted boolean NOT NULL DEFAULT '0');`, function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });

    }
}


function initializeStoredPasswordTable(err, client, done) {
    if (err) {
        console.error(err);
    }else {
        client.query('CREATE TABLE IF NOT EXISTS stored_password (\
                            pass_id bigserial primary key,\
                            login character varying(200),\
                            password character varying(200),\
                            note character varying(250),\
                            owner integer references user_account(user_id),\
                            "group" integer references "group"(group_id));', function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });

    }
}

function connect_and_init(err, client, done) {
    initializeUserAccountTable(err, client, done);
    initializeGroupTable(err, client, done);
    initializeMembershipTable(err, client, done);
    initializeStoredPasswordTable(err, client, done);

}
module.exports.initializeUserAccountTable = initializeUserAccountTable;
module.exports.initializeGroupTable = initializeGroupTable;
module.exports.initializeMembershipTable = initializeMembershipTable;
module.exports.initializeStoredPasswordTable = initializeStoredPasswordTable;
module.exports.connect_and_init = connect_and_init;