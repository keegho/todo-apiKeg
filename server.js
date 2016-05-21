var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var db = require('./db.js');

var port = process.env.PORT || 3000;

var todos = [];
var nextTodoId = 1;

//Used as middlewear
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo api root is working!');
});

// /todos?completed=true&q=keg
app.get('/todos', function(req, res) {
	var queryPrams = req.query;
	var filteredTodos = todos;


	// Query by true or false
	if (queryPrams.hasOwnProperty('completed') && queryPrams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});

	} else if (queryPrams.hasOwnProperty('completed') && queryPrams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	// Query by description
	if (queryPrams.hasOwnProperty('q') && queryPrams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(filtered) {
			return filtered.description.toLowerCase().indexOf(queryPrams.q.toLowerCase()) > -1;
		});
	}
	// } else if() {
	// 	filteredTodos = _.filter(filteredTodos, function (fil))
	// }

	res.json(filteredTodos);
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

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

app.post('/todos', function(req, res) {
	//var body = req.body;
	//Pick what data you need not junk data a hacker can indent
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
			res.json(todo.toJSON());
			//res.json({
		//		"Added": "Item added sucessfully to db"
		//	});
		}).catch(function (e) {
			res.status(400).json(e);
		})
		// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		// 	return res.status(400).send();
		// }

	// body.description = body.description.trim();

	// body.id = nextTodoId++;
	// todos.push(body);

	// //res.json(body);
	// res.send('New item added.');
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		res.status(404).json({
			"Error": "No todo found with that ID"
		});

	} else {

		todos = _.without(todos, matchedTodo);
		res.json({
			"Deleted": "Item deleted"
		});
	}
});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validatedAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validatedAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validatedAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validatedAttributes);
	res.json({
		"Update": "completed sucessfully"
	});
});

db.sequelize.sync().then (function () {

	app.listen(port, function() {
		console.log('Server listeining on port ' + port + '...');
	});
});