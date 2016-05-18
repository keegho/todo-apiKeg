var express = require('express')
var app = express();

var port = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Go visit mom',
	completed: false
}, {
	id: 2,
	description: 'Buy cucumbers',
	completed: false
}, {
	id: 3,
	description: 'soccer match at 12pm',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('Todo api root is working!');
});

app.get('/todos', function (req, res) {
	res.json(todos);
})

app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo;
	todos.forEach(function (todo) {

		if (todoId === todo.id) {
			matchedTodo = todo;
		}
		//return matchedTodo;
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
	//res.send('You called for id ' +  req.params.id);
});

app.listen(port, function (){
	console.log('Server listeining on port ' + port + '...');
});
