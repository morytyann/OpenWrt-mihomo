'use strict';
'require baseclass';
'require uci';
'require fs';
'require rpc';

const homeDir = '/etc/mihomo';
const profilesDir = `${homeDir}/profiles`;
const mixinFilePath = `${homeDir}/mixin.yaml`;
const runDir = `${homeDir}/run`;
const runAppLogPath = `${runDir}/app.log`;
const runCoreLogPath = `${runDir}/core.log`;
const runProfilePath = `${runDir}/config.yaml`;
const nftDir = `${homeDir}/nftables`;
const reservedIPNFT = `${nftDir}/reserved_ip.nft`;
const reservedIP6NFT = `${nftDir}/reserved_ip6.nft`;

return baseclass.extend({
    homeDir: homeDir,
    profilesDir: profilesDir,
    mixinFilePath: mixinFilePath,
    runDir: runDir,
    runAppLogPath: runAppLogPath,
    runCoreLogPath: runCoreLogPath,
    runProfilePath: runProfilePath,
    reservedIPNFT: reservedIPNFT,
    reservedIP6NFT: reservedIP6NFT,

    callServiceList: rpc.declare({
        object: 'service',
        method: 'list',
        params: ['name'],
        expect: { '': {} }
    }),

    getAppLog: function () {
        return L.resolveDefault(fs.read_direct(this.runAppLogPath));
    },

    getCoreLog: function () {
        return L.resolveDefault(fs.read_direct(this.runCoreLogPath));
    },

    clearAppLog: function () {
        return fs.exec_direct('/usr/libexec/mihomo-call', ['clear', 'app_log']);
    },

    clearCoreLog: function () {
        return fs.exec_direct('/usr/libexec/mihomo-call', ['clear', 'core_log']);
    },

    listProfiles: function () {
        return L.resolveDefault(fs.list(this.profilesDir), []);
    },

    status: async function () {
        try {
            return (await this.callServiceList('mihomo'))['mihomo']['instances']['mihomo']['running'];
        } catch (ignored) {
            return false;
        }
    },

    reload: function () {
        return fs.exec_direct('/usr/libexec/mihomo-call', ['service', 'reload']);
    },

    restart: function () {
        return fs.exec_direct('/usr/libexec/mihomo-call', ['service', 'restart']);
    },

    appVersion: function () {
        return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'app']), 'Unknown');
    },

    coreVersion: function () {
        return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'core']), 'Unknown');
    },

    callMihomoAPI: async function (method, path, body) {
        const running = await this.status();
        if (running) {
            const apiPort = uci.get('mihomo', 'mixin', 'api_port');
            const apiSecret = uci.get('mihomo', 'mixin', 'api_secret');
            const url = `http://${window.location.hostname}:${apiPort}${path}`;
            await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${apiSecret}` },
                body: body
            })
        } else {
            alert(_('Service is not running.'));
        }
    },

    openDashboard: async function () {
        const running = await this.status();
        if (running) {
            const uiName = uci.get('mihomo', 'mixin', 'ui_name');
            const apiPort = uci.get('mihomo', 'mixin', 'api_port');
            const apiSecret = uci.get('mihomo', 'mixin', 'api_secret');
            let url;
            if (uiName) {
                url = `http://${window.location.hostname}:${apiPort}/ui/${uiName}/?host=${window.location.hostname}&hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
            } else {
                url = `http://${window.location.hostname}:${apiPort}/ui/?host=${window.location.hostname}&hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
            }
            window.open(url, '_blank');
        } else {
            alert(_('Service is not running.'));
        }
    },
})