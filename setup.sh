#!\bin\sh
MODULE_EXPRESS=node_modules/express
MODULE_I2C=node_modules/i2c
MODULE_SERVESTATIC=node_modules/serve-static
MODULE_HIREDIS=node_modules/hiredis
MODULE_REDIS=node_modules/redis
MODULE_IOREDIS=node_modules/ioredis
MODULE_SOCKETIO=node_modules/socket.io

if [ ! -f "$MODULE_EXPRESS" ]
then
    echo "El modulo $MODULE_EXPRESS no esta instalado..."
	cp -f "/usr/lib/$MODULE_EXPRESS/" "$MODULE_EXPRESS"
fi
