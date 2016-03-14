var db = require('mongoose');

var userSchema = db.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: { type: Array, required: false },
    transactions: {type : Array, required: false},
    access_token: {type: String, required: false}
});

var User = db.model('user', userSchema);

module.exports = {
	User: User
}