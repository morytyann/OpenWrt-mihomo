![GitHub License](https://img.shields.io/github/license/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/morytyann/OpenWrt-mihomo/release.yaml?style=for-the-badge&label=release) ![GitHub Tag](https://img.shields.io/github/v/tag/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/morytyann/OpenWrt-mihomo/total?style=for-the-badge) ![GitHub Repo stars](https://img.shields.io/github/stars/morytyann/OpenWrt-mihomo?style=for-the-badge)

# OpenWrt-mihomo

A project contains mihomo packages for OpenWrt.

## Feature
 - Transparent Proxy (TPROXY/TUN, IPv4 and/or IPv6)
 - Access Control
 - Compatible with Multiple WAN
 - Profile Mixin
 - Profile Editor
 - Scheduled Restart

## Usage

See [Wiki](https://github.com/morytyann/OpenWrt-mihomo/wiki)

## How does it work

1. Mixin and Update profile.
2. Run mihomo.
3. Run hijack prepare script.
4. Add exclusions. (wan/wan6 inbound)
5. Add router hijack.
6. Add lan hijack with access control.
7. Set scheduled restart.

Note that the steps above may change base on config.

## Compilation

```shell
# add mihomo feeds
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

## Warning

- Only support firewall4 and will never support firewall3
