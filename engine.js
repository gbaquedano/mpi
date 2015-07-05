// Console
var chalk = require('chalk');
var failMsg = chalk.white('[' + chalk.red('FALLO') + ']');
var okMsg = chalk.white('[' + chalk.green('OK') + ']');
// Timezone
var moment = require('moment-timezone');
var localTime = function(){ return moment().tz('Europe/Madrid').format('DD/MM/YYYYTHH:mm:ss'); }
// I2C
var i2cinterval;
var i2c = require('i2c');
var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1'});
// Sentilo
var token = 'c956c302086a042dd0426b4e62652273e05a6ce74d0b77f8b5602e0811025066';
var Client = require('node-rest-client').Client;
var client = new Client();
// Redis
var redisc = require('redis').createClient;
//var ioe = require('socket.io-emitter')();
var Redis = require('ioredis');
var redis = new Redis();

// Handle connection reset
process.on('uncaughtException',function(err){
	console.log(err.stack);
	clearInterval(i2cinterval);
	if(!connecting){
		connecting = true;
		connectToDefaultMac();
	}
});
// Util
var macs;
var util = require('util');
var exec = require('child_process').exec;

function connectToDefaultMac(){
	macs = [];
	exec('echo -e "power on\ndevices\nquit\n" | bluetoothctl', function(err,stdout,stderr){
		var re = /^(?!\[NEW\])(?:Device)\s(..:..:..:..:..:..)\s(.*)$/gm;
		var r = stdout.match(re);
		for(var i = 0; i< r.length; i++){
			var s = r[i].split('Device')[1];
			var splitted = s.split(' ');
			var spliced = splitted.splice(0,2);
			spliced.push(splitted.join(' '));
			macs.push([spliced[1],spliced[2]]);
		}
		console.log(macs);
		redis.set('bt-mac', macs[0][0]);
		redis.get('bt-mac', function (err, result) {
			console.log('Connecting to MAC [' + result + ']');
			connectBluetooth(result);
		});
	});
}

connectToDefaultMac();

function connectBluetooth(mac){
	var condev = exec('python /root/mpi/bt-pan.py client ' + mac + ' -r', function(err,stdout,stderr){
		//console.log('Output:' + stdout);
		//console.log(failMsg);
		//console.log('Stderr:' + stderr);
		//console.log('ErrCode:' + err);
		if(err == null){
			console.log('BT:' + okMsg);
			upInterface(mac);
		}else{
			console.log('BT:' + failMsg);
			connectBluetooth(mac);
		}
	});
}

function upInterface(mac){
	var downint = exec('ifdown bnep0', function(){
		var upint = exec('ifup bnep0', function(err,stdout,stderr){
			//console.log('InterfaceErr:' + err);
			if(err == null){
				console.log('Interface:' + okMsg);
				setTimeout(syncTime,1000);
				setTimeout(connectRemoteRedis,1000);
				connecting = false;
			}else{
				console.log('Interface:' + failMsg);
				connectBluetooth(mac);
			}
		});
	});
}

function connectRemoteRedis(){
	var cl = redisc(6379,'82.223.28.113', {auth_pass:'sentilo',return_buffers:true});
	var ioe = require('socket.io-emitter');
	var emitter = ioe(cl);
	setInterval(function(){
		emitter.emit('test','ok');
		console.log('Event sent');
	},1000);
	//ioemitter = ioe(ioe.adapter({pubclient:cl}));
}

function syncTime(){
	exec('rdate ntp.xs4all.nl', function(err_t,stdout_t,stderr_t){
		//console.log(err_t);
		if(err_t == null){
			console.log('Setting time ' + okMsg + ' ' + localTime);
		}else{
			console.log('Setting time ' + failMsg);
		}
		i2cinterval = setInterval(leeI2C, 500);
	});
}

// Express y Socket.IO
var app = require('express')();
var serveStatic = require('serve-static')

var server = require('http').Server(app);
var io = require('socket.io')(server);
// Os
var os = require('os');

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

// Por un lado leer y por otro enviar a clientes

function leeI2C(){
	wire.read(23, function(err,res){
	if(!err){
			var buff = new Buffer(res);
			var lat = buff.readFloatLE(0);
			var lon = buff.readFloatLE(4);
			var year = buff.readInt16LE(8);
			var mon = buff.readUInt8(10);
			var day = buff.readUInt8(11);
			var hr = buff.readUInt8(12);
			var min = buff.readUInt8(13);
			var sec = buff.readUInt8(14);
			var vib = buff.readUint8(15);
			var bat = buff.readUint8(16);
			var ace = buff.readUint8(17);
			var vel = buff.readUint8(18);
			var ind = buff.readUint8(19);
			var ph0 = buff.readUint8(20);
			var ph1 = buff.readUint8(21);
			var ph2 = buff.readUint8(22);
			var ph3 = buff.readUint8(23);
			console.log('I2C:' + okMsg + ' Lat:' + lat + ' Lon:' + lon + ' Year:' + year + ' Month:' + mon + ' Day:' + day + ' Hour:' + hr + ' Min:' + min + ' Sec:' + sec);
			console.log(res);
			var totalmem = os.totalmem();
			var freemem = os.freemem();
			var usedmem = totalmem - freemem;
			var pctmem = ((usedmem/totalmem)*100);
			var avgcpu = os.loadavg();
			//console.log("Mem usage:" + pctmem + "% " + " CPU[1]:" + avgcpu[0] + " CPU[5]:" + avgcpu[1] + " CPU[15]:" + avgcpu[2]);
			var dataPacket = {
				cpu: avgcpu[0]*100,
				mem: pctmem,
				vel: res[0],
				bat: res[1]
			};
			io.emit('sensordata', dataPacket);
			//console.log("Error reading:" + err);
			var sentiloPacket = {
				headers:{ 'IDENTITY_KEY': token },
				data: {
					'sensors':[
						{
							'sensor':'Velocidad',
							'observations':[{
								'value': dataPacket.vel
							}]
						},{
							'sensor':'Bateria',
							'observations':[{
								'value' : dataPacket.bat
							}]
						}
					]
				}
			};
			client.put('http://82.223.28.113:8095/data/SMR15', sentiloPacket, function(data,response){
				console.log('Rest sent...');
			});
		}else{
			console.log('I2C:' + failMsg);
			console.log(err);
			var sentiloPacket = {
				headers:{ 'IDENTITY_KEY': token },
				data: {
					"sensors":[
						{
							"sensor":"Fallos",
							"observations":[{
								"value": "I2C",
								"timestamp": '' + moment().tz('Europe/Madrid').format('DD/MM/YYYYTHH:mm:ss')
							}]
						}
					]
				}
			};
			console.log(sentiloPacket.data.sensors[0]);
			client.put('http://82.223.28.113:8095/data/SMR15', sentiloPacket, function(data,response){
				console.log('Envio rest:' + okMsg);
			});
			client.on('error', function(err){
				console.log('Envio rest:' + failMsg);
				//clearInterval(i2cinterval);
				//connectToDefaultMac();
			});
		}
	});
}
