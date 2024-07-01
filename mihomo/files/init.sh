#!/bin/sh

# check mihomo.config.init
init=$(uci -q get mihomo.config.init); [ -z "$init" ] && return

# set mihomo.mixin.api_secret
uci set mihomo.mixin.api_secret=$(awk 'BEGIN{srand(); print int(rand() * 1000000)}')

# set mihomo.@authentication[0].password
uci set mihomo.@authentication[0].password=$(awk 'BEGIN{srand(); print int(rand() * 1000000)}')

# remove mihomo.config.init
uci del mihomo.config.init

# commit
uci commit mihomo
