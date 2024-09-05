![GitHub License](https://img.shields.io/github/license/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/morytyann/OpenWrt-mihomo/release.yaml?style=for-the-badge&label=release) ![GitHub Tag](https://img.shields.io/github/v/tag/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/morytyann/OpenWrt-mihomo/total?style=for-the-badge) ![GitHub Repo stars](https://img.shields.io/github/stars/morytyann/OpenWrt-mihomo?style=for-the-badge)

# MihomoTProxy

Transparent Proxy with Mihomo on OpenWrt.

> [!WARNING]
> - Only support firewall4, it means your OpenWrt version needs to be 22.03 or above

## Feature
 - Transparent Proxy (TPROXY/TUN, IPv4 and/or IPv6)
 - Access Control
 - Compatible with Multiple WAN
 - Profile Mixin
 - Profile Editor
 - Scheduled Restart

## Install & Update

`curl -s -L https://raw.githubusercontent.com/morytyann/OpenWrt-mihomo/main/install.sh | ash`

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


