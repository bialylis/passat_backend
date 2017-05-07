var express = require('express');
var cors = require('cors');
var app = express();
var db_init = require('./database_init.js')
var auth = require('./routes/auth.js');
var bodyParser = require('body-parser');

app.use(bodyParser.json());


app.set('port',  (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/backend/public'));

// views is directory for all template files
// app.set('views', __dirname + '/backend/views');
// app.set('view engine', 'ejs');

var corsOptions = {
  origin: ['http://localhost:5001', 'https://passat.herokuapp.com'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());

var routes = require('./routes');
app.use('/auth/*', [require('./middlewares/validateRequest')]);
app.use('/', routes);
// app.use('/login', auth.login);


var pg = require('pg');
//| "postgres://localhost:5432"
pg.connect(process.env.DATABASE_URL , function(err, client, done) {
  if (err) {
    console.error(err);
  }else {
      db_init.connect_and_init(err, client, function(){});

      app.set('db', client);

      app.listen(app.get('port'), function() {
        console.log('Node app is running on port', app.get('port'));
      });

  }
});



