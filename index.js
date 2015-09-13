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

//
// IO
//

var io2000 = require('socket.io')(http);
var io3000 = require('socket.io')(http);

var ioEmit = function() {
    io2000.emit.apply(io2000, arguments);
    io3000.emit.apply(io3000, arguments);
};

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



//
// Student/Teachers
//

var questions = [];

var studentQuestionOn = function(socket) {
    socket.on('student question', function(question) {
        questions.push(question);
        ioEmit('student question', question);
    });
};

var teacherAnswerOn = function(socket) {
    socket.on('teacher answer', function(answer) {
        var wasAnswered = false;
        questions.some(function(question) {
            if(answer.question.timestamp === question.timestamp && answer.question.student.id === question.student.id) {

                if (question.answered) {
                    wasAnswered = true;
                } else {
                    question.answered = true;
                }
                return true;

            }
        });

        if (!wasAnswered) {
            ioEmit('teacher answer', answer);
        }
    });
};


//
// Sockets
//

console.log('Estudiante listening on 2000');

io2000.listen(2000).on('connection', function(socket) {
    console.log('Nuevo ESTUDIANTE');

    students.push(socket);

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);
});

console.log('Profesor listening on 3000');

io3000.listen(3000).sockets.on('connection', function(socket){
    console.log('Nuevo PROFESOR');

    teachers.push(socket);

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);

    socket.on('typing client', function(typingText){
        socket.broadcast.emit('typing server', typingText);
    });
});
