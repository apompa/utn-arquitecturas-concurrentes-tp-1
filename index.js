var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sendFile = function(fileName) {
    return function(req, res) {
      res.sendFile(__dirname + '/' + fileName + '.html');
    };
};

app.get('/', sendFile('alumno'));
app.get('/alumno', sendFile('alumno'));

app.get('/profesor', sendFile('profesor'));


io.on('connection', function(socket){
    socket.on('student question', function(socket){
        console.log('STUDENT');
        io.emit('student question', msg);
    });

    socket.on('teacher answer', function(socket){
        console.log('TEACHER');
        io.emit('teacher answer', msg);
    });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


//socket.on
//socket.broadcast.emit