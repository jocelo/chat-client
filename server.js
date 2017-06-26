var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var PORT = '8080',
    nickNames = [],
    simpleList = [],
    iconsList = [];

app.use('/static',express.static('app'));

app.get('/', function(req, res){
    res.sendFile(__dirname+'/app/index.html');
});

var cookies = [
    'El que teme sufrir, sufre de temor.',
    'Vence al enemigo sin manchar la espada.',
    'Aprende de tus errores y muéstrate humilde ante tus aciertos.',
    'Antes de ser un dragón, hay que sufrir como una hormiga.',
    'No puedes guiar el viento, pero sí puedes cambiar la dirección de tus velas.',
    'No juzgues a alguien sin conocerlo o es muy posible que te equivoques.',
    'Shoot for the moon! If you miss you will still be amongst the stars.',
    'Remember yesterday, but live for today.',
    'Love lights up your world.',
    'You are filled with a sense of urgency. Be patient or you may end up confused.'
],
icons = ['paw','soccer-ball-o','star-o','fire','hand-spock-o','hand-lizard-o','pagelines','street-view','linux','qq','rebel','ra','odnoklassniki'],
iconCursor = 0;

server.listen(PORT);
console.log(' [] Magic on address:',PORT);

io.sockets.on('connection',function(socket){
    socket.on('new_user',function(data, callback){
        if (simpleList.indexOf(data.nickName) != -1) {
            callback({isValid: false});
        } else {
            //socket.nicknames[data.nickName] = icons[iconCursor];
            nickNames.push({name:data.nickName, icon:icons[iconCursor]});
            simpleList.push(data.nickName);
            iconsList.push(icons[iconCursor]);
            iconCursor++;
            io.sockets.emit('nicknames',nickNames);

            var welcomeStr = '<span class="bot-speak">'+data.nickName+"'s in tha house !!! </span><br>"
                + "  > Have a cookie: <b><i>"+cookies[Math.floor((Math.random() * cookies.length))]+'</i></b>';
            
            io.sockets.emit('send_message',{msg:welcomeStr, user:'#b0t', icon:'microchip'});
            callback({isValid:true, users:nickNames});
        }
    });

    socket.on('send_message',function(data){
        if (data.msg.indexOf('#') == 0) {
            if (data.msg == '#cookie') {
                io.sockets.emit('send_message',{msg:"Today's cookie: <b><i>"+cookies[Math.floor((Math.random() * cookies.length))]+'</i></b>', user:'#b0t', icon:'microchip'});
                return;
            } else if (data.msg == '#timeleft') {
                var current = new Date();
                var soLunch = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 13, 0, 0);
                var eoLunch = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 14, 0, 0);
                var sob = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 8, 0, 0);
                var eob = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 17, 0, 0);
                var msg = '';
                if (current < sob) {
                    msg = "malfunction... get me some coffee... pronto!";
                } else if (current > sob && current <= soLunch){
                    soLunch.getMinutes()
                    msg = 'Faltan '+(current.getMinutes()-soLunch.getMinutes())+' mins para salir a lunch... hang in there!!';
                } else if (current > soLunch && current <= eoLunch){
                    msg = 'Comiending... do not disturb';
                } else if (current > eoLunch && current <= eob){
                    msg = 'Ya mero te vas... aguanta '+(current.getMinutes()-eob.getMinutes())+' mins mas! ';
                } else if(current > eob) {
                    msg = 'Party time !!';
                } else {
                    msg = "It's do o'clock";
                }
                io.sockets.emit('send_message',{msg:msg, user:'#b0t', icon:'microchip'});
                return;
            }
        }
        io.sockets.emit('send_message',{msg:data.msg, user:data.user, icon:iconsList[simpleList.indexOf(data.user)]});
    });

    socket.on('notify_users', function(data){
        // if user is specified
        // launc notification
        // with custom icon and msg
        io.sockets.emit('notify_users',data);
    });

    socket.on('emoticon', function(data){
        io.sockets.emit('emoticon',{user:data.user, position:data.position, icon:iconsList[simpleList.indexOf(data.user)]});
    });
});