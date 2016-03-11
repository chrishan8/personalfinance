app.factory('Data', function () {
    var data = {
        Accounts: []
    };

    return {
        getAccounts: function () {
            return data.Accounts;
        },
        setAccounts: function (Accounts) {
            data.Accounts = Accounts;
        }
    };
});
