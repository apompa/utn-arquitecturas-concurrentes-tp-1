var net = require('net');
var client = new net.Socket();

client.connect(3000, 'localhost', function() {
    console.log('Connected!!');
});

client.on('data', function(data) {
    console.log('Received ' + data);
});

client.on('close', function() {
    console.log('Closing..');
});

if(process.argv.length > 2) {
    client.write(process.argv[2]);
}