var app = require('express')();
var Promise = require('bluebird');
var http = require('http').Server(app);

/*
*
* HTML
*
*/

var sendHTMLFile = function (fileName) {
    return function (req, res) {
        res.sendFile(__dirname + '/' + fileName + '.html');
    };
};
var getFile = function (fileName) {
    app.get(fileName, function (req, res) {
        res.sendFile(__dirname + '/' + fileName);
    });
};

app.get('/', sendHTMLFile('student'));
app.get('/student', sendHTMLFile('student'));
app.get('/teacher', sendHTMLFile('teacher'));

getFile('/socket.io.js');
getFile('/main.css');

http.listen(4000, function () {
    console.log('listening on *:4000');
});


/*
*
* Server
*
*/


var io = require('socket.io')(http);

//
// Students/Teachers
//

var getNewPerson = (function () {
    var counter = -1;
    var names = ["Pedro", "Carlos", "Marta", "Rosana", "Florencia", "Esteban", "Lenoardo", "Carolina"];
    return function () {
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
var questionMixin = function (_question) {
    _question.isEqualTo = function (question) {
        return _question.timestamp === question.timestamp && _question.student.id === question.student.id;
    };
    return _question;
};

var questions = {
    list: [],
    add: function (question) {
        this.list.push(questionMixin(question));
    },
    notAnswered: function (question, success) {
        return new Promise(function (resolve, reject) {
            questions.list.some(function (_question) {
                if (_question.isEqualTo(question)) {
                    if (!_question.answered) {
                        _question.answered = true;
                        resolve(question);
                    }
                    return true;
                }
            });
            reject(question);
        })
    }
};

var studentQuestionOn = function (socket) {
    socket.on('student question', function (question) {
        console.log(question);
        questions.add(question);
        ioGlobal.emit('student question', question);
    });
};

var teacherAnswerOn = function (socket) {
    socket.on('teacher answer', function (answer) {
        questions.notAnswered(answer.question)
            .then(function () {
                ioGlobal.emit('teacher answer', answer);
            })
            .catch(function (question) {
                console.log(question.text, "Ya fue respondida");
            });
    });
};

//
// Sockets
//


var teachers = io.of('/teachers').on('connection', function (socket) {
    console.log('Nuevo PROFESOR');

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);

    socket.on('typing client', function (typingObj) {
        socket.broadcast.emit('typing server', typingObj);
        socket.emit("finished typing", typingObj.answer);
    });
});

var students = io.of('/students').on('connection', function (socket) {
    console.log('Nuevo ESTUDIANTE');

    socket.emit("whoami", getNewPerson());

    studentQuestionOn(socket);
    teacherAnswerOn(socket);
});

var ioGlobal = {
    list: [students, teachers],
    emit: function (channel, value) {
        this.list.forEach(function (_io) {
            _io.emit(channel, value);
        }, this);
    }
}

// var promisifyer = function(list,method){
//         list.forEach(function (_io) {
//             _io[method+"Async"] = function (event, payload) {
//                 return new Promise(function (resolve, reject) {
//                     return _io[method](event, payload, function () {
//                         var args = _.toArray(arguments)
//                         if (args[0]) return reject(new Error(args[0]))
//                         return resolve.apply(null, args)
//                     })
//                 })
//             }
//         }, this);
// }