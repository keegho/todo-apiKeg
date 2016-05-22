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
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		if (todos) {

			res.json(todos);


		} else {
			res.status(404).json({
				"Item": "Not found"
			});
		}

	}).catch(function(e) {
		res.status(500).json(e);
	});

});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).json({
				"Item": "Not Found"
			});
		}

	}).catch(function(e) {
		res.status(500).json(e);
	});

});

app.post('/todos', function(req, res) {
	//Pick what data you need not junk data a hacker can indent
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());

	}).catch(function(e) {
		res.status(400).json(e);
	})

});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(dtodo) {

		if (dtodo === 0) {
			res.status(404).json({
				error: 'Non found to be deleted'
			});
		} else {
			res.status(204).send();
		}

	}).catch(function(e) {
		res.status(500).send(e);
	})

});

app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};


	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			})
		} else {
			res.status(404).json({
				error: 'data not found'
			})
		}
	}, function() {
		res.status(500).send();
	})
});

db.sequelize.sync().then(function() {

	app.listen(port, function() {
		console.log('Server listeining on port ' + port + '...');
	});
});