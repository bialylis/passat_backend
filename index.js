var express = require('express');
var cors = require('cors');
var app = express();

app.set('port',  (process.env.PORT || 5000));

app.use(express.static(__dirname + '/backend/public'));

// views is directory for all template files
app.set('views', __dirname + '/backend/views');
app.set('view engine', 'ejs');


function testJson(response) {
  console.log("Request handler random was called.");
  response.writeHead(200, {"Content-Type": "application/json"});
  var otherArray = ["TestName", "TestTime"];
  var otherObject = { item1: "test1", item2: new Date() };
  var json = JSON.stringify({ 
    anObject: otherObject, 
    anArray: otherArray, 
    another: "item"	
  });
  response.end(json);
}

app.get('/test', cors(), function(request, response) {
  testJson(response)
});

var pg = require('pg');
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	if (err) {
  		console.error(err);
  		response.send(err);
  	}else {
	  	client.query('SELECT * FROM test_table', function(err, result) {
	      done();
	      if (err)
	       { console.error(err); response.send("Error " + err); }
	      else
	       { response.render('pages/db', {results: result.rows} ); }
	    });

  	}
  });
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

