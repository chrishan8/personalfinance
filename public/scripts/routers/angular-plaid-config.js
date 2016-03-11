app.config(['plaidLinkProvider', function(plaidLinkProvider) {
    plaidLinkProvider.init({
        clientName: 'My App',
        env: 'tartan',
        key: 'test_key',
        product: 'auth'
        });
    }
])