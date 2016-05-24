var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-db.sqlite'
});

// how the databse is ...
var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 50]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var user = sequelize.define('user', {
	email: {
		type: Sequelize.STRING
	}
});

Todo.belongsTo(user);
user.hasMany(Todo);

// sync
sequelize.sync({
		//force: true
	}).then(function() {
			console.log("All is in sync")

			user.findById(1).then(function (user) {
				user.getTodos({
					where: {
						completed: true
					}				
				}).then(function (todos) {
					todos.forEach(function (todo) {
						console.log(todo.toJSON());
					});
				});
			});

			// user.create({
			// 	email: 'xmaphiax@hotmail.com'
			// }).then(function() {
			// 	return Todo.create({
			// 		description: 'play soccer in the backyard'
			// 	}).then(function(todo) {
			// 		user.findById(1).then(function(user) {
			// 			user.addTodo(todo);
			// 		}).then(function() {
			// 			return Todo.create({
			// 				description: 'visit mama at home',
			// 				completed: true
			// 			}).then(function(todo) {
			// 				user.findById(1).then(function(user) {
			// 					user.addTodo(todo);
			// 				})
			// 			});
			// 		});
			// 	});


				// add data to database
				// Todo.create({
				// 	description: 'go to school',
				// 	completed: true
				// }).then(function(todo) {
				// 	return Todo.create({
				// 		description: 'play soccer at 8am',
				// 		completed: false
				// 	}).then(function(todo) {
				// 		return Todo.create({
				// 			description: 'come back from school',
				// 			completed: true
				// 		}).then(function(todos) {
				// 			return Todo.findAll({
				// 				where: {
				// 					description: {
				// 						$like: '%school%'
				// 					}
				// 				}
				// 			})
				// 		})
				// 	}).then(function(todos) {
				// 		if (todos) {
				// 			todos.forEach(function(todo) {
				// 				console.log(todo.toJSON());
				// 			});
				// 		} else {
				// 			console.log('No items found');
				// 		}
				// 	}).catch(function(e) {
				// 		console.log(e);
				// 	})
				// });
});