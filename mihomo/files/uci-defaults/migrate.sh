#!/bin/sh

. "$IPKG_INSTROOT/lib/functions/network.sh"

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
network_find_wan wan_interface

# add mihomo.proxy.wan_interfaces
wan_interfaces=$(uci -q get mihomo.proxy.wan_interfaces); [ -z "$wan_interfaces" ] && uci add_list mihomo.proxy.wan_interfaces="$wan_interface"

# add mihomo.proxy.acl_tcp_dport
acl_tcp_dport=$(uci -q get mihomo.proxy.acl_tcp_dport); [ -z "$acl_tcp_dport" ] && uci set mihomo.proxy.acl_tcp_dport="1-65535"

# add mihomo.proxy.acl_udp_dport
acl_udp_dport=$(uci -q get mihomo.proxy.acl_udp_dport); [ -z "$acl_udp_dport" ] && uci set mihomo.proxy.acl_udp_dport="1-65535"

# add mihomo.proxy.ipv4_proxy
ipv4_proxy=$(uci -q get mihomo.proxy.ipv4_proxy); [ -z "$ipv4_proxy" ] && uci set mihomo.proxy.ipv4_proxy=1

# add mihomo.proxy.ipv6_proxy
ipv6_proxy=$(uci -q get mihomo.proxy.ipv6_proxy); [ -z "$ipv6_proxy" ] && uci set mihomo.proxy.ipv6_proxy=0

# set mihomo.proxy.access_control_mode
access_control_mode=$(uci -q get mihomo.proxy.access_control_mode); [ -z "$access_control_mode" ] && uci set mihomo.proxy.access_control_mode="all"

# add mihomo.proxy.transparent_proxy_mode
transparent_proxy_mode=$(uci -q get mihomo.proxy.transparent_proxy_mode); [ -z "$transparent_proxy_mode" ] && uci set mihomo.proxy.transparent_proxy_mode="tproxy"

# add mihomo.mixin.tun_stack
tun_stack=$(uci -q get mihomo.mixin.tun_stack); [ -z "$tun_stack" ] && uci set mihomo.mixin.tun_stack="system"

# add mihomo.mixin.tun_mtu
tun_mtu=$(uci -q get mihomo.mixin.tun_mtu); [ -z "$tun_mtu" ] && uci set mihomo.mixin.tun_mtu="9000"

# add mihomo.mixin.tun_gso
tun_gso=$(uci -q get mihomo.mixin.tun_gso); [ -z "$tun_gso" ] && uci set mihomo.mixin.tun_gso=1

# add mihomo.mixin.tun_gso_max_size
tun_gso_max_size=$(uci -q get mihomo.mixin.tun_gso_max_size); [ -z "$tun_gso_max_size" ] && uci set mihomo.mixin.tun_gso_max_size="65536"

# add mihomo.mixin.tun_endpoint_independent_nat
tun_endpoint_independent_nat=$(uci -q get mihomo.mixin.tun_endpoint_independent_nat); [ -z "$tun_endpoint_independent_nat" ] && uci set mihomo.mixin.tun_endpoint_independent_nat=0

# add mihomo.config.test_profile
test_profile=$(uci -q get mihomo.config.test_profile); [ -z "$test_profile" ] && uci set mihomo.config.test_profile=1

# add mihomo.mixin.dns_ipv6
dns_ipv6=$(uci -q get mihomo.mixin.dns_ipv6); [ -z "$dns_ipv6" ] && uci set mihomo.mixin.dns_ipv6=0

# add mihomo.mixin.hosts
hosts=$(uci -q get mihomo.mixin.hosts); [ -z "$hosts" ] && uci set mihomo.mixin.hosts=$(uci -q get mihomo.mixin.dns_hosts)

# add mihomo.mixin.geoip_asn_url
geoip_asn_url=$(uci -q get mihomo.mixin.geoip_asn_url); [ -z "$geoip_asn_url" ] && uci set mihomo.mixin.geoip_asn_url="https://mirror.ghproxy.com/https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"

