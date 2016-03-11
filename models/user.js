var db = require('mongoose');

var userSchema = db.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: { type: Array, required: false },
});

var User = db.model('user', userSchema);

module.exports = {
	User: User
}