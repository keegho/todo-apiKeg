var express = require('express')
var app = express();

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
	res.send('Todo api root is working!');
});

app.listen(port, function (){
	console.log('Server listeining on port ' + port + '...');
});
