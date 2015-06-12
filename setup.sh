#!\bin\sh
MODULE_EXPRESS=node_modules/express
MODULE_I2C=node_modules/i2c
MODULE_SERVESTATIC=node_modules/serve-static
MODULE_HIREDIS=node_modules/hiredis
MODULE_REDIS=node_modules/redis
MODULE_IOREDIS=node_modules/ioredis
MODULE_SOCKETIO=node_modules/socket.io

MODULES=(MODULE_EXPRESS MODULE_I2C MODULE_SERVESTATIC MODULE_HIREDIS MODULE_REDIS MODULE_IOREDIS MODULE_SOCKETIO)

for i in "${arr[@]}"
do
   echo "$i"
   # or do whatever with individual element of the array
done

if [ ! -f "$MODULE_EXPRESS" ]
then
    echo "El modulo $MODULE_EXPRESS no esta instalado..."
	cp -R "/usr/lib/$MODULE_EXPRESS/" "node_modules"
fi
