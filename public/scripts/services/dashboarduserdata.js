app.factory('Data', function () {
    var data = {}

    return {
        getAccount: function () {
            return data;
        },
        setAccount: function (Account) {
            data = Account;
        }
    };
});