#!/bin/sh

. /lib/functions.sh

load_config() {
	config_load upnpd
	config_get enabled "config" "enabled" 0
	config_get upnp_lease_file "config" "upnp_lease_file" "/var/run/miniupnpd.leases"
}

add_upnp_exclusion() {
	local timestamp; timestamp=$(date +%s)
	local lease_expire_at lease_proto lease_src_ip lease_src_port

	while read -r line; do
		lease_expire_at=$(echo "$line" | awk -F ':' '{print $5}')
		local timeout; timeout=$(( lease_expire_at - timestamp ))
		if [ "$timeout" -le 0 ]; then
			continue
		fi
		lease_proto=$(echo "$line" | awk -F ':' '{print tolower($1)}')
		lease_src_ip=$(echo "$line" | awk -F ':' '{print $3}')
		lease_src_port=$(echo "$line" | awk -F ':' '{print $4}')
		nft add element ip mihomo upnp_exclusion \{ "$lease_proto" . "$lease_src_ip" . "$lease_src_port" timeout "${timeout}s" \}
	done < "$upnp_lease_file"
}

load_config
if [ "$enabled" == 0 ]; then
	return
fi

add_upnp_exclusion

while true; do
	inotifywait -e create,modify --include $(basename "$upnp_lease_file") $(dirname "$upnp_lease_file")
	add_upnp_exclusion
done
