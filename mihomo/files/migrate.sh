#!/bin/sh

. /lib/functions/network.sh

# delete mihomo.proxy.routing_mark
routing_mark=$(uci -q get mihomo.proxy.routing_mark); [ -n "$routing_mark" ] && uci del mihomo.proxy.routing_mark

# add mihomo.config.mixin
mixin=$(uci -q get mihomo.config.mixin); [ -z "$mixin" ] && uci set mihomo.config.mixin=1

# add mihomo.proxy.dns_hijack
dns_hijack=$(uci -q get mihomo.proxy.dns_hijack); [ -z "$dns_hijack" ] && uci set mihomo.proxy.dns_hijack=1

# add mihomo.mixin.log_level
log_level=$(uci -q get mihomo.mixin.log_level); [ -z "$log_level" ] && uci set mihomo.mixin.log_level=info

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
editor=$(uci -q get mihomo.editor); [ -z "$editor" ] && uci set mihomo.editor=editor

# add mihomo.log
log=$(uci -q get mihomo.log); [ -z "$log" ] && uci set mihomo.log=log

# add mihomo.proxy.bypass_china_mainland_ip
bypass_china_mainland_ip=$(uci -q get mihomo.proxy.bypass_china_mainland_ip); [ -z "$bypass_china_mainland_ip" ] && uci set mihomo.proxy.bypass_china_mainland_ip=0

# get wan interface
network_find_wan wan_dev

# add mihomo.proxy.wan_interfaces
wan_interfaces=$(uci -q get mihomo.proxy.wan_interfaces); [ -z "$wan_interfaces" ] && uci add_list mihomo.proxy.wan_interfaces="$wan_dev"

# add mihomo.mixin.outbound_interface
outbound_interface=$(uci -q get mihomo.mixin.outbound_interface); [ -z "$outbound_interface" ] && uci set mihomo.mixin.outbound_interface="$wan_dev"

# add mihomo.proxy.acl_tcp_dport
acl_tcp_dport=$(uci -q get mihomo.proxy.acl_tcp_dport); [ -z "$acl_tcp_dport" ] && uci add_list mihomo.proxy.acl_tcp_dport="1-65535"

# add mihomo.proxy.acl_udp_dport
acl_udp_dport=$(uci -q get mihomo.proxy.acl_udp_dport); [ -z "$acl_udp_dport" ] && uci add_list mihomo.proxy.acl_udp_dport="1-65535"

# commit
uci commit mihomo

# exit with 0
exit 0
