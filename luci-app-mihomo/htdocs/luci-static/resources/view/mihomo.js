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

        s = m.section(form.NamedSection, 'config', 'config', _('Basic Config'));

        o = s.option(form.Flag, 'enabled', _('Enable'));
        o.rmempty = false;

        o = s.option(form.Flag, 'scheduled_restart', _('Scheduled Restart'));
        o.rmempty = false;

        o = s.option(form.Value, 'cron_expression', _('Cron Expression'));
        o.optional = true;
        o.retain = true;
        o.depends('scheduled_restart', '1');

        o = s.option(form.ListValue, 'profile', _('Choose Profile'));
        o.optional = true;

        for (const profile of profiles) {
            o.value('file:/etc/mihomo/profiles/' + profile.name, _('File:') + profile.name);
        }

        for (const subscription of uci.sections('mihomo', 'subscription')) {
            o.value(subscription.url, _('Subscription:') + subscription.name);
        }

		o = s.option(form.FileUpload, 'upload_profile', _('Upload Profile'));
        o.root_directory = '/etc/mihomo/profiles';
        o.browser = true;
        o.enable_delete = true;
        o.enable_upload = true;
        o.rmempty = true;

        s = m.section(form.NamedSection, 'proxy', 'proxy', _('Proxy Config'));
        
        o = s.option(form.Flag, 'transparent_proxy', _('Transparent Proxy'));
        o.rmempty = false;

        o = s.option(form.Flag, 'router_proxy', _('Router Proxy'));
        o.retain = true;
        o.rmempty = false;
        o.depends('transparent_proxy', '1');

        o = s.option(form.ListValue, 'access_control_mode', _('Access Control Mode'));
        o.optional = true;
        o.retain = true;
        o.value('block', _('Block Mode'));
        o.value('allow', _('Allow Mode'));
        o.depends('transparent_proxy', '1');

        o = s.option(form.DynamicList, 'acl_ip', _('Access Control IP'));
        o.datatype = 'ipaddr';
        o.retain = true;
        o.depends('transparent_proxy', '1');

        o = s.option(form.DynamicList, 'acl_mac', _('Access Control MAC'));
        o.datatype = 'macaddr';
        o.retain = true;
        o.depends('transparent_proxy', '1');

        s = m.section(form.TableSection, 'subscription', _('Subscription Config'));
        s.addremove = true;
        s.anonymous = true;

        o = s.option(form.Value, 'name', _('Subscription Name'));

        o = s.option(form.Value, 'url', _('Subscription Url'));
        o.datatype = 'url';

        s = m.section(form.NamedSection, 'mixin', 'mixin', _('Mixin Config'));

        s.tab('global', _('Global Config'));

        o = s.taboption('global', form.ListValue, 'mode', _('Proxy Mode'));
        o.value('global', _('Global Mode'));
        o.value('rule', _('Rule Mode'));
        o.value('direct', _('Direct Mode'));

        o = s.taboption('global', form.ListValue, 'match_process', _('Match Process'));
        o.value('always');
        o.value('strict');
        o.value('off');

        o = s.taboption('global', form.Flag, 'unify_delay', _('Unify Delay'));
        o.rmempty = false;

        o = s.taboption('global', form.Flag, 'tcp_concurrent', _('TCP Concurrent'));
        o.rmempty = false;

        s.tab('external_control', _('External Control Config'));

        o = s.taboption('external_control', form.Value, 'api_port', _('API Port'));
        o.datatype = 'port';
        o.placeholder = '9090';

        o = s.taboption('external_control', form.Value, 'api_secret', _('API Secret'));

        o = s.taboption('external_control', form.Flag, 'selection_cache', _('Save Proxy Selection'));
        o.rmempty = false;

        s.tab('inbound', _('Inbound Config'));

        o = s.taboption('inbound', form.Flag, 'allow_lan', _('Allow Lan'));
        o.rmempty = false;

        o = s.taboption('inbound', form.Value, 'http_port', _('HTTP Port'));
        o.datatype = 'port';
        o.placeholder = '8080';

        o = s.taboption('inbound', form.Value, 'socks_port', _('SOCKS Port'));
        o.datatype = 'port';
        o.placeholder = '1080';

        o = s.taboption('inbound', form.Value, 'mixed_port', _('Mixed Port'));
        o.datatype = 'port';
        o.placeholder = '7890';

        o = s.taboption('inbound', form.Value, 'redir_port', _('Redirect Port'));
        o.datatype = 'port';
        o.placeholder = '7891';

        o = s.taboption('inbound', form.Value, 'tproxy_port', _('TPROXY Port'));
        o.datatype = 'port';
        o.placeholder = '7892';

        s.tab('dns', _('DNS Config'));

        o = s.taboption('dns', form.Value, 'dns_port', _('DNS Port'));
        o.datatype = 'port';
        o.placeholder = '1053';

        o = s.taboption('dns', form.ListValue, 'dns_mode', _('DNS Mode'));
        o.value('fake-ip', _('Fake-IP'));
        o.value('redir-host', _('Redir-Host'));

        o = s.taboption('dns', form.Value, 'fake_ip_range', _('Fake-IP Range'));
        o.datatype = 'ipcidr';
        o.placeholder = '198.18.0.1/16';
        o.retain = true;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.Flag, 'fake_ip_cache', _('Fake-IP Cache'));
        o.retain = true;
        o.rmempty = false;
        o.depends('dns_mode', 'fake-ip');

        s.tab('geox', _('GeoX Config'));

        o = s.taboption('geox', form.ListValue, 'geoip_format', _('GeoIP Format'));
        o.value('dat');
        o.value('mmdb');

        o = s.taboption('geox', form.ListValue, 'geodata_loader', _('GeoData Loader'));
        o.value('standard', _('Standard Loader'));
        o.value('memconservative', _('Memory Conservative Loader'));

        o = s.taboption('geox', form.Value, 'geoip_mmdb_url', _('GeoIP(MMDB)Url'));

        o = s.taboption('geox', form.Value, 'geoip_dat_url', _('GeoIP(DAT)Url'));

        o = s.taboption('geox', form.Value, 'geosite_url', _('GeoSite Url'));

        o = s.taboption('geox', form.Flag, 'geox_auto_update', _('GeoX Auto Update'));
        o.rmempty = false;

        o = s.taboption('geox', form.Value, 'geox_update_interval', _('GeoX Update Interval'), _('Hour'));
        o.datatype = 'integer';
        o.placeholder = '24';
        o.retain = true;
        o.depends('geox_auto_update', '1');

        return m.render();
    }
});