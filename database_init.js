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
                            "group" integer references "group"(group_id) ON DELETE CASCADE NOT NULL ,\
                            member integer references user_account(user_id) ON DELETE CASCADE NOT NULL ,\
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

function migration1(err, client, done) {
    if (err) {
        console.log(err)
    }else {
        client.query(`DO $$ 
                        BEGIN 
                            BEGIN 
                                ALTER TABLE user_account ADD COLUMN private_key bytea;
                            EXCEPTION
                            WHEN 
                                duplicate_column THEN RAISE NOTICE 'column private_key already exists in user_account.';
                            END;
                        END;
                      $$`, function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });
    }
}

function migration2(err, client, done) {
    if (err) {
        console.log(err)
    }else {
        client.query(`DO $$ 
                        BEGIN 
                            BEGIN 
                                ALTER TABLE user_account ADD COLUMN public_key bytea;
                            EXCEPTION
                            WHEN 
                                duplicate_column THEN RAISE NOTICE 'column public_key already exists in user_account.';
                            END;
                        END;
                      $$`, function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });
    }
}

function migration3(err, client, done) {
    if (err) {
        console.log(err)
    }else {
        client.query(`DO $$ 
                        BEGIN 
                            BEGIN 
                                ALTER TABLE stored_password ADD COLUMN pass_name varying(250);
                            EXCEPTION
                            WHEN 
                                duplicate_column THEN RAISE NOTICE 'column pass_name already exists in stored_password.';
                            END;
                        END;
                      $$`, function(err, result) {
            done();
            if (err)
            {
                console.error(err);
            }
        });
    }
}

function connect_and_init(err, client, done) {
    initializeUserAccountTable(err, client, function() {
        initializeGroupTable(err, client, function() {
            initializeMembershipTable(err, client, function(){
                initializeStoredPasswordTable(err, client, function(){
                    migration1(err, client, function () {
                        migration2(err, client, function () {
                            migration3(err, client, done);
                        });
                    });
                });
            });
        });
    });
}


module.exports.initializeUserAccountTable = initializeUserAccountTable;
module.exports.initializeGroupTable = initializeGroupTable;
module.exports.initializeMembershipTable = initializeMembershipTable;
module.exports.initializeStoredPasswordTable = initializeStoredPasswordTable;
module.exports.connect_and_init = connect_and_init;