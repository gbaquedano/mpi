var io = require('socket.io')(3012);

io.on('connection',function(d){
        console.log('Test:' + d);
        d.on('test',function(r){
                console.log('Event test' + r);
        });
});

console.log('Server started...');