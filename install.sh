#!/bin/sh

# MihomoTProxy's installer

# check env
if [[ ! -x "/bin/opkg" || ! -x "/sbin/fw4" ]]; then
	echo "Only supports OpenWrt build with firewall4!"
	exit 1
fi

# define result
result=0

# traverse architectures
while read arch; do
	echo "$arch: start"
	# download
	tarball="mihomo_${arch}.tar.gz"
	echo "$arch: download tarball"
	curl -s -L -o "$tarball" "https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/releases/latest/download/$tarball"
	if [ "$?" != 0 ]; then
		continue
	fi
	# extract
	echo "$arch: extract tarball"
	tar -zxf "$tarball" > /dev/null 2>&1
	if [ "$?" != 0 ]; then
		continue
	fi
	# install
	echo "$arch: install ipks"
	opkg install mihomo_*.ipk > /dev/null 2>&1 && opkg install luci-app-mihomo_*.ipk > /dev/null 2>&1 && opkg install luci-i18n-mihomo-zh-cn_*.ipk > /dev/null 2>&1
	if [ "$?" != 0 ]; then
		continue
	fi
	# success
	echo "Success Install/Update with arch: $arch"
	result=1
	break
done < <(opkg print-architecture | grep -v all | grep -v noarch | cut -d ' ' -f 2)

if [ "$result" == 0 ]; then
	echo "all architectures failed, maybe release is still in building, or just miss/unsupport your arch"
fi

# cleanup
rm -f ./mihomo_*.tar.gz
rm -f ./*mihomo*.ipk
