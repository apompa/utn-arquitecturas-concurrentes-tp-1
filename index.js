var app = require('express')();
var Promise = require('bluebird');
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

var io2000 = require('socket.io')(http);
var io3000 = require('socket.io')(http);

var ioEmit = function() {
    io2000.emit.apply(io2000, arguments);
    io3000.emit.apply(io3000, arguments);
};

//
// Students/Teachers
//

var getNewPerson = (function() {
    var counter = -1;
    var names = ["Pedro", "Carlos", "Marta", "Rosana", "Florencia", "Esteban", "Lenoardo", "Carolina"];
    return function() {
        counter += 1;
        return {
            id: counter,
            name: names[counter % names.length]
        };
    };
})();



//
// Questions/Answers
//
var questionMixin = function(_question) {
    _question.isEqualTo = function(question) {
        return _question.timestamp === question.timestamp && _question.student.id === question.student.id;
    };
    return _question;
};

var questions = {
    list: [],
    add: function(question) {
        this.list.push(questionMixin(question));
    },
    notAnswered: function(question, success) {
        return new Promise(function (resolve, reject) {
            this.list.some(function(_question) {
                if(_question.isEqualTo(question)) {
                    if (!_question.answered) {
                        _question.answered = true;
                        resolve(question);
                    }
                    return true;
                }
            });
            reject();
        })
    }
};

var studentQuestionOn = function(socket) {
    socket.on('student question', function(question) {
        questions.add(question);
        ioEmit('student question', question);
    });
};

var teacherAnswerOn = function(socket) {
    socket.on('teacher answer', function(answer) {
        questions.notAnswered(answer.question)
            .then(function() {
                ioEmit('teacher answer', answer);
            })
            .catch(function() {
               console.log(question.text, "Ya fue respondida");
            });
    });
};


//
// Sockets
//

console.log('Estudiante listening on 2000');

io2000.listen(2000).on('connection', function(socket) {
    console.log('Nuevo ESTUDIANTE');

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);
});

console.log('Profesor listening on 3000');

io3000.listen(3000).on('connection', function(socket){
    console.log('Nuevo PROFESOR');

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);

    socket.on('typing client', function(typingObj){
        socket.broadcast.emit('typing server', typingObj);
    });
});