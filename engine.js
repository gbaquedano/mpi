// Redis
var Redis = require('ioredis');
var redis = new Redis();
// I2C
var i2c = require('i2c');
var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1'});
// Express y Socket.IO
var app = require('express')();
var serveStatic = require('serve-static')
var server = require('http').Server(app);
var io = require('socket.io')(server);
// Os
var os = require('os');

redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});

server.listen(80);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/scripts',serveStatic(__dirname + '/scripts'))
app.use('/css',serveStatic(__dirname + '/css'))
app.use('/fonts',serveStatic(__dirname + '/fonts'))
app.use('/img',serveStatic(__dirname + '/img'))

io.on('connection', function (socket) {
  console.log("Cliente conectado");
});

wire.scan(function(err, data) {
  // result contains an array of addresses
  if(!err){
		console.log("Scanned i2c ports:" + data);
	}else{
		console.log("Error scanning:" + err);
	}
});

setInterval(leeI2C, 250);

function leeI2C(){
	/*
	wire.write([6], function(err) {
	if(err){
		console.log("Error writing:" + err);
	}
	});
	*/
	wire.read(1, function(err,res){
		if(!err){
			//console.log(res);
			var totalmem = os.totalmem();
			var freemem = os.freemem();
			var usedmem = totalmem - freemem;
			var pctmem = ((usedmem/totalmem)*100);
			var avgcpu = os.loadavg();
			//console.log("Mem usage:" + pctmem + "% " + " CPU[1]:" + avgcpu[0] + " CPU[5]:" + avgcpu[1] + " CPU[15]:" + avgcpu[2]);
			io.emit('sensordata', 
			{ 
				cpu: avgcpu[0]*100,
				mem: pctmem,
				vel: Math.random()*100,
				bat: Math.random()*100
			});
		}else{
			console.log("Error reading:" + err);
		}
	});
}
