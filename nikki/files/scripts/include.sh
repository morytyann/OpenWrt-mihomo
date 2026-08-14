#!/bin/sh

# paths
HOME_DIR="/etc/nikki"
PROFILES_DIR="$HOME_DIR/profiles"
SUBSCRIPTIONS_DIR="$HOME_DIR/subscriptions"
MIXIN_FILE_PATH="$HOME_DIR/mixin.yaml"
RUN_DIR="$HOME_DIR/run"
RUN_PROFILE_PATH="$RUN_DIR/config.yaml"
PROVIDERS_DIR="$RUN_DIR/providers"
RULE_PROVIDERS_DIR="$PROVIDERS_DIR/rule"
PROXY_PROVIDERS_DIR="$PROVIDERS_DIR/proxy"
GEOIP_DAT_PATH="$RUN_DIR/GeoIP.dat"
GEOSITE_DAT_PATH="$RUN_DIR/GeoSite.dat"

# shared geodata
V2RAY_GEODATA_DIR="/usr/share/v2ray"
XRAY_GEODATA_DIR="/usr/share/xray"
MIHOMO_GEODATA_SYMLINK_COW_PATH="/usr/share/mihomo/geodata-symlink-cow"

# log
LOG_DIR="/var/log/nikki"
APP_LOG_PATH="$LOG_DIR/app.log"
CORE_LOG_PATH="$LOG_DIR/core.log"

# temp
TEMP_DIR="/var/run/nikki"
PID_FILE_PATH="$TEMP_DIR/nikki.pid"
STARTED_FLAG_PATH="$TEMP_DIR/started.flag"
BRIDGE_NF_CALL_IPTABLES_FLAG_PATH="$TEMP_DIR/bridge_nf_call_iptables.flag"
BRIDGE_NF_CALL_IP6TABLES_FLAG_PATH="$TEMP_DIR/bridge_nf_call_ip6tables.flag"

# ucode
UCODE_DIR="$HOME_DIR/ucode"
INCLUDE_UC="$UCODE_DIR/include.uc"
MIXIN_UC="$UCODE_DIR/mixin.uc"
HIJACK_UT="$UCODE_DIR/hijack.ut"

# scripts
SH_DIR="$HOME_DIR/scripts"
INCLUDE_SH="$SH_DIR/include.sh"
FIREWALL_INCLUDE_SH="$SH_DIR/firewall_include.sh"

# nftables
NFT_DIR="$HOME_DIR/nftables"
GEOIP_CN_NFT="$NFT_DIR/geoip_cn.nft"
GEOIP6_CN_NFT="$NFT_DIR/geoip6_cn.nft"

# functions
format_filesize() {
	local b; b=1
	local kb; kb=$((b * 1024))
	local mb; mb=$((kb * 1024))
	local gb; gb=$((mb * 1024))
	local tb; tb=$((gb * 1024))
	local pb; pb=$((tb * 1024))
	local size; size="$1"
	if [ -n "$size" ]; then
		if [ "$size" -lt "$kb" ]; then
			echo "$(awk "BEGIN {print $size / $b}") B"
		elif [ "$size" -lt "$mb" ]; then
			echo "$(awk "BEGIN {print $size / $kb}") KB"
		elif [ "$size" -lt "$gb" ]; then
			echo "$(awk "BEGIN {print $size / $mb}") MB"
		elif [ "$size" -lt "$tb" ]; then
			echo "$(awk "BEGIN {print $size / $gb}") GB"
		elif [ "$size" -lt "$pb" ]; then
			echo "$(awk "BEGIN {print $size / $tb}") TB"
		else
			echo "$(awk "BEGIN {print $size / $pb}") PB"
		fi
	fi
}

prepare_files() {
	if [ ! -d "$LOG_DIR" ]; then
		mkdir -p "$LOG_DIR"
	fi
	if [ ! -f "$APP_LOG_PATH" ]; then
		touch "$APP_LOG_PATH"
	fi
	if [ ! -f "$CORE_LOG_PATH" ]; then
		touch "$CORE_LOG_PATH"
	fi
	if [ ! -d "$TEMP_DIR" ]; then
		mkdir -p "$TEMP_DIR"
	fi
}

prepare_geodata_file() {
	local target; target="$1"
	local filename; filename="$2"

	# Keep Nikki-owned data. A symlink is only safe when the active Mihomo
	# package advertises copy-on-write support for GeoData updates.
	if [ -s "$target" ]; then
		if [ -L "$target" ] && [ ! -f "$MIHOMO_GEODATA_SYMLINK_COW_PATH" ]; then
			local tmpfile; tmpfile="$target.tmp.$$"
			if cp -fpL "$target" "$tmpfile" && mv -f "$tmpfile" "$target"; then
				log "GeoX" "Convert unsupported symlink to local file: $target."
				return 0
			fi
			rm -f "$tmpfile"
			log "GeoX" "Failed to convert unsupported symlink: $target."
			return 1
		fi
		return 0
	fi

	# Remove an empty file or a dangling symlink so a usable shared file can
	# replace it, or Mihomo can fall back to its configured download URL.
	if [ -e "$target" ] || [ -L "$target" ]; then
		rm -f "$target"
	fi

	local source
	for source in "$V2RAY_GEODATA_DIR/$filename" "$XRAY_GEODATA_DIR/$filename"; do
		[ -s "$source" ] || continue
		if [ -f "$MIHOMO_GEODATA_SYMLINK_COW_PATH" ]; then
			if ln -s "$source" "$target"; then
				log "GeoX" "Use shared file: $source."
				return 0
			fi
		else
			if cp -fp "$source" "$target"; then
				log "GeoX" "Copy shared file for unpatched core: $source."
				return 0
			fi
		fi
		log "GeoX" "Failed to use shared file: $source."
	done

	return 0
}

prepare_geodata() {
	if ! mkdir -p "$RUN_DIR"; then
		log "GeoX" "Failed to prepare run directory."
		return 1
	fi
	prepare_geodata_file "$GEOIP_DAT_PATH" "geoip.dat" || return 1
	prepare_geodata_file "$GEOSITE_DAT_PATH" "geosite.dat" || return 1
}

log() {
	echo "[$(date "+%Y-%m-%d %H:%M:%S")] [$1] $2" >> "$APP_LOG_PATH"
}
