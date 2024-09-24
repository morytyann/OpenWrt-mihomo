![GitHub License](https://img.shields.io/github/license/morytyann/OpenWrt-mihomo?style=for-the-badge&logo=github) ![GitHub Tag](https://img.shields.io/github/v/release/morytyann/OpenWrt-mihomo?style=for-the-badge&logo=github) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/morytyann/OpenWrt-mihomo/total?style=for-the-badge&logo=github) ![GitHub Repo stars](https://img.shields.io/github/stars/morytyann/OpenWrt-mihomo?style=for-the-badge&logo=github) [![Telegram](https://img.shields.io/badge/Contact-Telegram-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/mihomotproxy)

# MihomoTProxy

Transparent Proxy with Mihomo on OpenWrt.

> [!WARNING]
>
> - Only support firewall4, it means your OpenWrt version needs to be 22.03 or above

## Feature

- Transparent Proxy (TPROXY/TUN, IPv4 and/or IPv6)
- Access Control
- Compatible with Multiple WAN
- Profile Mixin
- Profile Editor
- Scheduled Restart

## Install & Update

### A. Install From Feed (Recommended)

1. Add Feed

```shell
# only needs to be run once
curl -s -L https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/raw/refs/heads/main/feed.sh | ash
```

2. Install

```shell
# you can install from shell or `Software` menu in LuCI
opkg install mihomo
opkg install luci-app-mihomo
opkg install luci-i18n-mihomo-zh-cn
```

### B. Install From Release

```shell
curl -s -L https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/raw/refs/heads/main/install.sh | ash
```

## Uninstall & Reset

```shell
curl -s -L https://mirror.ghproxy.com/https://github.com/morytyann/OpenWrt-mihomo/raw/refs/heads/main/uninstall.sh | ash
```

## How To Use

See [Wiki](https://github.com/morytyann/OpenWrt-mihomo/wiki)

## How does it work

1. Mixin and Update profile.
2. Run mihomo.
3. Run hijack prepare script.
4. Add router hijack.
5. Add lan hijack with access control.
6. Set scheduled restart.

Note that the steps above may change base on config.

## Compilation

```shell
# add feed
echo "src-git mihomo https://github.com/morytyann/OpenWrt-mihomo.git;main" >> "feeds.conf.default"
# update & install feeds
./scripts/feeds update -a
./scripts/feeds install -a
# make package
make package/luci-app-mihomo/compile
```

The ipk file will be found under `bin/packages/your_architecture/mihomo`.

## Dependencies

- ca-bundle
- curl
- yq
- firewall4
- kmod-nft-tproxy
- ip-full
- kmod-tun
