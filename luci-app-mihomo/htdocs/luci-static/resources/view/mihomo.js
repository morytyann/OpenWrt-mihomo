'use strict';
'require form';
'require view';
'require uci';

return view.extend({
    load: function () {
        return Promise.all([
			uci.load('mihomo')
		]);
    },
    render: function () {
        var m, s, o;

        m = new form.Map('mihomo', _('mihomo'), _('mihomo is a rule based proxy in Go.'));

        s = m.section(form.NamedSection, 'config', 'mihomo', _('Basic Config'));

        o = s.option(form.Flag, 'enabled', _('Enable'));

        o = s.option(form.Flag, 'scheduled_restart', _('Scheduled Restart'));

        o = s.option(form.Value, 'cron_exp', _('Cron Expression'));
        o.depends('scheduled_restart', '1')

        o = s.option(form.ListValue, 'profile', _('Profile'));
        o.optional = true

        for (const profile of uci.sections('mihomo', 'profile')) {
            o.value(profile.name, profile.name)
        }

        o = s.option(form.ListValue, 'mode', _('Proxy Mode'));
        o.value('global', _('Global'));
        o.value('rule', _('Rule'));
        o.value('script', _('Script'));
        o.value('direct', _('Direct'));

        o = s.option(form.Value, 'http_port', _('HTTP Port'));
        o.datatype = 'port';
        o.default = '8080';

        o = s.option(form.Value, 'socks_port', _('SOCKS Port'));
        o.datatype = 'port';
        o.default = '1080';

        o = s.option(form.Value, 'mixed_port', _('Mixed Port'));
        o.datatype = 'port';
        o.default = '7890';

        o = s.option(form.Value, 'redir_port', _('Redirect Port'));
        o.datatype = 'port';
        o.default = '7891';

        o = s.option(form.Value, 'tproxy_port', _('TPROXY Port'));
        o.datatype = 'port';
        o.default = '7892';

        o = s.option(form.Value, 'dns_port', _('DNS Port'));
        o.datatype = 'port';
        o.default = '1053';

        o = s.option(form.ListValue, 'dns_mode', _('DNS Mode'));
        o.value('fake-ip', _('Fake-IP'))
        o.value('redir-host', _('Redir-Host'))

        o = s.option(form.Value, 'fake_ip_range', _('Fake-IP Range'));
        o.datatype = 'ipcidr';
        o.default = '198.18.0.1/16';
        o.depends('dns_mode', 'fake-ip')

        s = m.section(form.TableSection, 'profile', _('Profiles'));
        s.addremove = true;

        o = s.option(form.Value, 'url', _('Subscribe Url'))
        o.datatype = 'url'

        o = s.option(form.FileUpload, 'path', _('Upload Profile'))
        o.enable_remove = false
        o.root_directory = '/etc/mihomo/profiles'

        s = m.section(form.NamedSection, 'access_control', 'access_control', _('Access Control'));

        o = s.option(form.ListValue, 'mode', _('Mode'));
        o.value('block', _('Block Mode'));
        o.value('allow', _('Allow Mode'));
        o.optional = true

        o = s.option(form.DynamicList, 'ip', _('IP'))
        o.datatype = 'ipaddr'
    
        o = s.option(form.DynamicList, 'mac', _('MAC'))
        o.datatype = 'macaddr'
        return m.render();
    }
});