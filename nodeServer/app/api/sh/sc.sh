#!/bin/sh
# Screenshot Capture
dt=$(date +"%Y%m%d_%H%M%S")
/media/662522/Tools/ffmpeg -y -crtc_id 0 -framerate 60 -f kmsgrab -i - -vf 'hwdownload,format=bgr0,transpose=1' -vframes 1 -c:v png /media/662522/Screenshots/$dt.png
echo captured $dt.png
