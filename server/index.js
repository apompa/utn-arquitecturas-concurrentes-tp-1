// var net = require('net'),
//     util = require('util'),
//     clients = {};

// var server = net.createServer();

// server.on('connection', function(sock) {
//     var fd = sock._handle.fd;

//     clients[fd] = sock;

//     sock.on('close', function() {
//         delete clients[fd];
//     });
// }).listen(3000);

// setInterval(function() {
//     var i, sock;
//     for (i in clients) {
//         sock = clients[i];
//         if (sock.writable) {
//             sock.write("SOCKET: " + i)
//         }
//     }
// }, 4000);

//========================================0000=================================

var express = require('express');
var app = express();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/consultas', function(req, res) {
    // Enviar consultas
});

app.post('/consultas', function(req, res) {
    // Escribir consulta
});
