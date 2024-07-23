![GitHub License](https://img.shields.io/github/license/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/morytyann/OpenWrt-mihomo/build.yml?style=for-the-badge&label=build) ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/morytyann/OpenWrt-mihomo/release.yml?style=for-the-badge&label=release) ![GitHub Tag](https://img.shields.io/github/v/tag/morytyann/OpenWrt-mihomo?style=for-the-badge) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/morytyann/OpenWrt-mihomo/total?style=for-the-badge) ![GitHub Repo stars](https://img.shields.io/github/stars/morytyann/OpenWrt-mihomo?style=for-the-badge)

# OpenWrt-mihomo

A project contains mihomo packages for OpenWrt.

## Feature
 - Transparent Proxy
 - Access Control
 - Profile Mixin
 - Compatible with Multiple WAN
 - Edit Profile in LuCI
 - Scheduled Restart

## Usage

See [Wiki](https://github.com/morytyann/OpenWrt-mihomo/wiki)

## How does it work

1. Download dependency files if need.
2. Get mixin config.
3. Mixin and Update profile.
4. Run mihomo.
5. Run hijack prepare script.
6. Add exclusions. (wan inbound, firewall rule/redirect, UPnP)
7. Add router hijack.
8. Add lan hijack with access control.
9. Add cron for scheduled restart.

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
- inotifywait
- yq
- firewall4
- kmod-nft-tproxy

## Warning

- Only support firewall4 and will never support firewall3
- Will only support IPv4 for a long time
