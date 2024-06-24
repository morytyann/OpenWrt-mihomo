include $(TOPDIR)/rules.mk

PKG_NAME:=mihomo
PKG_VERSION:=1.18.5
PKG_RELEASE:=$(shell date +%s)
PKG_BUILD_TIME=$(shell date -u -Iseconds)

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/metacubex/mihomo/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=463f54384a144b63e499db44e3383c7a412a1572809053a42810e4c154b51f5e

PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

GO_PKG:=github.com/metacubex/mihomo
GO_PKG_LDFLAGS_X:=$(GO_PKG)/constant.Version=$(PKG_VERSION) $(GO_PKG)/constant.BuildTime=$(PKG_BUILD_TIME)
GO_PKG_TAGS:=with_gvisor

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/mihomo
  SECTION:=net
  CATEGORY:=Network
  TITLE:=A rule based proxy in Go.
  URL:=https://wiki.metacubex.one
  DEPENDS:=+curl +inotifywait +yq firewall4 +kmod-nft-tproxy
  USERID:=mihomo=7890:mihomo=7890
endef

define Package/mihomo/description
 A rule based proxy in Go.
endef

define Package/mihomo/conffiles
/etc/config/mihomo
endef

define Package/mihomo/install
	$(call GoPackage/Package/Install/Bin,$(1))

	$(INSTALL_DIR) $(1)/etc/mihomo
	$(INSTALL_DIR) $(1)/etc/mihomo/profiles
	$(INSTALL_DIR) $(1)/etc/mihomo/run
	$(INSTALL_DIR) $(1)/etc/mihomo/run/rules
	$(INSTALL_DIR) $(1)/etc/mihomo/run/ui

	$(INSTALL_BIN) $(CURDIR)/files/upnp_lease_watcher.sh $(1)/etc/mihomo/upnp_lease_watcher.sh
	$(INSTALL_BIN) $(CURDIR)/files/hijack.nft $(1)/etc/mihomo/hijack.nft
	$(INSTALL_DATA) $(CURDIR)/files/mixin.yaml $(1)/etc/mihomo/mixin.yaml

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) $(CURDIR)/files/mihomo.conf $(1)/etc/config/mihomo

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(CURDIR)/files/mihomo.init $(1)/etc/init.d/mihomo

	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) $(CURDIR)/files/migrate.sh $(1)/etc/uci-defaults/99_migrate-mihomo

	$(INSTALL_DIR) $(1)/etc/capabilities
	$(INSTALL_DATA) $(CURDIR)/files/capabilities.json $(1)/etc/capabilities/mihomo.json
endef

define Build/Prepare
	$(Build/Prepare/Default)
	$(RM) -r $(PKG_BUILD_DIR)/rules/logic_test
endef

$(eval $(call GoBinPackage,mihomo))
$(eval $(call BuildPackage,mihomo))
