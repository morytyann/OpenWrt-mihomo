# OpenWrt-mihomo

A project contains mihomo packages for OpenWrt.

## Feature
 - Switch for Transparent Proxy
 - Switch for Router Proxy
 - Support Access Control
 - Support Profile Mixin
 - Support Subscribe and File
 - Support Scheduled Restart

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

- curl
- inotifywait
- yq
- firewall4
- kmod-nft-tproxy

## Warning

- Only support firewall4 and will never support firewall3
- Will only support ipv4 for a long time
