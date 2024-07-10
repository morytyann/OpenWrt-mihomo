#!/bin/sh

# delete mihomo.proxy.routing_mark
routing_mark=$(uci -q get mihomo.proxy.routing_mark); [ -n "$routing_mark" ] && uci del mihomo.proxy.routing_mark

# add mihomo.config.mixin
mixin=$(uci -q get mihomo.config.mixin); [ -z "$mixin" ] && uci set mihomo.config.mixin=1

# add mihomo.proxy.dns_hijack
dns_hijack=$(uci -q get mihomo.proxy.dns_hijack); [ -z "$dns_hijack" ] && uci set mihomo.proxy.dns_hijack=1

# add mihomo.mixin.log_level
log_level=$(uci -q get mihomo.mixin.log_level); [ -z "$log_level" ] && uci set mihomo.mixin.log_level='info'

# add mihomo.mixin.authentication
authentication=$(uci -q get mihomo.mixin.authentication); [ -z "$authentication" ] && {
    uci set mihomo.mixin.authentication=1
    uci add mihomo.authentication
    uci set mihomo.@authentication[-1].enabled=1
    uci set mihomo.@authentication[-1].username=mihomo
    uci set mihomo.@authentication[-1].password=$(awk 'BEGIN{srand(); print int(rand() * 1000000)}')
}

# add mihomo.status
status=$(uci -q get mihomo.status); [ -z "$status" ] && uci set mihomo.status=status

# add mihomo.editor
editor=$(uci -q get mihomo.editor); [ -z "$status" ] && uci set mihomo.editor=editor

# add mihomo.log
log=$(uci -q get mihomo.log); [ -z "$status" ] && uci set mihomo.log=log

# add mihomo.proxy.bypass_china_mainland_ip
bypass_china_mainland_ip=$(uci -q get mihomo.proxy.bypass_china_mainland_ip); [ -z "$bypass_china_mainland_ip" ] && uci set mihomo.proxy.bypass_china_mainland_ip=0

# commit
uci commit mihomo

# exit with 0
exit 0
