'use strict';
'require form';
'require view';
'require uci';
'require fs';

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('mihomo'),
            fs.list('/etc/mihomo/profiles'),
        ]);
    },
    render: function (data) {
        const enabled = uci.get('mihomo', 'config', 'enabled') === '1';
        const subscriptions = uci.sections('mihomo', 'subscription');
        const api_port = uci.get('mihomo', 'mixin', 'api_port') || '9090';
        const api_secret = uci.get('mihomo', 'mixin', 'api_secret') || '666666';
        const profiles = data[1];

        let m, s, o, so;

        m = new form.Map('mihomo', _('mihomo'), _('mihomo is a rule based proxy in Go.'));

        s = m.section(form.NamedSection, 'config', 'config', _('Basic Config'));

        o = s.option(form.Flag, 'enabled', _('Enable'));
        o.rmempty = false;

        o = s.option(form.Flag, 'scheduled_restart', _('Scheduled Restart'));
        o.rmempty = false;

        o = s.option(form.Value, 'cron_expression', _('Cron Expression'));
        o.retain = true;
        o.depends('scheduled_restart', '1');

        o = s.option(form.ListValue, 'profile', _('Choose Profile'));

        for (const profile of profiles) {
            o.value('file:/etc/mihomo/profiles/' + profile.name, _('File:') + profile.name);
        }

        for (const subscription of subscriptions) {
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

        o = s.taboption('global', form.Value, 'tcp_keep_alive_interval', _('TCP Keep Alive Interval'));
        o.datatype = 'integer';
        o.placeholder = '600';

        s.tab('external_control', _('External Control Config'));

        o = s.taboption('external_control', form.Flag, 'ui_razord', _('Use Razord'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_razord', _('Open Razord'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            window.open('http://' + window.location.hostname + ':' + api_port + '/ui/razord/#/?host=' + window.location.hostname + '&port=' + api_port + '&secret=' + api_secret, '_blank');
        };
        o.depends('ui_razord', '1');

        o = s.taboption('external_control', form.Flag, 'ui_yacd', _('Use YACD'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_yacd', _('Open YACD'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            window.open('http://' + window.location.hostname + ':' + api_port + '/ui/yacd/?hostname=' + window.location.hostname + '&port=' + api_port + '&secret=' + api_secret, '_blank');
        };
        o.depends('ui_yacd', '1');

        o = s.taboption('external_control', form.Flag, 'ui_metacubexd', _('Use MetaCubeXD'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_metacubexd', _('Open MetaCubeXD'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            window.open('http://' + window.location.hostname + ':' + api_port + '/ui/metacubexd/#/setup?hostname=' + window.location.hostname + '&port=' + api_port + '&secret=' + api_secret, '_blank');
        };
        o.depends('ui_metacubexd', '1');

        o = s.taboption('external_control', form.Value, 'api_port', _('API Port'));
        o.datatype = 'port';
        o.placeholder = '9090';

        o = s.taboption('external_control', form.Value, 'api_secret', _('API Secret'));
        o.placeholder = '666666';

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

        o = s.taboption('dns', form.DynamicList, 'fake_ip_filter', _('Fake-IP Filter'));
        o.retain = true;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.Flag, 'fake_ip_cache', _('Fake-IP Cache'));
        o.retain = true;
        o.rmempty = false;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.Flag, 'dns_hosts', _('Use Hosts'));
        o.rmempty = false;

        o = s.taboption('dns', form.SectionValue, 'hosts', form.TableSection, 'host', _('Edit Hosts'));
        o.retain = true;
        o.depends('dns_hosts', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = true;
    
        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;
    
        so = o.subsection.option(form.Value, 'domain_name', _('Domain Name'));
    
        so = o.subsection.option(form.DynamicList, 'ip', _('IP'));

        o = s.taboption('dns', form.Flag, 'dns_system_hosts', _('Use System Hosts'));
        o.rmempty = false;

        o = s.taboption('dns', form.Flag, 'dns_nameserver', _('Overwrite Nameserver'));
        o.rmempty = false;

        o = s.taboption('dns', form.SectionValue, 'nameservers', form.TableSection, 'nameserver', _('Edit Nameservers'));
        o.retain = true;
        o.depends('dns_nameserver', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = false;

        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;
        
        so = o.subsection.option(form.ListValue, 'type', _('Type'));
        so.value('default');
        so.value('proxy-server');
        so.value('nameserver');
        so.value('fallback');
        so.readonly = true;

        so = o.subsection.option(form.DynamicList, 'nameserver', _('Nameserver'));

        o = s.taboption('dns', form.Flag, 'fallback_filter', _('Overwrite Fallback Filter'));
        o.rmempty = false;

        o = s.taboption('dns', form.DynamicList, 'fallback_filter_geoip', _('Fallback GeoIP Filter'));
        o.retain = true;
        o.depends('fallback_filter', '1');

        o = s.taboption('dns', form.DynamicList, 'fallback_filter_geosite', _('Fallback GeoSite Filter'));
        o.retain = true;
        o.depends('fallback_filter', '1');

        o = s.taboption('dns', form.DynamicList, 'fallback_filter_ipcidr', _('Fallback IPCIDR Filter'));
        o.datatype = 'cidr4';
        o.retain = true;
        o.depends('fallback_filter', '1');

        o = s.taboption('dns', form.DynamicList, 'fallback_filter_domain_name', _('Fallback Domain Name Filter'));
        o.retain = true;
        o.depends('fallback_filter', '1');

        o = s.taboption('dns', form.Flag, 'dns_nameserver_policy', _('Overwrite Nameserver Policy'));
        o.rmempty = false;

        o = s.taboption('dns', form.SectionValue, 'nameserver_policies', form.TableSection, 'nameserver_policy', _('Edit Nameserver Policies'));
        o.retain = true;
        o.depends('dns_nameserver_policy', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = true;

        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;
        
        so = o.subsection.option(form.Value, 'matcher', _('Matcher'));

        so = o.subsection.option(form.DynamicList, 'nameserver', _('Nameserver'));

        s.tab('sniffer', _('Sniffer Config'));

        s.taboption('sniffer', form.Flag, 'sniffer', _('Enable'));
        s.rmempty = false;

        o = s.taboption('sniffer', form.Flag, 'sniff_dns_mapping', _('Sniff Redir-Host'));
        o.retain = true;
        o.rmempty = false;
        o.depends('sniffer', '1');

        o = s.taboption('sniffer', form.Flag, 'sniff_pure_ip', _('Sniff Pure IP'));
        o.retain = true;
        o.rmempty = false;
        o.depends('sniffer', '1');

        o = s.taboption('sniffer', form.Flag, 'sniffer_overwrite_dest', _('Overwrite Destination'));
        o.retain = true;
        o.rmempty = false;
        o.depends('sniffer', '1');

        o = s.taboption('sniffer', form.DynamicList, 'sniffer_force_domain_name', _('Force Sniff Domain Name'));
        o.retain = true;
        o.depends('sniffer', '1');

        o = s.taboption('sniffer', form.DynamicList, 'sniffer_ignore_domain_name', _('Ignore Sniff Domain Name'));
        o.retain = true;
        o.depends('sniffer', '1');

        o = s.taboption('sniffer', form.SectionValue, 'sniffs', form.TableSection, 'sniff');
        o.retain = true;
        o.depends('sniffer', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = false;

        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;
        
        so = o.subsection.option(form.ListValue, 'protocol', _('Protocol'));
        so.value('HTTP');
        so.value('TLS');
        so.value('QUIC');
        so.readonly = true;

        so = o.subsection.option(form.DynamicList, 'port', _('Port'));
        so.datatype = 'port';

        so = o.subsection.option(form.Flag, 'overwrite_dest', _('Overwrite Destination'));
        so.rmempty = false;

        s.tab('geox', _('GeoX Config'));

        o = s.taboption('geox', form.ListValue, 'geoip_format', _('GeoIP Format'));
        o.value('dat');
        o.value('mmdb');

        o = s.taboption('geox', form.ListValue, 'geodata_loader', _('GeoData Loader'));
        o.value('standard', _('Standard Loader'));
        o.value('memconservative', _('Memory Conservative Loader'));

        o = s.taboption('geox', form.Value, 'geoip_mmdb_url', _('GeoIP(MMDB) Url'));

        o = s.taboption('geox', form.Value, 'geoip_dat_url', _('GeoIP(DAT) Url'));

        o = s.taboption('geox', form.Value, 'geosite_url', _('GeoSite Url'));

        o = s.taboption('geox', form.Flag, 'geox_auto_update', _('GeoX Auto Update'));
        o.rmempty = false;

        o = s.taboption('geox', form.Value, 'geox_update_interval', _('GeoX Update Interval'), _('Hour'));
        o.datatype = 'integer';
        o.placeholder = '24';
        o.retain = true;
        o.depends('geox_auto_update', '1');

        s.tab('mixin_file_content', _('Mixin File Content'));

        o = s.taboption('mixin_file_content', form.TextValue, '_mixin_file_content', _('Mixin File Content'), _('The file\'s content above will be merged into profile before other mixin config(means low priority), and it will overwrite the same field in the profile.'));
        o.width = '100%';
        o.rows = 20;
        o.cfgvalue = function(section_id) {
            return fs.read('/etc/mihomo/mixin.yaml');
        };
        o.write = function(section_id, formvalue) {
			return fs.write('/etc/mihomo/mixin.yaml', formvalue.trim());
        };

        return m.render();
    }
});