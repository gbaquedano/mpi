#!\bin\bash
killall bluetoothd
bluetoothd
hciconfig hci0 up
python test\test-network F8:E0:79:7B:A2:2F nap