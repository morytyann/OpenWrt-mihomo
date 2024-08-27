#!/bin/sh

# MihomoTProxy's installer

# check env
echo "Checking..."
if [ ! -x "/bin/opkg" ]; then
	echo "Only supports OpenWrt!"
	exit 1
fi
if [ ! -x "/usr/sbin/nft" ]; then
	echo "Only support firewall4 with nftables!"
	exit 1
fi
# get arch
arch=$(opkg print-architecture | grep -v all | grep -v noarch | head -n 1 | cut -d ' ' -f 2)
# define tarball
tarball="mihomo_${arch}.tar.gz"
# download
echo "Downloading..."
curl -L -s -o "$tarball" "https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/releases/latest/download/$tarball"
if [ "$?" != 0 ]; then
	echo "Download failed, check your internet connectivity."
	exit 1
fi
# extract
echo "Extracting..."
tar -zxf "$tarball"
if [ "$?" != 0 ]; then
	echo "Extract failed, broken compressed file?"
	exit 1
fi
rm -f "./$tarball"
# install
echo "Installing..."
opkg -V0 install mihomo_*.ipk && opkg -V0 install luci-app-mihomo_*.ipk && opkg -V0 install luci-i18n-mihomo-zh-cn_*.ipk
if [ "$?" != 0 ]; then
	echo "Install failed."
	exit 1
fi
# cleanup
rm -f ./*mihomo*.ipk
