var app = require('express')();
var http = require('http').Server(app);

/*
*
* HTML
*
*/

var sendHTMLFile = function(fileName) {
    return function(req, res) {
        res.sendFile(__dirname + '/' + fileName + '.html');
    };
};
var getFile = function(fileName) {
    app.get(fileName, function(req, res) {
        res.sendFile(__dirname + '/' + fileName);
    });
};

app.get('/', sendHTMLFile('alumno'));
app.get('/alumno', sendHTMLFile('alumno'));
app.get('/profesor', sendHTMLFile('profesor'));

getFile('/socket.io.js');
getFile('/main.css');

http.listen(4000, function(){
  console.log('listening on *:4000');
});


/*
*
* Server
*
*/

var createModelForChannel = function(channel) {
    return {
        amount: 0,
        channel: channel,
        bindOnSocket: function(socket) {
            socket.on(this.channel, this.add.bind(this));
        },
        add: function(text) {
            this.amount += 1;

            console.log(this.channel, this.amount);

            io2000.emit(channel, text + ' ' + this.amount);
            io3000.emit(channel, text + ' ' + this.amount);
        }
    };
};

var question = createModelForChannel('student question');
var answer   = createModelForChannel('teacher answer');

var students = [];
var teachers = [];

var io2000 = require('socket.io')(http);
var io3000 = require('socket.io')(http);


console.log('Estudiante listening on 2000');

io2000.listen(2000).on('connection', function(socket) {
    students.push(socket);

    console.log('Nuevo ESTUDIANTE');

    question.bindOnSocket(socket);
    answer.bindOnSocket(socket);
});

console.log('Profesor listening on 3000');

io3000.listen(3000).sockets.on('connection', function(socket){
    teachers.push(socket);

    console.log('Nuevo PROFESOR');

    question.bindOnSocket(socket);
    answer.bindOnSocket(socket);

    socket.on('typing client', function(typingText){
        console.log('Socket started typing');
        socket.broadcast.emit('typing server', typingText);
    });
});
