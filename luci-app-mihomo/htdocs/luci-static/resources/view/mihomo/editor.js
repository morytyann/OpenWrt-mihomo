'use strict';
'require form';
'require view';
'require uci';
'require fs';
'require tools.mihomo as mihomo'

return view.extend({
    load: function () {
        return fs.stat('/www/tinyfilemanager').then(function (stat) {
            if (stat.type === 'directory') {
                return '/tinyfilemanager/index.php?p=etc%2Fmihomo';
            } else {
                throw new Error('Directory TinyFile Manager not found');
            }
        }).catch(function () {
            return fs.stat('/www/tinyfm').then(function (stat) {
                if (stat.type === 'directory') {
                    return '/tinyfm/tinyfm.php?p=etc%2Fmihomo';
                } else {
                    throw new Error('Directory TinyFile Manager not found');
                }
            }).catch(function () {
                return null;
            });
        });
    },
    render: function (iframePath) {
        if (iframePath) {
            const host = window.location.hostname;
            const iframeUrl = `http://${host}${iframePath}`;
            
            m = new form.Map('mihomo', _('MiHomo Config Editor'));

            let container = E('div', { class: 'cbi-section' }, [
                E('iframe', {
                    src: iframeUrl,
                    width: '100%',
                    height: '600px',
                    frameborder: '0'
                }, _('Your browser does not support iframes.'))
            ]);

            return container;
        } else {
            let m, s, o;

            m = new form.Map('mihomo', _('MiHomo Profile Editor'));

            s = m.section(form.NamedSection, 'editor', 'editor', _('Edit MiHomo profiles'));

            o = s.option(form.ListValue, '_profile', _('Choose Profile'));
            o.optional = true;

            return Promise.all([
                uci.load('mihomo'),
                mihomo.listProfiles(),
            ]).then(function (data) {
                const profiles = data[1];

                for (const profile of profiles) {
                    o.value(mihomo.profilesDir + '/' + profile.name, _('File:') + profile.name);
                }
                o.value(mihomo.mixinFilePath, _('File for Mixin'));
                o.value(mihomo.runProfilePath, _('Profile for Startup'));
                o.value(mihomo.reservedIPNFT, _('File for Reserved IP'));
                o.value(mihomo.reservedIP6NFT, _('File for Reserved IP6'));

                o.write = function (section_id, formvalue) {
                    return true;
                };
                o.onchange = function (event, section_id, value) {
                    return L.resolveDefault(fs.read_direct(value), '').then(function (content) {
                        m.lookupOption('mihomo.editor._profile_content')[0].getUIElement('editor').setValue(content);
                    });
                };

                o = s.option(form.TextValue, '_profile_content');
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
            });
        }
    },
    handleSaveApply: function (ev, mode) {
        return this.handleSave(ev).finally(function() {
            return mode === '0' ? mihomo.reload() : mihomo.restart();
        });
    },
    handleReset: null
});