'use strict';
'require form';
'require view';
'require fs';
'require poll';

function getAppLog() {
    return L.resolveDefault(fs.read_direct('/etc/mihomo/run/app.log'));
}

function getCoreLog() {
    return L.resolveDefault(fs.read_direct('/etc/mihomo/run/core.log'));
}

return view.extend({
    load: function () {
        return Promise.all([
            getAppLog(),
            getCoreLog()
        ]);
    },
    render: function (data) {
        const appLog = data[0];
        const coreLog = data[1];

        let m, s, o;

        m = new form.Map('mihomo');

        s = m.section(form.NamedSection, 'config', 'config');

        s.tab('app_log', _('App Log'));

        o = s.taboption('app_log', form.DummyValue, '_app_log');
        o.render = function() {
            return E('textarea', { 'id': 'app_log', 'style': 'width: 100%; padding: 4px', 'rows': 30, 'readonly': 'readonly', }, appLog);
        };
        poll.add(function () {
            return L.resolveDefault(getAppLog()).then(function (appLog) {
                const element = document.getElementById("app_log");
                if (element) {
                    element.textContent = appLog;
                }
            });
        });

        s.tab('core_log', _('Core Log'));

        o = s.taboption('core_log', form.DummyValue, '_core_log');
        o.render = function() {
            return E('textarea', { 'id': 'core_log', 'style': 'width: 100%; padding: 4px', 'rows': 30, 'readonly': 'readonly', }, coreLog);
        };
        poll.add(function () {
            return L.resolveDefault(getCoreLog()).then(function (coreLog) {
                const element = document.getElementById("core_log");
                if (element) {
                    element.textContent = coreLog;
                }
            });
        });

        return m.render();
    },
	handleSaveApply: null,
	handleSave: null,
    handleReset: null
})