#!/bin/sh

. "$IPKG_INSTROOT/lib/functions.sh"
. "$IPKG_INSTROOT/etc/mihomo/scripts/constants.sh"

load_config() {
	config_load mihomo
	config_get enabled "config" "enabled" 0
	config_get transparent_proxy_mode "proxy" "transparent_proxy_mode"
}

accept_tun() {
	nft insert rule inet fw4 input iifname "$TUN_DEVICE" counter accept
	nft insert rule inet fw4 forward oifname "$TUN_DEVICE" counter accept
	nft insert rule inet fw4 forward iifname "$TUN_DEVICE" counter accept
}

load_config

if [[ "$enabled" == 0 || "$transparent_proxy_mode" != "tun" ]]; then
	return
fi

accept_tun
