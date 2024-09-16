#!/bin/sh

{
	echo "# MihomoTProxy Debug Info"
	echo "## version"
	echo "\`\`\`"
	opkg list-installed | grep mihomo
	echo "\`\`\`"
	echo "## config"
	echo "\`\`\`"
	uci show mihomo.config
	echo
	uci show mihomo.proxy
	echo "\`\`\`"
	echo "## service"
	echo "\`\`\`"
	service mihomo info
	echo "\`\`\`"
	echo "## ip rule"
	echo "\`\`\`"
	ip rule list
	echo "\`\`\`"
	echo "## ip route"
	echo "\`\`\`"
	ip route list table 80
	ip route list table 81
	echo "\`\`\`"
	echo "## ip6 rule"
	echo "\`\`\`"
	ip -6 rule list
	echo "\`\`\`"
	echo "## ip6 route"
	echo "\`\`\`"
	ip -6 route list table 80
	ip -6 route list table 81
	echo "\`\`\`"
	echo "## nftables"
	echo "\`\`\`"
	nft list ruleset
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
