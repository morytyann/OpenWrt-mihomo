#!/bin/sh
. $IPKG_INSTROOT/lib/functions.sh

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
last_reload=0
reload_interval=5  # 设置最小重载间隔为5秒

while true; do
    if (inotifywait -t 300 -e create,modify --include "$(basename "$profile_path")" "$(dirname "$profile_path")"); then
        current_time=$(date +%s)
        if [ $((current_time - last_reload)) -ge $reload_interval ]; then
            sleep 2  # 等待2秒,允许其他更改完成
            reload_mihomo
            last_reload=$current_time
        fi
    fi
done
