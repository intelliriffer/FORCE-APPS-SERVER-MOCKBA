#!/bin/sh
mount remount / -o rw,remount
cp nodeserver.service /usr/lib/systemd/system/
cp start-nodeserver /usr/bin/
mount remount / -o r,remount
systemctl enable nodeserver.service
systemctl start nodeserver.service &
