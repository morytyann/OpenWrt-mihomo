'use strict';
'require form';
'require view';
'require uci';
'require fs';

return view.extend({
    load: function () {
        return Promise.all([
            fs.list('/etc/mihomo/profiles'),
            uci.load('mihomo')
        ]);
    },
    render: function (data) {
        var profiles = data[0];

        var m, s, o;

        m = new form.Map('mihomo', _('mihomo'), _('mihomo is a rule based proxy in Go.'));

        s = m.section(form.NamedSection, 'config', 'mihomo', _('Basic Config'));

        o = s.option(form.Flag, 'enabled', _('Enable'));
        o.rmempty = false;

        o = s.option(form.Flag, 'scheduled_restart', _('Scheduled Restart'));
        o.rmempty = false;

        o = s.option(form.Value, 'cron_exp', _('Cron Expression'));
        o.retain = true;
        o.depends('scheduled_restart', '1');

        o = s.option(form.ListValue, 'profile', _('Profile'));

        for (const profile of profiles) {
            o.value('file:/etc/mihomo/profiles/' + profile.name, _('File:') + profile.name);
        }

        for (const subscription of uci.sections('mihomo', 'subscription')) {
            o.value(subscription.url, _('Subscription:') + subscription.name);
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
        o.value('fake-ip', _('Fake-IP'));
        o.value('redir-host', _('Redir-Host'));

        o = s.option(form.Value, 'fake_ip_range', _('Fake-IP Range'));
        o.datatype = 'ipcidr';
        o.default = '198.18.0.1/16';
        o.depends('dns_mode', 'fake-ip');

        s = m.section(form.TableSection, 'subscription', _('Subscription Config'));
        s.addremove = true;
        s.anonymous = true;

        o = s.option(form.Value, 'name', _('Subscription Name'));

        o = s.option(form.Value, 'url', _('Subscription Url'));
        o.datatype = 'url';

        s = m.section(form.NamedSection, 'proxy', 'proxy', _('Proxy Config'));
        
        o = s.option(form.Flag, 'transparent_proxy', _('Transparent Proxy'));
        o.rmempty = false;

        o = s.option(form.Flag, 'router_proxy', _('Router Proxy'));
        o.retain = true;
        o.rmempty = false;
        o.depends('transparent_proxy', '1')

        o = s.option(form.ListValue, 'access_control_mode', _('Access Control Mode'));
        o.optional = true;
        o.retain = true;
        o.value('block', _('Block Mode'));
        o.value('allow', _('Allow Mode'));
        o.depends('transparent_proxy', '1')

        o = s.option(form.DynamicList, 'acl_ip', _('Access Control IP'));
        o.datatype = 'ipaddr';
        o.retain = true;
        o.depends('transparent_proxy', '1')

        o = s.option(form.DynamicList, 'acl_mac', _('Access Control MAC'));
        o.datatype = 'macaddr';
        o.retain = true;
        o.depends('transparent_proxy', '1')

        return m.render();
    }
});