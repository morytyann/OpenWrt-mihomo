#!/bin/sh

# add mihomo.config.mixin
mixin=$(uci -q get mihomo.config.mixin); [ -z "$mixin" ] && uci set mihomo.config.mixin=1

uci commit mihomo
