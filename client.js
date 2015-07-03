var io = require('socket.io-client');
var socket = io.connect('http://82.223.28.113:3012', {reconnect:true});

socket.on('connect',function(r){
        console.log('connected');
});

setInterval(function(){
        socket.emit('test','aha');
},1000);
