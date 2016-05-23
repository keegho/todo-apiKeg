var _ = require('underscore');
var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(passvalue) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPass = bcrypt.hashSync(passvalue, salt);

				this.setDataValue('salt', salt);
				this.setDataValue('password', passvalue);
				this.setDataValue('password_hash', hashedPass);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id','email','updatedAt','createdAt');
			}

		}
	});
}