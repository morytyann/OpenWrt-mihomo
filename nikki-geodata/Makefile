include $(TOPDIR)/rules.mk

PKG_NAME:=nikki-geodata
PKG_VERSION:=2026.08.13
PKG_RELEASE:=1

PKG_LICENSE:=GPL-3.0-only
PKG_MAINTAINER:=Joseph Mory <morytyann@gmail.com>

include $(INCLUDE_DIR)/package.mk

GEODATA_SOURCE_VERSION:=4d8b283b57903e4dd33a9e5a994b6452aac2d21d
GEOSITE_FILE:=geosite.dat.$(PKG_VERSION)
GEOIP_FILE:=geoip.metadb.$(PKG_VERSION)

define Download/geosite
  URL:=https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/$(GEODATA_SOURCE_VERSION)/
  URL_FILE:=geosite.dat
  FILE:=$(GEOSITE_FILE)
  HASH:=e108d9623564b3e7aba740e1ce83f9adc62720b36f09c04ef076eaf2a818364c
endef

define Download/geoip
  URL:=https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/$(GEODATA_SOURCE_VERSION)/
  URL_FILE:=geoip.metadb
  FILE:=$(GEOIP_FILE)
  HASH:=b930c12c5cfd255d5bb3bac219a6de7fb36bddb9123d476ba3c8a277e36a410e
endef

define Package/nikki-geodata
  SECTION:=net
  CATEGORY:=Network
  TITLE:=GeoX data for Nikki
  URL:=https://github.com/MetaCubeX/meta-rules-dat
  PKGARCH:=all
endef

define Package/nikki-geodata/description
  GeoSite and MetaDB GeoIP data for Mihomo running under Nikki.
endef

define Build/Prepare
	$(call Build/Prepare/Default)
	$(call Download,geosite)
	$(call Download,geoip)
endef

define Build/Compile
endef

define Package/nikki-geodata/install
	$(INSTALL_DIR) $(1)/etc/nikki/run
	$(INSTALL_DATA) $(DL_DIR)/$(GEOSITE_FILE) $(1)/etc/nikki/run/GeoSite.dat
	$(INSTALL_DATA) $(DL_DIR)/$(GEOIP_FILE) $(1)/etc/nikki/run/geoip.metadb
endef

$(eval $(call BuildPackage,nikki-geodata))
