#!/bin/sh

# MihomoTProxy's feed

# check env
if [[ ! -x "/bin/opkg" || ! -x "/sbin/fw4" ]]; then
	echo "only supports OpenWrt build with firewall4!"
	exit 1
fi

# include openwrt_release
. /etc/openwrt_release

# add key
echo "add key"
key_build_pub_file="key-build.pub"
curl -s -L -o "$key_build_pub_file" "https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/raw/refs/heads/main/key-build.pub"
opkg-key add "$key_build_pub_file"
rm -f "$key_build_pub_file"

# add feed
echo "add feed"
echo "src/gz mihomo https://morytyann.github.io/OpenWrt-mihomo/$DISTRIB_ARCH/mihomo" >> "/etc/opkg/customfeeds.conf"

# update feeds
echo "update feeds"
opkg update

echo "success"