# add mihomo.proxy.ipv4_dns_hijack
ipv4_dns_hijack=$(uci -q get mihomo.proxy.ipv4_dns_hijack); [ -z "$ipv4_dns_hijack" ] && uci set mihomo.proxy.ipv4_dns_hijack=$(uci -q get mihomo.proxy.dns_hijack)

# add mihomo.proxy.ipv6_dns_hijack
ipv6_dns_hijack=$(uci -q get mihomo.proxy.ipv6_dns_hijack); [ -z "$ipv6_dns_hijack" ] && uci set mihomo.proxy.ipv6_dns_hijack=$(uci -q get mihomo.proxy.dns_hijack)

# delete mihomo.proxy.dns_hijack
dns_hijack=$(uci -q get mihomo.proxy.dns_hijack); [ -n "$dns_hijack" ] && uci del mihomo.proxy.dns_hijack

# get mihomo.proxy.access_control_mode
access_control_mode=$(uci -q get mihomo.proxy.access_control_mode)

# add mihomo.proxy.lan_proxy
lan_proxy=$(uci -q get mihomo.proxy.lan_proxy); [ -z "$lan_proxy" ] && {
	if [ "$access_control_mode" == "forbid" ]; then
		uci set mihomo.proxy.lan_proxy=0
		uci set mihomo.proxy.access_control_mode="all"
	else
		uci set mihomo.proxy.lan_proxy=1
	fi
}

# add mihomo.mixin.ui_name
ui_name=$(uci -q get mihomo.mixin.ui_name); [ -z "$ui_name" ] && uci set mihomo.mixin.ui_name="metacubexd"

# add mihomo.mixin.ui_url
ui_url=$(uci -q get mihomo.mixin.ui_url); [ -z "$ui_url" ] && uci set mihomo.mixin.ui_url="https://mirror.ghproxy.com/https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip"

# delete mihomo.mixin.ui_razord
ui_razord=$(uci -q get mihomo.mixin.ui_razord); [ -n "$ui_razord" ] && uci delete mihomo.mixin.ui_razord

# delete mihomo.mixin.ui_razord_url
ui_razord_url=$(uci -q get mihomo.mixin.ui_razord_url); [ -n "$ui_razord_url" ] && uci delete mihomo.mixin.ui_razord_url

# delete mihomo.mixin.ui_yacd
ui_yacd=$(uci -q get mihomo.mixin.ui_yacd); [ -n "$ui_yacd" ] && uci delete mihomo.mixin.ui_yacd

# delete mihomo.mixin.ui_yacd_url
ui_yacd_url=$(uci -q get mihomo.mixin.ui_yacd_url); [ -n "$ui_yacd_url" ] && uci delete mihomo.mixin.ui_yacd_url

# delete mihomo.mixin.ui_metacubexd
ui_metacubexd=$(uci -q get mihomo.mixin.ui_metacubexd); [ -n "$ui_metacubexd" ] && uci delete mihomo.mixin.ui_metacubexd

# delete mihomo.mixin.ui_metacubexd_url
ui_metacubexd_url=$(uci -q get mihomo.mixin.ui_metacubexd_url); [ -n "$ui_metacubexd_url" ] && uci delete mihomo.mixin.ui_metacubexd_url

# add mihomo.config.fast_reload
fast_reload=$(uci -q get mihomo.config.fast_reload); [ -z "$fast_reload" ] && uci set mihomo.config.fast_reload=1

# add mihomo.mixin.ipv6
ipv6=$(uci -q get mihomo.mixin.ipv6); [ -z "$ipv6" ] && uci set mihomo.mixin.ipv6=$(uci -q get mihomo.proxy.ipv6_proxy)

# commit
uci commit mihomo

# exit with 0
exit 0
