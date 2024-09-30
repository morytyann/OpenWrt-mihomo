#!/bin/sh

. "$IPKG_INSTROOT/etc/mihomo/scripts/constants.sh"

# since v1.8.4

dns_doh_prefer_http3=$(uci -q get mihomo.mixin.dns_doh_prefer_http3); [ -z "$dns_doh_prefer_http3" ] && uci set mihomo.mixin.dns_doh_prefer_http3=0

# commit
uci commit mihomo

# exit with 0
exit 0
