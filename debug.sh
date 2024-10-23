#!/bin/sh

{
	echo "# MihomoTProxy Debug Info"
	echo "## system"
	echo "\`\`\`shell"
	cat /etc/openwrt_release
	echo "\`\`\`"
	echo "## kernel"
	echo "\`\`\`"
	uname -a
	echo "\`\`\`"
	echo "## application"
	echo "\`\`\`"
	opkg list-installed | grep mihomo
	echo "\`\`\`"
	echo "## config"
	echo "\`\`\`"
	uci show mihomo
	echo "\`\`\`"
	echo "## profile"
	echo "\`\`\`yaml"
	cat /etc/mihomo/run/config.yaml
	echo "\`\`\`"
	echo "## ip rule"
	echo "\`\`\`"
	ip rule list
	echo "\`\`\`"
	echo "## ip route"
	echo "\`\`\`"
	echo "TPROXY: "
	ip route list table 80
	echo
	echo "TUN: "
	ip route list table 81
	echo "\`\`\`"
	echo "## ip6 rule"
	echo "\`\`\`"
	ip -6 rule list
	echo "\`\`\`"
	echo "## ip6 route"
	echo "\`\`\`"
	echo "TPROXY: "
	ip -6 route list table 80
	echo
	echo "TUN: "
	ip -6 route list table 81
	echo "\`\`\`"
	echo "## nftables"
	echo "\`\`\`"
	nft list ruleset
	echo "\`\`\`"
	echo "## service"
	echo "\`\`\`json"
	service mihomo info
	echo "\`\`\`"
	echo "## process"
	echo "\`\`\`"
	ps | grep mihomo
	echo "\`\`\`"
	echo "## netstat"
	echo "\`\`\`"
	netstat -nalp | grep mihomo
	echo "\`\`\`"
} > debug.md
