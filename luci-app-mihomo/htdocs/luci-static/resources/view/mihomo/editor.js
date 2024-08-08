'use strict';
'require form';
'require view';
'require uci';
'require fs';

const profilesDir = '/etc/mihomo/profiles';
const mixinPath = '/etc/mihomo/mixin.yaml';
const runProfilePath = '/etc/mihomo/run/config.yaml'

function listProfiles() {
    return L.resolveDefault(fs.list(profilesDir), []);
}

return view.extend({
    load: function () {
        return Promise.all([
            listProfiles(),
        ]);
    },
    render: function (data) {
        const profiles = data[0];

        let m, s, o;
        
        m = new form.Map('mihomo');

        s = m.section(form.NamedSection, 'editor', 'editor');

        o = s.option(form.ListValue, '_profile', _('Choose Profile'));
        o.optional = true;

        for (const profile of profiles) {
            o.value(profilesDir + '/' + profile.name, _('File:') + profile.name);
        }
        o.value(mixinPath, _('File for Mixin'));
        o.value(runProfilePath, _('Profile for Startup'));

        o.write = function (section_id, formvalue) {
            return true;
        };
        o.onchange = function (event, section_id, value) {
            return L.resolveDefault(fs.read_direct(value), '').then(function (content) {
                m.lookupOption('mihomo.editor._profile_content')[0].getUIElement('editor').setValue(content);
            });
        };

        o = s.option(form.TextValue, '_profile_content',);
        o.rows = 25;
        o.write = function (section_id, formvalue) {
            const path = m.lookupOption('mihomo.editor._profile')[0].formvalue('editor');
            return fs.write(path, formvalue);
        };
        o.remove = function (section_id) {
            const path = m.lookupOption('mihomo.editor._profile')[0].formvalue('editor');
            return fs.write(path);
        };

        return m.render();
    },
    handleSaveApply: function (ev, mode) {
        return this.handleSave(ev).finally(function() {
            fs.exec_direct('/usr/libexec/mihomo-call', ['service', mode === 0 ? 'reload' : 'restart']);
        });
    },
    handleReset: null
});
