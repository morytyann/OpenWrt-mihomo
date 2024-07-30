#!/bin/sh

. /lib/functions/network.sh

# check mihomo.config.init
init=$(uci -q get mihomo.config.init); [ -z "$init" ] && return

# generate random string for api secret and authentication password
random=$(awk 'BEGIN{srand(); print int(rand() * 1000000)}')

# set mihomo.mixin.api_secret
uci set mihomo.mixin.api_secret="$random"

# set mihomo.@authentication[0].password
uci set mihomo.@authentication[0].password="$random"

# get wan interface
network_find_wan wan_interface
network_find_wan6 wan6_interface

# set mihomo.proxy.wan_interfaces
uci del mihomo.proxy.wan_interfaces
uci add_list mihomo.proxy.wan_interfaces="$wan_interface"

# set mihomo.proxy.wan6_interfaces
uci del mihomo.proxy.wan6_interfaces
uci add_list mihomo.proxy.wan6_interfaces="$wan6_interface"

# set mihomo.mixin.outbound_interface
uci set mihomo.mixin.outbound_interface="$wan_interface"

# remove mihomo.config.init
uci del mihomo.config.init

# commit
uci commit mihomo

# exit with 0
exit 0
