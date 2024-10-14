#!/bin/sh

. "$IPKG_INSTROOT/etc/mihomo/scripts/constants.sh"

# since v1.8.4

dns_doh_prefer_http3=$(uci -q get mihomo.mixin.dns_doh_prefer_http3); [ -z "$dns_doh_prefer_http3" ] && uci set mihomo.mixin.dns_doh_prefer_http3=0

# since v1.8.7

mixin_file_content=$(uci -q get mihomo.mixin.mixin_file_content); [ -z "$mixin_file_content" ] && uci set mihomo.mixin.mixin_file_content=$(uci -q get mihomo.config.mixin)

# commit
uci commit mihomo

# exit with 0
exit 0
