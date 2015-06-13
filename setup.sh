#!\bin\bash
MODULE[0]=node_modules/express
MODULE[1]=node_modules/i2c
MODULE[2]=node_modules/serve-static
MODULE[3]=node_modules/hiredis
MODULE[4]=node_modules/redis
MODULE[5]=node_modules/ioredis
MODULE[6]=node_modules/socket.io

for i in "${MODULE[@]}"
do
	if [ ! -f "$i" ]
	then
		echo "Instalando el modulo $i ..."
		mkdir -p "$i"
		cp -R "/usr/lib/$i/" "node_modules"
	fi
done

echo "Starting redis..."
redis-server redis.conf

