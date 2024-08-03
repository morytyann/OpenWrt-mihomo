#!/bin/sh

# permission
MIHOMO_USER="mihomo"
MIHOMO_GROUP="mihomo"

# routing
FW_TABLE="mihomo"
FW_MARK=80
ROUTE_TABLE=80
TUN_DEVICE="tun"

# paths
PROG="/usr/bin/mihomo"
HOME_DIR="/etc/mihomo"
RUN_DIR="$HOME_DIR/run"
RUN_APP_LOG_PATH="$RUN_DIR/app.log"
RUN_CORE_LOG_PATH="$RUN_DIR/core.log"
RUN_PROFILE_PATH="$RUN_DIR/config.yaml"
RUN_UI_DIR="$RUN_DIR/ui"
MIXIN_FILE_PATH="$HOME_DIR/mixin.yaml"

# scripts
SH_DIR="$HOME_DIR/scripts"
PROFILE_WATCHER_SH="$SH_DIR/profile_watcher.sh"
UPNP_WATCHER_SH="$SH_DIR/upnp_watcher.sh"
TUN_SH="$SH_DIR/tun.sh"

# nftables
NFT_DIR="$HOME_DIR/nftables"
HIJACK_NFT="$NFT_DIR/hijack.nft"
HIJACK6_NFT="$NFT_DIR/hijack6.nft"
HIJACK_TUN_NFT="$NFT_DIR/hijack_tun.nft"
HIJACK6_TUN_NFT="$NFT_DIR/hijack6_tun.nft"
HIJACK_DNS_NFT="$NFT_DIR/hijack_dns.nft"
GEOIP_CN_NFT="$NFT_DIR/geoip_cn.nft"
GEOIP6_CN_NFT="$NFT_DIR/geoip6_cn.nft"
