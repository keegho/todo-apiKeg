var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();

var port = process.env.PORT || 3000;

var todos = [];
var nextTodoId = 1;

//Used as middlewear
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo api root is working!');
});

app.get('/todos', function (req, res) {
	res.json(todos);
})

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos,{id: todoId});

	// var matchedTodo;
	// todos.forEach(function (todo) {

	// 	if (todoId === todo.id) {
	// 		matchedTodo = todo;
	// 	}
	// 	//return matchedTodo;
	// });

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
	//res.send('You called for id ' +  req.params.id);
});

app.post('/todos', function (req, res) {
	//var body = req.body;
	var body = _.pick(req.body, 'description', 'completed');

	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = nextTodoId++;
	todos.push(body);

	//res.json(body);
	res.send('New item added.');
});

app.listen(port, function (){
	console.log('Server listeining on port ' + port + '...');
});

















