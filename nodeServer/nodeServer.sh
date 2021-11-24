#!/bin/sh
root=/media/662522
$root/AddOns/nodeServer/app/restart
while [ true ]; 
do
nodep=$(ps | grep -E 'server.js$' | grep -v grep | grep -o -E '[0-9]+' | head -n1)
if [ ! $nodep ];
then
	$root/AddOns/nodeServer/app/restart
fi
sleep 10
done;
