var _ = require('underscore');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var crypto = require('crypto-js');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
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
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						return resolve(user);
					}, function(e) {
						return reject(e);
					});
				});
			},
			findByToken: function (token) {
				return new Promise(function (resolve, reject) {
					try{
						var decodeJWT = jwt.verify(token, '00o()cairo');
						var bytes = crypto.AES.decrypt(decodeJWT.token, 'abcu&7-0');
						var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));

						user.findById(tokenData.id).then(function (user) {
							if(user) {
								 resolve(user);
							} else {
								 reject();
							}
						}, function (e){
							 reject();
						})
					} catch (e) {
						 reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}
				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = crypto.AES.encrypt(stringData, 'abcu&7-0').toString();
					var token = jwt.sign({
						token: encryptedData
					}, '00o()cairo');
					return token;
				} catch (e) {
					//console.log(e);
					return undefined;
				}
			}

		}

	});
	return user;
};