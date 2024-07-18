'use strict';
'require form';
'require view';
'require uci';
'require fs';
'require rpc';
'require poll';
'require tools.widgets as widgets';

const profilesDir = '/etc/mihomo/profiles';
const runProfilePath = '/etc/mihomo/run/config.yaml';
const mixinPath = '/etc/mihomo/mixin.yaml';

const callServiceList = rpc.declare({
    object: 'service',
    method: 'list',
    params: ['name'],
    expect: { '': {} }
});

function loadConfig() {
    return uci.load('mihomo');
}

function listProfiles() {
    return L.resolveDefault(fs.list(profilesDir), []);
}

async function getServiceStatus() {
    try {
        return (await callServiceList('mihomo'))['mihomo']['instances']['core']['running'];
    } catch (ignored) {
        return false;
    }
}

function getAppVersion() {
    return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'app']));
}

function getCoreVersion() {
    return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['version', 'core']));
}

function loadProfile() {
    return L.resolveDefault(fs.exec_direct('/usr/libexec/mihomo-call', ['load', 'profile'], 'json'), {});
}

async function openDashboard(type) {
    const running = await getServiceStatus();
    if (running) {
        const profile = await loadProfile();
        const apiListen = profile['external-controller'];
        if (apiListen) {
            const apiPort = apiListen.split(':')[1];
            const apiSecret = profile['secret'] || '';
            let url;
            if (type === 'razord') {
                url = `http://${window.location.hostname}:${apiPort}/ui/razord/#/?host=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
            } else if (type === 'yacd') {
                url = `http://${window.location.hostname}:${apiPort}/ui/yacd/?hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
            } else if (type === 'metacubexd') {
                url = `http://${window.location.hostname}:${apiPort}/ui/metacubexd/#/setup?hostname=${window.location.hostname}&port=${apiPort}&secret=${apiSecret}`;
            } else {
                return;
            }
            window.open(url, '_blank');
        } else {
            alert(_('External Control is not configured.'));
        }
    } else {
        alert(_('Service is not running.'));
    }
}

function renderStatus(running) {
    return updateStatus(E('input', { id: 'core_status', style: 'border: unset; font-style: italic; font-weight: bold;', readonly: '' }), running);
}

function updateStatus(element, running) {
    if (element) {
        element.style.color = running ? 'green' : 'red';
        element.value = running ? _('Running') : _('Not Running');
    }
    return element;
}

