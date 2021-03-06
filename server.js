var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middlewear = require('./middlewear.js')(db);

var port = process.env.PORT || 3000;

// var todos = [];
// var nextTodoId = 1;

//Used as middlewear
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo api root is working!');
});

// /todos?completed=true&q=keg
app.get('/todos', middlewear.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

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
			res.sendStatus(404).send();
		}

	}).catch(function(e) {
		res.sendStatus(500).send();
	});

});

app.get('/todos/:id', middlewear.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.sendStatus(404).send();
		}

	}).catch(function(e) {
		res.sendStatus(500).send();
	});

});

app.post('/todos', middlewear.requireAuthentication, function(req, res) {
	//Pick what data you need not junk data a hacker can indent
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function() {
			res.sendStatus(201).send(); //.json(todo.toJSON());
		});

	}, function (e) {
		res.sendStatus(400).send();
	})

});

app.delete('/todos/:id', middlewear.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(dtodo) {

		if (dtodo === 0) {
			res.sendStatus(404).json({
				error: 'Non found to be deleted'
			});
		} else {
			res.sendStatus(204).send();
		}

	}).catch(function(e) {
		res.sendStatus(500).send();
	})

});

app.put('/todos/:id', middlewear.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};


	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.sendStatus(400).send();
			})
		} else {
			res.sendStatus(404).send();
			
		}
	}, function() {
		res.sendStatus(500).send();
	});
});

// Create New user
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
		res.sendStatus(201).send(); //json(user.toPublicJSON())
	}).catch(function(e) {
		res.sendStatus(400).send();
	});
});

// Login user
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});

	}).then (function (tokenInstance) {

		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());

	}).catch (function(e) {
		res.sendStatus(401).send();
	});

});

// Logout user "DELETE TOKEN"
app.delete('/users/login', middlewear.requireAuthentication, function (res, req) {

	req.token.destroy().then(function () {
		res.sendStatus(204).send();
	}).catch (function () {
		res.sendStatus(500).send();
	});
});

db.sequelize.sync(/*{force: true}*/ ).then(function() {

	app.listen(port, function() {
		console.log('Server listeining on port ' + port + '...');
	});
});