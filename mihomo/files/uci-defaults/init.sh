#!/bin/sh

. "$IPKG_INSTROOT/lib/functions/network.sh"
. "$IPKG_INSTROOT/etc/mihomo/scripts/constants.sh"

# add firewall include for tun
uci -q batch <<-EOF > /dev/null
	delete firewall.mihomo
	set firewall.mihomo=include
	set firewall.mihomo.type=script
	set firewall.mihomo.path=$TUN_SH
	set firewall.mihomo.fw4_compatible=1
	commit firewall
EOF

# check mihomo.config.init
init=$(uci -q get mihomo.config.init); [ -z "$init" ] && return

# generate random string for api secret and authentication password
random=$(awk 'BEGIN{srand(); print int(rand() * 1000000)}')

# get wan interface
network_find_wan wan_interface

# set mihomo.mixin.api_secret
uci set mihomo.mixin.api_secret="$random"

# set mihomo.@authentication[0].password
uci set mihomo.@authentication[0].password="$random"

# set mihomo.proxy.wan_interfaces
uci add_list mihomo.proxy.wan_interfaces="$wan_interface"

# remove mihomo.config.init
uci del mihomo.config.init

# commit
uci commit mihomo

# exit with 0
exit 0
