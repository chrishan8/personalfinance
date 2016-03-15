app.config(['plaidLinkProvider', function(plaidLinkProvider) {
    plaidLinkProvider.init({
        clientName: 'Slate',
        env: 'tartan',
        key: 'f7cb853e4a261f4587b23b0f1385db',
        product: 'connect'
        });
    }
])