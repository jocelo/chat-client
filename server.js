var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    nickNames = [];

var PORT = '8080';

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});

server.listen(PORT);
console.log(' [] Magic on address:',PORT);

io.sockets.on('connection',function(socket){
    socket.on('new_user',function(data, callback){
        if (nickNames.indexOf(data.nickName) != -1) {
            callback({isValid: false});
        } else {
            socket.nickname = data.nickName;
            nickNames.push(data.nickName);
            io.sockets.emit('nicknames',nickNames);
            callback({isValid:true, users:nickNames});
            // io.sockets.emit('new message',{msg:data.msg, user:data.user});
        }
    });

    socket.on('send_message',function(data){
        io.sockets.emit('send_message',{msg:data.msg, user:data.user});
    });
});