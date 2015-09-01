var net = require('net'),
    clients = {};

var server = net.createServer();

server.on('connection', function(socket) {
    var socketFd = socket._handle.fd;

    clients[socketFd] = socket;

    socket.on('data', function(data) {
        var fd, student;
        for (fd in clients) {
            student = clients[fd];
            if (student.writable && socketFd.toString() !== fd.toString()) {
                student.write(data);
            }
        }
    });

    socket.on('close', function() {
        delete clients[socketFd];
    });
});

server.listen(3000);
