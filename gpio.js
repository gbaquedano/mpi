var gpio = require('gpio');

var gpio4 = gpio.export(4, {
	direction:'out',
	interval:200,
	ready:function(){
		console.log('ok');
			gpio4.set(0);
			gpio4.unexport();
	}
});

