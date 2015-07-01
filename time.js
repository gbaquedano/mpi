var moment = require('moment-timezone');
console.log(moment().tz('Europe/Madrid').format('DD/MM/YYYYTHH:mm:ssZ'));
