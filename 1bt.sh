#!\bin\bash
hciconfig hci0 up
ifdown eth0
pand -c F8:E0:79:7B:A2:2F --persist
ifup bnep0