#!/bin/sh

. /lib/functions.sh

load_config() {
	config_load mihomo
	config_get enabled "config" "enabled" 0
	config_get profile "config" "profile"
}

reload_mihomo() {
	/etc/init.d/mihomo reload
}

load_config
if [[ "$enabled" == 0 || "$profile" != "file:"* ]]; then
	return
fi

profile_path="${profile/file:/}"

while true; do
	inotifywait -e create,modify --include $(basename "$profile_path") $(dirname "$profile_path")
	reload_mihomo
done
