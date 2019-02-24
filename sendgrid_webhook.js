var localtunnel = require('localtunnel');

localtunnel(5000, {
    subdomain: 'jhkjhjkyuihgfd' }, function(err, tunnel) {
        console.log('LT running')
});