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
   echo "$i"
	if [ ! -f "$i" ]
	then
		echo "El modulo $i no esta instalado..."
		cp -R "/usr/lib/$i/" "node_modules"
	fi
done


