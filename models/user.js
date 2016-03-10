var db = require('mongoose');

var userSchema = db.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

var User = db.model('user', userSchema);

module.exports = {
	User: User
}