return view.extend({
    load: function () {
        return Promise.all([
            loadConfig(),
            listProfiles(),
            getAppVersion(),
            getCoreVersion(),
            getServiceStatus(),
        ]);
    },
    render: function (data) {
        const subscriptions = uci.sections('mihomo', 'subscription');
        const profiles = data[1];
        const appVersion = data[2];
        const coreVersion = data[3];
        const running = data[4];

        let m, s, o, so;

        m = new form.Map('mihomo', _('Mihomo'), _('Mihomo is a rule based proxy in Go.'));

        s = m.section(form.NamedSection, 'status', 'status', _('Status'));

        o = s.option(form.DummyValue, '_app_version', _('App Version'));
        o.cfgvalue = function (section_id) {
            return E('input', { style: 'border: unset;', readonly: 'readonly', value: appVersion.trim() });
        };

        o = s.option(form.DummyValue, '_core_version', _('Core Version'));
        o.cfgvalue = function (section_id) {
            return E('input', { style: 'border: unset;', readonly: 'readonly', value: coreVersion.trim() });
        };

        o = s.option(form.DummyValue, '_core_status', _('Core Status'));
        o.cfgvalue = function (section_id) {
            return renderStatus(running);
        };
        poll.add(function () {
            return L.resolveDefault(getServiceStatus()).then(function (running) {
                updateStatus(document.getElementById('core_status'), running);
            });
        });

        s = m.section(form.NamedSection, 'config', 'config', _('Basic Config'));

        o = s.option(form.Flag, 'enabled', _('Enable'));
        o.rmempty = false;

        o = s.option(form.Flag, 'scheduled_restart', _('Scheduled Restart'));
        o.rmempty = false;

        o = s.option(form.Value, 'cron_expression', _('Cron Expression'));
        o.retain = true;
        o.rmempty = false;
        o.depends('scheduled_restart', '1');

        o = s.option(form.ListValue, 'profile', _('Choose Profile'));

        for (const profile of profiles) {
            o.value('file:' + profilesDir + '/' + profile.name, _('File:') + profile.name);
        }

        for (const subscription of subscriptions) {
            o.value(subscription.url, _('Subscription:') + subscription.name);
        }

        o = s.option(form.FileUpload, 'upload_profile', _('Upload Profile'));
        o.root_directory = profilesDir;

        o = s.option(form.Flag, 'mixin', _('Mixin'), _('Even if this option is disabled, the neccesary config will still mixin.'));
        o.rmempty = false;

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
        o.value('allow', _('Allow Mode'));
        o.value('block', _('Block Mode'));
        o.depends('transparent_proxy', '1');

        o = s.option(form.DynamicList, 'acl_ip', _('Access Control IP'));
        o.datatype = 'ipaddr';
        o.retain = true;
        o.depends({ 'transparent_proxy': '1', 'access_control_mode': 'allow' });
        o.depends({ 'transparent_proxy': '1', 'access_control_mode': 'block' });

        o = s.option(form.DynamicList, 'acl_mac', _('Access Control MAC'));
        o.datatype = 'macaddr';
        o.retain = true;
        o.depends({ 'transparent_proxy': '1', 'access_control_mode': 'allow' });
        o.depends({ 'transparent_proxy': '1', 'access_control_mode': 'block' });

        o = s.option(form.Flag, 'dns_hijack', _('DNS Hijack'), _('When this option is disabled, DNS request will not redirect to core.'));
        o.retain = true;
        o.rmempty = false;
        o.depends('transparent_proxy', '1');

        o = s.option(form.Flag, 'bypass_china_mainland_ip', _('Bypass China Mainland IP'), _('This option does not work well with Fake-IP.'));
        o.retain = true;
        o.rmempty = false;
        o.depends('transparent_proxy', '1');

        o = s.option(widgets.NetworkSelect, 'wan_interfaces', _('WAN Interfaces'), _('If you have multiple WAN interface, you can add them to here to skip inbound traffic to it.'));
        o.multiple = true;
        o.optional = false;
        o.rmempty = false;

        s = m.section(form.TableSection, 'subscription', _('Subscription Config'));
        s.addremove = true;
        s.anonymous = true;

        o = s.option(form.Value, 'name', _('Subscription Name'));
        o.rmempty = false;

        o = s.option(form.Value, 'url', _('Subscription Url'));
        o.rmempty = false;

        s = m.section(form.NamedSection, 'mixin', 'mixin', _('Mixin Config'));

        s.tab('general', _('General Config'));

        o = s.taboption('general', form.ListValue, 'mode', _('Proxy Mode'));
        o.value('general', _('Global Mode'));
        o.value('rule', _('Rule Mode'));
        o.value('direct', _('Direct Mode'));

        o = s.taboption('general', form.ListValue, 'match_process', _('Match Process'));
        o.value('always');
        o.value('strict');
        o.value('off');

        o = s.taboption('general', widgets.NetworkSelect, 'outbound_interface', _('Outbound Interface'));
        o.optional = true;
        o.rmempty = false;

        o = s.taboption('general', form.Flag, 'unify_delay', _('Unify Delay'));
        o.rmempty = false;

        o = s.taboption('general', form.Flag, 'tcp_concurrent', _('TCP Concurrent'));
        o.rmempty = false;

        o = s.taboption('general', form.Value, 'tcp_keep_alive_interval', _('TCP Keep Alive Interval'));
        o.datatype = 'integer';
        o.placeholder = '600';

        o = s.taboption('general', form.ListValue, 'log_level', _('Log Level'));
        o.value('silent');
        o.value('error');
        o.value('warning');
        o.value('info');
        o.value('debug');

        s.tab('external_control', _('External Control Config'));

        o = s.taboption('external_control', form.Flag, 'ui_razord', _('Use Razord'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_razord', _('Open Razord'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            openDashboard('razord');
        };
        o.depends('ui_razord', '1');

        o = s.taboption('external_control', form.Flag, 'ui_yacd', _('Use YACD'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_yacd', _('Open YACD'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            openDashboard('yacd');
        };
        o.depends('ui_yacd', '1');

        o = s.taboption('external_control', form.Flag, 'ui_metacubexd', _('Use MetaCubeXD'));
        o.rmempty = false;

        o = s.taboption('external_control', form.Button, 'open_ui_metacubexd', _('Open MetaCubeXD'));
        o.inputtitle = _('Open');
        o.onclick = function () {
            openDashboard('metacubexd');
        };
        o.depends('ui_metacubexd', '1');

        o = s.taboption('external_control', form.Value, 'api_port', _('API Port'));
        o.datatype = 'port';
        o.placeholder = '9090';

        o = s.taboption('external_control', form.Value, 'api_secret', _('API Secret'));
        o.rmempty = false;

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

        o = s.taboption('inbound', form.Flag, 'authentication', _('Authentication'));
        o.rmempty = false;

        o = s.taboption('inbound', form.SectionValue, 'authentications', form.TableSection, 'authentication', _('Edit Authentications'));
        o.retain = true;
        o.depends('authentication', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = true;

        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;

        so = o.subsection.option(form.Value, 'username', _('Username'));
        so.rmempty = false;

        so = o.subsection.option(form.Value, 'password', _('Password'));
        so.rmempty = false;

        s.tab('dns', _('DNS Config'));

        o = s.taboption('dns', form.Value, 'dns_port', _('DNS Port'));
        o.datatype = 'port';
        o.placeholder = '1053';

        o = s.taboption('dns', form.ListValue, 'dns_mode', _('DNS Mode'));
        o.value('fake-ip', _('Fake-IP'));
        o.value('redir-host', _('Redir-Host'));

        o = s.taboption('dns', form.Value, 'fake_ip_range', _('Fake-IP Range'));
        o.datatype = 'cidr4';
        o.placeholder = '198.18.0.1/16';
        o.retain = true;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.Flag, 'fake_ip_filter', _('Overwrite Fake-IP Filter'));
        o.retain = true;
        o.rmempty = false;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.DynamicList, 'fake_ip_filters', _('Edit Fake-IP Filters'));
        o.retain = true;
        o.depends({ 'dns_mode': 'fake-ip', 'fake_ip_filter': '1' });

        o = s.taboption('dns', form.Flag, 'fake_ip_cache', _('Fake-IP Cache'));
        o.retain = true;
        o.rmempty = false;
        o.depends('dns_mode', 'fake-ip');

        o = s.taboption('dns', form.Flag, 'dns_system_hosts', _('Use System Hosts'));
        o.rmempty = false;

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
        so.rmempty = false;

        so = o.subsection.option(form.DynamicList, 'ip', _('IP'));

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
        so.value('default-nameserver');
        so.value('proxy-server-nameserver');
        so.value('nameserver');
        so.value('fallback');
        so.readonly = true;

        so = o.subsection.option(form.DynamicList, 'nameserver', _('Nameserver'));

        o = s.taboption('dns', form.Flag, 'dns_fallback_filter', _('Overwrite Fallback Filter'));
        o.rmempty = false;

        o = s.taboption('dns', form.SectionValue, 'fallback_filters', form.TableSection, 'fallback_filter', _('Edit Fallback Filters'));
        o.retain = true;
        o.depends('dns_fallback_filter', '1');

        o.subsection.anonymous = true;
        o.subsection.addremove = false;

        so = o.subsection.option(form.Flag, 'enabled', _('Enable'));
        so.rmempty = false;

        so = o.subsection.option(form.ListValue, 'type', _('Type'));
        so.value('geoip-code', _('GeoIP'));
        so.value('geosite', _('GeoSite'));
        so.value('ipcidr', _('IPCIDR'));
        so.value('domain_name', _('Domain Name'));
        so.readonly = true;

        so = o.subsection.option(form.DynamicList, 'value', _('Value'));

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
        so.rmempty = false;

        so = o.subsection.option(form.DynamicList, 'nameserver', _('Nameserver'));

        s.tab('sniffer', _('Sniffer Config'));

        o = s.taboption('sniffer', form.Flag, 'sniffer', _('Enable'));
        o.rmempty = false;

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

        o = s.taboption('sniffer', form.SectionValue, 'sniffs', form.TableSection, 'sniff', _('Sniff By Protocol'));
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
        o.rmempty = false;

        o = s.taboption('geox', form.Value, 'geoip_dat_url', _('GeoIP(DAT) Url'));
        o.rmempty = false;

        o = s.taboption('geox', form.Value, 'geosite_url', _('GeoSite Url'));
        o.rmempty = false;

        o = s.taboption('geox', form.Flag, 'geox_auto_update', _('GeoX Auto Update'));
        o.rmempty = false;

        o = s.taboption('geox', form.Value, 'geox_update_interval', _('GeoX Update Interval'), _('Hour'));
        o.datatype = 'integer';
        o.placeholder = '24';
        o.retain = true;
        o.depends('geox_auto_update', '1');

        s.tab('mixin_file_content', _('Mixin File Content'));

        o = s.taboption('mixin_file_content', form.TextValue, '_mixin_file_content', null, _('The file\'s content above will be merged into profile before other mixin config(means low priority), and it will overwrite the same field in the profile.'));
        o.rows = 20;
        o.cfgvalue = function (section_id) {
            return L.resolveDefault(fs.read_direct(mixinPath));
        };
        o.write = function (section_id, formvalue) {
            return fs.write(mixinPath, formvalue);
        };

        return m.render();
    }
});
