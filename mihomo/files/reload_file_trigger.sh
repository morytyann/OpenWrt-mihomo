#!/bin/sh
if (inotifywait -e modify "$1"); then eval "/etc/init.d/$2 reload"; fi
