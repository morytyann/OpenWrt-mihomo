'use strict';
'require baseclass';
'require fs';
'require rpc';

const homeDir = '/etc/mihomo';
const profilesDir = `${homeDir}/profiles`;
const mixinFilePath = `${homeDir}/mixin.yaml`;
const runDir = `${homeDir}/run`;
const runAppLogPath = `${runDir}/app.log`;
const runCoreLogPath = `${runDir}/core.log`;
const runProfilePath = `${runDir}/config.yaml`;

return baseclass.extend({
    homeDir: homeDir,
    profilesDir: profilesDir,
    mixinFilePath: mixinFilePath,
    runDir: runDir,
    runAppLogPath: runAppLogPath,
    runCoreLogPath: runCoreLogPath,
    runProfilePath: runProfilePath,

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

    loadProfile: function () {
        return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['load', 'profile'], 'json'), {});
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
        return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'app']));
    },

    coreVersion: function () {
        return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'core']));
    },

    openDashboard: async function (type) {
        const running = await this.status();
        if (running) {
            const profile = await this.loadProfile();
            const apiListen = profile['external-controller'];
            if (apiListen) {
                const apiPort = apiListen.split(':')[1];
                const apiSecret = profile['secret'] || '';
                let url;
                if (type === 'razord') {
                    url = `http://${window.location.hostname}:${apiPort}/ui/razord/#/?host=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
                } else if (type === 'yacd') {
                    url = `http://${window.location.hostname}:${apiPort}/ui/yacd/?hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
                } else if (type === 'metacubexd') {
                    url = `http://${window.location.hostname}:${apiPort}/ui/metacubexd/#/setup?hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
                } else {
                    return;
                }
                window.open(url, '_blank');
            } else {
                alert(_('External Control is not configured.'));
            }
        } else {
            alert(_('Service is not running.'));
        }
    },
})