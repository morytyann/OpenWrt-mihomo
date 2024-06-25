#!/bin/sh

# add mihomo.config.mixin
mixin=$(uci -q get mihomo.config.mixin); [ -z "$mixin" ] && uci set mihomo.config.mixin=1

# add mihomo.proxy.dns_hijack
dns_hijack=$(uci -q get mihomo.proxy.dns_hijack); [ -z "$dns_hijack" ] && uci set mihomo.proxy.dns_hijack=1

# delete mihomo.proxy.routing_mark
routing_mark=$(uci -q get mihomo.proxy.routing_mark); [ -n "$routing_mark" ] && uci del mihomo.proxy.routing_mark

uci commit mihomo
