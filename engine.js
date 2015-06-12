// I2C
var i2c = require('i2c');
var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1'});
// Express y Socket.IO
var app = require('express')();
var serveStatic = require('serve-static')
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/bower_components',serveStatic(__dirname + '/bower_components'))
app.use('/css',serveStatic(__dirname + '/css'))

io.on('connection', function (socket) {
  console.log("Cliente conectado");
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

wire.scan(function(err, data) {
  // result contains an array of addresses
  if(!err){
		console.log("Scanned i2c ports:" + data);
	}else{
		console.log("Error scanning:" + err);
	}
});

wire.write([6], function(err) {
if(err){
	console.log("Error writing:" + err);
}
});

wire.read(1, function(err,res){
	if(!err){
		console.log(res);
	}else{
		console.log("Error reading:" + err);
	}
});
