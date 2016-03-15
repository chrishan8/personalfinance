var db = require('mongoose');

var slateAccountSchema = db.Schema({
	transactions: {type: Array, required: false},
	budget: {type: Number, required: false}
})

var slateAccountsSchema = db.Schema({
	fixed_expenses: slateAccountSchema,
	investment: slateAccountSchema,
	short_term_savings: slateAccountSchema,
	personal_development: slateAccountSchema,
	personal_spending: slateAccountSchema,
	retirement: slateAccountSchema
})

var userSchema = db.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: { type: Array, required: false },
    transactions: {type : Array, required: false},
    access_token: {type: String, required: false},
    last_updated: {type: String, required: false},
    slateAccounts: slateAccountsSchema
}, { minimize: false });

var User = db.model('user', userSchema);

module.exports = {
	User: User
}