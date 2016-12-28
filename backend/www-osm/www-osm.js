//IMPORTS
var http = require("http");

var wayServices = require('./services/wayServices.js');
var nodeServices = require('./services/nodeServices.js');
var searchServices = require('./services/searchServices.js');
var sourceServices = require('./services/sourceServices.js');
var styleServices = require('./services/styleServices.js');
var importServices = require('./services/importServices.js');
//var bboxServices = require('./services/bboxServices.js');
//var relationServices = require('./services/relationServices.js');

var express = require('express'),
	cors = require('cors'),
	app = express();

//app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//HOME
app.get('/', function(request, response) {
    response.end("<html><head><title>www-osm</title></head><body><div>www-osm</div></body></html>");
});

//SERVER STARTUP
app.listen(8080);

//WEB-SERVICES STARTUP
wayServices.start(app);
nodeServices.start(app);
searchServices.start(app);	
sourceServices.start(app);
styleServices.start(app);
importServices.start(app);
console.log ("server is ready :)");
