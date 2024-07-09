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

        s = m.section(form.NamedSection, 'log', 'log');

        s.tab('app_log', _('App Log'));

        o = s.taboption('app_log', form.Button, 'scroll_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function () {
            const element = m.lookupOption('mihomo.log._app_log')[0].getUIElement("log").node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        o = s.taboption('app_log', form.TextValue, '_app_log');
        o.rows = 30;
        o.wrap = false;
        o.cfgvalue = function (section_id) {
            return appLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(getAppLog()).then(function (log) {
                option.getUIElement("log").setValue(log);
            });
        }, o));

        s.tab('core_log', _('Core Log'));

        o = s.taboption('core_log', form.Button, 'scroll_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function () {
            const element = m.lookupOption('mihomo.log._core_log')[0].getUIElement("log").node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        o = s.taboption('core_log', form.TextValue, '_core_log');
        o.rows = 30;
        o.wrap = false;
        o.cfgvalue = function (section_id) {
            return coreLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(getCoreLog()).then(function (log) {
                option.getUIElement("log").setValue(log);
            });
        }, o));

        return m.render();
    },
    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
