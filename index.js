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

var students = [];
var teachers = [];
var getNewPerson = (function() {
    var counter = -1;
    var names = ["Pedro", "Carlos", "Marta", "Rosana", "Florencia", "Esteban"];
    return function() {
        counter += 1;
        return {
            id: counter,
            name: names[counter % names.length]
        };
    };
})();

var io2000 = require('socket.io')(http);
var io3000 = require('socket.io')(http);

var questions = 0;
var answers   = 0;

console.log('Estudiante listening on 2000');

io2000.listen(2000).on('connection', function(socket) {
    students.push(socket);

    console.log('Nuevo ESTUDIANTE');

    socket.emit("whoami", getNewPerson());

    socket.on('student question', function(question) {
        questions += 1;

        io2000.emit('student question', question.text + ' ' + questions);
        io3000.emit('student question', question.text + ' ' + questions);
    });
    socket.on('teacher answer', function(answer) {
        answers += 1;

        io2000.emit('teacher answer', answer.text + ' ' + answers);
        io3000.emit('teacher answer', answer.text + ' ' + answers);
    });
});

console.log('Profesor listening on 3000');

io3000.listen(3000).sockets.on('connection', function(socket){
    teachers.push(socket);

    console.log('Nuevo PROFESOR');

    socket.emit("whoami", getNewPerson());

    socket.on('student question', function(question) {
        questions += 1;

        io2000.emit('student question', question.text + ' ' + questions);
        io3000.emit('student question', question.text + ' ' + questions);
    });
    socket.on('teacher answer', function(answer) {
        answers += 1;

        io2000.emit('teacher answer', answer.text + ' ' + answers);
        io3000.emit('teacher answer', answer.text + ' ' + answers);
    });

    socket.on('typing client', function(typingText){
        console.log('Socket started typing');
        socket.broadcast.emit('typing server', typingText);
    });
});
