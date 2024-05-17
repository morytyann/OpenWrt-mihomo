include $(TOPDIR)/rules.mk

PKG_NAME:=mihomo
PKG_VERSION:=1.18.4
PKG_RELEASE:=1715952565

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/metacubex/mihomo/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=7eb425f43fcb1ce512891d7cdab8af60a3f0fffc2ca7cf93087717a7c1b4da02

PKG_BUILD_DEPENDS:=golang/host
PKG_BUILD_PARALLEL:=1
PKG_BUILD_FLAGS:=no-mips16

GO_PKG:=github.com/metacubex/mihomo
GO_PKG_LDFLAGS_X:=$(GO_PKG)/cmd.Version=$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include $(TOPDIR)/feeds/packages/lang/golang/golang-package.mk

define Package/mihomo
  SECTION:=net
  CATEGORY:=Network
  TITLE:=A rule based proxy in Go.
  URL:=https://wiki.metacubex.one
  DEPENDS:=+bash +curl +yq +kmod-nft-tproxy
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

	$(INSTALL_BIN) $(CURDIR)/files/hijack.nft $(1)/etc/mihomo/hijack.nft

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) $(CURDIR)/files/mihomo.conf $(1)/etc/config/mihomo

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(CURDIR)/files/mihomo.init $(1)/etc/init.d/mihomo
endef

define Build/Prepare
	$(Build/Prepare/Default)
	$(RM) -r $(PKG_BUILD_DIR)/rules/logic_test
endef

$(eval $(call GoBinPackage,mihomo))
$(eval $(call BuildPackage,mihomo))