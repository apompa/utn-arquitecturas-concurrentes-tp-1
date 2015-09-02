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


var studentsAndTeachers = [];

io.on('connection', function(socket){
    var amountOfQuestions = 0;
    var amountOfAnswers = 0;

    studentsAndTeachers.push(socket);

    socket.on('student question', function(question){
        amountOfQuestions++;
        io.emit('student question', question + " " + amountOfQuestions);
    });

    socket.on('teacher answer', function(answer){
        amountOfAnswers++;
        io.emit('teacher answer', answer + " " + amountOfAnswers);
    });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


//socket.on
//socket.broadcast.emit