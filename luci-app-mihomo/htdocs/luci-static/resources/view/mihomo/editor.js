'use strict';
'require form';
'require view';
'require uci';
'require fs';

const profilesDir = '/etc/mihomo/profiles';

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

        s = m.section(form.NamedSection, 'config', 'config');

        o = s.option(form.ListValue, '_profile', _('Choose Profile'));
        o.optional = true;

        for (const profile of profiles) {
            o.value(profilesDir + '/' + profile.name, profile.name);
        }
        o.write = function (section_id, formvalue) {
            return true;
        };
        o.onchange = function (event, section_id, value) {
            L.resolveDefault(fs.read_direct(value), '').then(function (content) {
                m.lookupOption('mihomo.config._profile_content')[0].getUIElement("config").setValue(content);
            });
        };

        o = s.option(form.TextValue, '_profile_content',);
        o.rows = 30;
        o.write = function (section_id, formvalue) {
            const path = m.lookupOption('mihomo.config._profile')[0].formvalue('config');
            return fs.write(path, formvalue);
        };

        return m.render();
    },
    handleSaveApply: null,
    handleReset: null
});
