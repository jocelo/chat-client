var h = (function(){
    var init = function(){
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, 
    __isWindowBlur = function(){
        return !document.hasFocus();
    },
    _renderNicknames = function( users ){
        var list = '';
        users.map(function(elm){
            list += '<li><i class="fa fa-'+elm.icon+' fa-2x text-success mr-2"></i>'+elm.name+'</li>';
        });
        return '<ul class="list-unstyled">'+list+'</ul>';
    },
    _nickNameUsed = function(){
        return '<div class="alert alert-danger" role="alert">Nickname is already in use</div>'
    },
    _launchNotification = function(options){
        if (Notification.permission) {
            console.log('local user name:', $('#new-nick-name').val());
            console.log('notification name:', options.userTo);
            if (__isWindowBlur() || options.userTo == $('#new-nick-name').val()) {
                var notification = new Notification(options.title, {
                    icon: '/static/img/logo.png',
                    body: options.msg
                });
            }
        }
    };

    init();

    return {
        renderNicknames: _renderNicknames,
        nickNameUsed:  _nickNameUsed,
        notification: _launchNotification
    }
})();

$(function(){
    var socket = io.connect(),
        $loginDiv = $('#login-div'),
        $chatDiv = $('#chat-div'),
        $errorsDiv = $('#login-error-div'),
        $usersList = $('#users-box'),
        $form = $('#message-form'),
        $loginForm = $('#login-form'),
        $box = $('#msg'),
        $user = $('#user-name'),
        $newUserName = $('#new-nick-name'),
        $chat = $('#main-box');

    $('#new-user-modal').modal({backdrop:'static', keyboard:false});

    $('div.dropup').find('ul').on('click', function(e){
        var imageSize = 55,
            parentOffset = $(this).parent().offset(), 
            relX = e.pageX - parentOffset.left,
            relY = $(this).innerHeight() + (e.pageY - parentOffset.top);
        
        socket.emit('emoticon',{user:$newUserName.val(), position:{x:Math.floor( relX / imageSize), y:Math.floor( relY / imageSize)}});
    });

    /*
        client events
    */
    $loginForm.find('button').on('click', function(){
        $loginForm.submit();
    })
    
    $loginForm.on('submit', function(e){
        e.preventDefault();
        $errorsDiv.html('');
        $newUserName.val($newUserName.val().replace(/(<([^>]+)>)/ig, ""));
        $newUserName.val($newUserName.val().replace(/ /g, ""));
        socket.emit('new_user',{nickName:$newUserName.val()},function(res){
            if (res.isValid) {
                $('#new-user-modal').modal('toggle');
                $usersList.html( h.renderNicknames(res.users) );
            } else {
                $errorsDiv.append( h.nickNameUsed() );
            }
        });
    });

    $form.submit(function(e){
        e.preventDefault();
        if (String($box.val()).trim().length == 0) {
            return;
        }
        $box.val($box.val().replace(/(<([^>]+)>)/ig, ""));

        socket.emit('send_message',{msg:$box.val(), user:$newUserName.val()});
        $box.val('');
    });

    /* 
        socket events
    */
    socket.on('send_message',function(data){
        $chat.append('<i class="fa fa-'+data.icon+' mr-2"></i><b>'+data.user+':</b> '+data.msg+'<br />');
    });

    socket.on('nicknames', function(data){
        $usersList.html( h.renderNicknames(data) );
    });

    socket.on('notify', function(data){
        h.notification({title:data.title, icon: '<i class="fa fa-'+data.icon+' mr-2">', msg:data.msg, userTo:data.userTo||''});
    });

    socket.on('emoticon', function(data){
        var emoId = 'emo'+data.position.x+''+data.position.y;
        $chat.append('<i class="fa fa-'+data.icon+' mr-2"></i><b>'+data.user+':</b> <div class="emo '+emoId+'"></div></br>');
    });
});