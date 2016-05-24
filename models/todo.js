var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 50],
				descriptionIsString: function() {
					if (!_.isString(this.description)) {
						throw new Error('Description must be string.')
					}
				}
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			validate: {
				completedIsBoolean: function() {
					if (!_.isBoolean(this.completed)) {
						throw new Error('Completed must be boolean.')
					}
				}
			}
		}


	});
};