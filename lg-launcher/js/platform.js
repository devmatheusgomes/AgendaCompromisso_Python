/*
 * Adaptação para LG webOS: oferece ao main.js a mesma interface que ele usa na Samsung
 * (tizen.application.*), chamando os serviços do webOS por PalmServiceBridge.
 * No navegador do PC o PalmServiceBridge não existe e o launcher roda em modo demonstração.
 */
(function () {
    'use strict';

    // Apps que aparecem na faixa na primeira execução, nesta ordem
    window.LAUNCHER_DEFAULTS = [/disney/i, /netflix/i, /^max$|hbo/i, /^hdmi\s*1$/i];

    if (typeof window.PalmServiceBridge === 'undefined') return;

    var APP_ID = 'com.inicio.launcher';

    // Usados só se a TV não deixar o launcher ler a lista de apps.
    // Confira os IDs da sua TV com: python lg_tv.py IP_DA_TV apps
    var FALLBACK_APPS = [
        { id: 'netflix',                    name: 'Netflix' },
        { id: 'com.disney.disneyplus-prod', name: 'Disney+' },
        { id: 'youtube.leanback.v4',        name: 'YouTube' }
        // Max: adicione aqui o ID que o lg_tv.py mostrar, ex.: { id: '...', name: 'Max' }
    ];
    var INPUTS = [
        { id: 'com.webos.app.hdmi1', name: 'HDMI 1' },
        { id: 'com.webos.app.hdmi2', name: 'HDMI 2' },
        { id: 'com.webos.app.hdmi3', name: 'HDMI 3' }
    ];

    var pending = [];   // mantém as pontes vivas até a resposta chegar
    function call(uri, params, ok, fail) {
        var bridge = new PalmServiceBridge();
        pending.push(bridge);
        bridge.onservicecallback = function (msg) {
            pending.splice(pending.indexOf(bridge), 1);
            var res;
            try { res = JSON.parse(msg); } catch (e) { res = { returnValue: false, errorText: String(msg) }; }
            if (res.returnValue === false) { if (fail) fail(res); }
            else if (ok) ok(res);
        };
        bridge.call(uri, JSON.stringify(params || {}));
    }

    function withInputs(list) {
        var ids = list.map(function (a) { return a.id; });
        return list.concat(INPUTS.filter(function (i) { return ids.indexOf(i.id) < 0; }));
    }
    function asInfo(list) {
        return list.map(function (a) { return { id: a.id, name: a.name, show: true, iconPath: a.icon || '' }; });
    }

    window.tizen = {
        application: {
            getAppsInfo: function (ok) {
                call('luna://com.webos.applicationManager/listLaunchPoints', {}, function (res) {
                    var apps = (res.launchPoints || []).map(function (lp) {
                        return { id: lp.id, name: lp.title, icon: lp.largeIcon || lp.icon || '' };
                    });
                    ok(asInfo(withInputs(apps)));
                }, function () {
                    ok(asInfo(withInputs(FALLBACK_APPS)));
                });
            },
            launch: function (id, ok, fail) {
                call('luna://com.webos.applicationManager/launch', { id: id }, ok, function (res) {
                    if (fail) fail({ message: res.errorText || 'erro ao abrir' });
                });
            },
            getCurrentApplication: function () {
                return {
                    appInfo: { id: APP_ID },
                    exit: function () {
                        if (window.PalmSystem && PalmSystem.platformBack) PalmSystem.platformBack();
                        else window.close();
                    }
                };
            }
        }
    };
})();
