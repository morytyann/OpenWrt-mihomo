'use strict';
'require form';
'require view';
'require fs';

const CONFIG_FILE = '/etc/mihomo/profiles/config.yaml';

return view.extend({
    load: function () {
        return L.resolveDefault(fs.read_direct(CONFIG_FILE));
    },
    render: function (data) {
        let m, s, o;
        
        m = new form.Map('mihomo');

        s = m.section(form.NamedSection, 'config', 'config');

        o = s.option(form.Value, 'config_file', _('Configration file'));
		o.default = '/etc/mihomo/profiles/config.yaml';
		o.rmempty = false;
		o.readonly = true;

        o = s.option(form.TextValue, '_config');
        o.rows = 30;
        o.monospace = true;
        o.cfgvalue = function (section_id) {
            return L.resolveDefault(fs.read(CONFIG_FILE));
        };
        o.write = function (section_id, formvalue) {
            return fs.write(CONFIG_FILE, formvalue);
        };

        return m.render();
    }
});
