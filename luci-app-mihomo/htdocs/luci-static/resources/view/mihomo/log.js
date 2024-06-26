'use strict';
'require form';
'require view';
'require fs';
'require poll';

const coreLogPath = "/etc/mihomo/run/core.log";

function getCoreLog() {
    return L.resolveDefault(fs.lines(coreLogPath));
}

return view.extend({
    load: function () {
        return Promise.all([
            getCoreLog
        ]);
    },
    render: function (data) {
        const coreLog = data[0];

        let m, s, o;

        m = new form.Map('mihomo', _('Mihomo'), _('Mihomo is a rule based proxy in Go.'));

        s = m.section(form.NamedSection, 'log', 'log');

        o = s.option(form.DummyValue, '_core_log', _('Core Log'));
        o.render = function() {
            return E('textarea', { 'id' : 'core_log', 'style': 'width: 100%', 'rows': 20, 'readonly' : 'readonly', }, coreLog);
        };
        poll.add(function () {
            return L.resolveDefault(getCoreLog()).then(function (coreLog) {
                const element = document.getElementById("core_log");
                if (element) {
                    element.textContent = coreLog;
                }
            });
        });
    }
})