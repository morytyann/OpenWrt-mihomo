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

See [WiKi](https://github.com/morytyann/OpenWrt-mihomo/wiki) (Under construction).

## How does it work

1. Download dependency files if need.
2. Get mixin config.
3. Mixin and Update profile.
4. Run mihomo.
5. Hijack dns packet to mihomo (router and lan, use redirect).
6. Hijack tcp/udp packet to mihomo (router and lan, both tcp and udp are use tproxy).
7. Skip wan ip inbound
8. Skip firewall rule/redirect config
9. Skip upnp leases if you enabled upnp
10. Add cron for scheduled restart

Note that the steps above will change or not execute if some config/condition are not satisfied.

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
