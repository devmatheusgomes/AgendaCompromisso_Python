/*
 * Launcher para TVs Samsung Tizen.
 * Funciona como um app comum: lista os apps instalados (tizen.application.getAppsInfo),
 * deixa você escolher os favoritos e abre cada um com tizen.application.launch.
 * Fundo: foto do dia do Bing (ou wallpaper.jpg local). Clima: Open-Meteo, fixo em Goiânia/GO.
 * Fora da TV (navegador do PC) roda em modo de demonstração com apps fictícios.
 */
(function () {
    'use strict';

    var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27,
                RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406 };

    // Goiânia/GO (região do CEP 74884-115). Troque aqui para outra cidade.
    var PLACE = { name: 'Goiânia, GO', lat: -16.6869, lon: -49.2648 };
    var WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=' + PLACE.lat +
        '&longitude=' + PLACE.lon +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day' +
        '&hourly=temperature_2m,weather_code,is_day' +
        '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
        '&timezone=America%2FSao_Paulo&forecast_days=2';
    var BING_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=pt-BR';

    var THEMES = [
        { id: 'grafite',    name: 'Grafite' },
        { id: 'noite',      name: 'Meia-noite' },
        { id: 'floresta',   name: 'Floresta' },
        { id: 'por-do-sol', name: 'Pôr do sol' },
        { id: 'oled',       name: 'Preto OLED' }
    ];
    var WALLPAPERS = [
        { id: 'bing',  name: 'Foto do dia' },
        { id: 'local', name: 'wallpaper.jpg' },
        { id: 'off',   name: 'Sem foto' }
    ];

    var SVG = {
        apps:  '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/></svg>',
        gear:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
        play:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>'
    };

    // Ícones de clima (linha) por código WMO
    var WX_ICON = {
        sun:   '<svg viewBox="0 0 24 24"><g class="sun"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></svg>',
        moon:  '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
        part:  '<svg viewBox="0 0 24 24"><g class="sun"><circle cx="8.5" cy="8.5" r="3.2"/><path d="M8.5 2.5v1.5M2.5 8.5H4M4.3 4.3l1 1M12.7 4.3l-1 1"/></g><path d="M8 19h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.4 1.3A2.9 2.9 0 0 0 8 19z"/></svg>',
        cloud: '<svg viewBox="0 0 24 24"><path d="M7 19h10.5a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 19z"/></svg>',
        fog:   '<svg viewBox="0 0 24 24"><path d="M4 9h16M3 13h18M5 17h14"/></svg>',
        rain:  '<svg viewBox="0 0 24 24"><path d="M7 15h10.5a4 4 0 0 0 0-8A5.5 5.5 0 0 0 6.9 8.5 3.3 3.3 0 0 0 7 15z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/></svg>',
        storm: '<svg viewBox="0 0 24 24"><path d="M7 15h10.5a4 4 0 0 0 0-8A5.5 5.5 0 0 0 6.9 8.5 3.3 3.3 0 0 0 7 15z"/><path d="M12.5 15l-2 3.5h3l-2 3.5"/></svg>'
    };
    function wmo(code, isDay) {
        var c = Number(code);
        if (c === 0) return { d: 'Céu limpo', i: isDay ? 'sun' : 'moon' };
        if (c === 1) return { d: 'Poucas nuvens', i: isDay ? 'part' : 'moon' };
        if (c === 2) return { d: 'Parcialmente nublado', i: isDay ? 'part' : 'cloud' };
        if (c === 3) return { d: 'Nublado', i: 'cloud' };
        if (c === 45 || c === 48) return { d: 'Neblina', i: 'fog' };
        if (c >= 51 && c <= 57) return { d: 'Garoa', i: 'rain' };
        if (c >= 61 && c <= 67) return { d: c >= 65 ? 'Chuva forte' : 'Chuva', i: 'rain' };
        if (c >= 71 && c <= 77) return { d: 'Neve', i: 'cloud' };
        if (c >= 80 && c <= 82) return { d: 'Pancadas de chuva', i: 'rain' };
        if (c >= 95) return { d: 'Trovoadas', i: 'storm' };
        return { d: '—', i: 'cloud' };
    }

    // Cores e "marca em texto" dos apps mais comuns. Não usa logotipos oficiais:
    // para usar uma imagem, coloque icons/<ID do app>.png (250x140).
    var BRANDS = [
        [/youtube/i,      { bg: '#ffffff', fg: '#212121', text: 'YouTube', badge: 'yt', size: 'sm' }],
        [/netflix/i,      { bg: '#000000', fg: '#e50914', text: 'NETFLIX' }],
        [/globoplay/i,    { bg: 'linear-gradient(135deg,#ff4b2b,#e0115f)', fg: '#fff', text: 'globoplay' }],
        [/disney/i,       { bg: 'linear-gradient(160deg,#0b1d4f,#0e7490)', fg: '#fff', text: 'Disney+' }],
        [/prime/i,        { bg: '#0f171e', fg: '#00a8e1', text: 'prime video', size: 'sm' }],
        [/^max$|hbo/i,    { bg: '#002be7', fg: '#fff', text: 'max' }],
        [/paramount/i,    { bg: '#0064ff', fg: '#fff', text: 'Paramount+', size: 'sm' }],
        [/apple tv/i,     { bg: '#000', fg: '#fff', text: 'tv', size: 'sm' }],
        [/spotify/i,      { bg: '#121212', fg: '#1ed760', text: 'Spotify' }],
        [/deezer/i,       { bg: '#a238ff', fg: '#fff', text: 'deezer' }],
        [/twitch/i,       { bg: '#9146ff', fg: '#fff', text: 'twitch' }],
        [/crunchyroll/i,  { bg: '#f47521', fg: '#fff', text: 'crunchyroll', size: 'sm' }],
        [/pluto/i,        { bg: '#000', fg: '#fff200', text: 'pluto tv', size: 'sm' }],
        [/claro/i,        { bg: '#da291c', fg: '#fff', text: 'Claro tv+', size: 'sm' }],
        [/internet|browser|navegador/i, { bg: '#1a73e8', fg: '#fff', text: 'Internet', size: 'sm' }]
    ];

    var STORE_KEY = 'minilauncher.v2';
    var state = { theme: 'grafite', favorites: [], wallpaper: 'bing' };

    var installed = [];   // [{id, name, icon}]
    var zone = 'row';     // 'top' | 'row'
    var focusIndex = 0, topIndex = 0;
    var moving = false;
    var view = 'home';    // 'home' | 'panel' | 'all'
    var panelFocus = { section: 0, index: 0 };   // 0 temas, 1 ações, 2 apps
    var gridIndex = 0, GRID_COLS = 6;

    var isTizen = typeof window.tizen !== 'undefined' && tizen.application;

    function $(id) { return document.getElementById(id); }

    // ---------- Persistência ----------
    function load() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORE_KEY));
            if (saved) {
                state.theme = saved.theme || state.theme;
                state.favorites = saved.favorites || [];
                state.wallpaper = saved.wallpaper || state.wallpaper;
            }
        } catch (e) { /* começa com o padrão */ }
    }
    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
    }
    function cacheGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
    function cacheSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

    function getJSON(url, ok, fail) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.timeout = 15000;
        xhr.onload = function () {
            if (xhr.status !== 200) return fail && fail();
            try { ok(JSON.parse(xhr.responseText)); } catch (e) { if (fail) fail(); }
        };
        xhr.onerror = xhr.ontimeout = function () { if (fail) fail(); };
        xhr.send();
    }

    // ---------- Apps instalados ----------
    function loadInstalled(done) {
        if (!isTizen) {
            installed = ['YouTube', 'Netflix', 'Globoplay', 'Disney+', 'Prime Video', 'Max', 'Spotify', 'Internet', 'Galeria']
                .map(function (n) { return { id: 'demo.' + n.toLowerCase().replace(/\W/g, ''), name: n, icon: '' }; });
            return done();
        }
        try {
            tizen.application.getAppsInfo(function (list) {
                var self = tizen.application.getCurrentApplication().appInfo.id;
                installed = list
                    .filter(function (a) { return a.show && a.id !== self && a.name; })
                    .map(function (a) { return { id: a.id, name: a.name, icon: a.iconPath || '' }; })
                    .sort(function (a, b) { return a.name.localeCompare(b.name); });
                done();
            }, function (err) {
                toast('Não foi possível listar os apps: ' + err.message);
                done();
            });
        } catch (e) {
            toast('Erro ao listar apps: ' + e.message);
            done();
        }
    }

    function findApp(id) {
        for (var i = 0; i < installed.length; i++) if (installed[i].id === id) return installed[i];
        return null;
    }

    function launch(app) {
        if (!isTizen) return toast('Demonstração: abriria ' + app.name);
        tizen.application.launch(app.id, null, function (err) {
            toast('Não foi possível abrir: ' + err.message);
        });
    }

    // ---------- Cartões ----------
    function brandOf(name) {
        for (var i = 0; i < BRANDS.length; i++) if (BRANDS[i][0].test(name)) return BRANDS[i][1];
        return null;
    }

    var customIcon = {};   // id -> existe icons/<id>.png?
    var resolved = {};     // id -> imagem que funcionou ({url, full}) ou null (usa texto)

    // Texto com as cores da marca: só aparece se a TV não fornecer o ícone do app
    function wordmark(t, app) {
        var b = brandOf(app.name);
        t.innerHTML = '';
        if (b) {
            t.className = t.className.replace(' generic', '');
            t.style.background = b.bg;
            if (b.badge === 'yt') t.insertAdjacentHTML('beforeend', '<div class="yt-badge"></div>');
            var w = document.createElement('div');
            w.className = 'word' + (b.size ? ' ' + b.size : '');
            w.style.color = b.fg;
            w.textContent = b.text;
            t.appendChild(w);
        } else {
            t.className += ' generic';
            t.insertAdjacentHTML('beforeend', SVG.play);
            var n = document.createElement('div');
            n.className = 'word';
            n.textContent = app.name;
            t.appendChild(n);
        }
    }

    // Caminho do ícone instalado; algumas versões do Tizen retornam sem "file://"
    function iconUrls(path) {
        if (!path) return [];
        return /^[a-z]+:/i.test(path) ? [path] : [path, 'file://' + path];
    }

    function makeTile(app) {
        var t = document.createElement('div');
        t.className = 'tile';

        // 1) icons/<id>.png escolhido por você cobre o cartão inteiro
        // 2) ícone oficial do app, o mesmo que a TV mostra (sempre a versão instalada)
        // 3) nome em texto com as cores da marca
        var sources = [];
        if (resolved[app.id]) sources.push(resolved[app.id]);
        else if (resolved[app.id] === null) sources = [];
        else if (customIcon[app.id] !== false) sources.push({ url: 'icons/' + app.id + '.png', full: true });
        if (resolved[app.id] === undefined) iconUrls(app.icon).forEach(function (u) { sources.push({ url: u }); });

        var b = brandOf(app.name);
        t.style.background = b ? b.bg : '';
        if (!b) t.className += ' generic';

        (function next(i) {
            if (i >= sources.length) { resolved[app.id] = null; return wordmark(t, app); }
            var src = sources[i];
            var img = new Image();
            img.onload = function () {
                if (src.full) customIcon[app.id] = true;
                resolved[app.id] = src;
                t.innerHTML = '';
                img.className = src.full ? 'full' : 'app-icon';
                t.appendChild(img);
            };
            img.onerror = function () {
                if (src.full) customIcon[app.id] = false;
                next(i + 1);
            };
            img.src = src.url;
        })(0);
        return t;
    }

    // ---------- Tela inicial ----------
    function favorites() {
        return state.favorites.map(findApp).filter(function (a) { return a; });
    }

    var TOP = [
        { icon: SVG.apps, name: 'Todos os apps', run: function () { openAll(); } },
        { icon: SVG.gear, name: 'Personalizar',  run: function () { openPanel(); } }
    ];

    function renderTop() {
        var bar = $('topbar');
        bar.innerHTML = '';
        TOP.forEach(function (b, i) {
            var d = document.createElement('div');
            d.className = 'round' + (zone === 'top' && i === topIndex ? ' focus' : '');
            d.innerHTML = b.icon;
            bar.appendChild(d);
        });
    }

    function renderRow() {
        var row = $('row');
        var list = favorites();
        if (focusIndex >= list.length) focusIndex = Math.max(0, list.length - 1);
        row.innerHTML = '';
        list.forEach(function (app, i) {
            var t = makeTile(app);
            if (zone === 'row' && i === focusIndex) t.classList.add('focus');
            if (moving && i === focusIndex) t.classList.add('moving');
            row.appendChild(t);
        });
        // rola a faixa quando há mais cartões do que cabem (6 visíveis)
        var shift = Math.max(0, focusIndex - 5) * (250 + 34);
        row.style.transform = 'translateX(' + (-shift) + 'px)';

        var label = $('label');
        if (moving) label.textContent = '◀ ▶ mover   ·   OK concluir';
        else if (!list.length) label.textContent = 'Vá em ⚙ Personalizar para escolher seus apps';
        else if (zone === 'row') label.textContent = list[focusIndex].name;
        else if (zone === 'media') label.textContent = MEDIA_BTNS[mediaIndex];
        else label.textContent = TOP[topIndex].name;
        renderTop();
        renderMedia();
    }

    function homeKey(code) {
        var list = favorites();
        if (moving) {
            if (code === KEY.LEFT && focusIndex > 0) swap(focusIndex, focusIndex - 1);
            else if (code === KEY.RIGHT && focusIndex < list.length - 1) swap(focusIndex, focusIndex + 1);
            else if (code === KEY.ENTER || code === KEY.BACK || code === KEY.ESC || code === KEY.RED) { moving = false; save(); }
            return renderRow();
        }
        switch (code) {
            case KEY.LEFT:
                if (zone === 'row' && focusIndex > 0) focusIndex--;
                if (zone === 'top' && topIndex > 0) topIndex--;
                if (zone === 'media' && mediaIndex > 0) mediaIndex--;
                break;
            case KEY.RIGHT:
                if (zone === 'row' && focusIndex < list.length - 1) focusIndex++;
                if (zone === 'top' && topIndex < TOP.length - 1) topIndex++;
                if (zone === 'media' && mediaIndex < MEDIA_BTNS.length - 1) mediaIndex++;
                break;
            case KEY.UP:
                zone = (zone === 'row' && media.now) ? 'media' : 'top';
                break;
            case KEY.DOWN:
                if (zone === 'top' && media.now) zone = 'media';
                else if (list.length) zone = 'row';
                break;
            case KEY.ENTER:
                if (zone === 'top') TOP[topIndex].run();
                else if (zone === 'media') mediaAction(mediaIndex);
                else if (list[focusIndex]) launch(list[focusIndex]);
                break;
            case KEY.GREEN: openPanel(); break;
            case KEY.YELLOW: openAll(); break;
            case KEY.RED:
                if (zone === 'row' && list.length) moving = true;
                break;
            default:
                return; // Voltar na tela inicial não fecha o launcher
        }
        renderRow();
    }

    function swap(a, b) {
        var visible = favorites().map(function (x) { return x.id; });
        var tmp = visible[a]; visible[a] = visible[b]; visible[b] = tmp;
        // mantém favoritos de apps desinstalados no final
        var hidden = state.favorites.filter(function (id) { return visible.indexOf(id) < 0; });
        state.favorites = visible.concat(hidden);
        focusIndex = b;
    }

    // ---------- Player de mídia ----------
    // Lê o que está tocando pela Media Controller API do Tizen (tizen.mediacontroller).
    // Só aparece se o app que está tocando (Spotify, YouTube…) publicar essas informações.
    var MEDIA_BTNS = ['Abrir app', 'Anterior', 'Tocar / pausar', 'Próxima'];
    var mediaIndex = 2;
    var media = { now: null, demo: { title: 'Alien Boy', artist: 'Oliver Tree', appId: 'demo.spotify',
                                     state: 'PLAY', position: 52000, duration: 160000 } };
    var MEDIA_SVG = {
        prev:  '<svg viewBox="0 0 24 24"><path d="M6 5v14M19 5l-10 7 10 7z"/></svg>',
        next:  '<svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l10 7-10 7z"/></svg>',
        play:  '<svg viewBox="0 0 24 24"><path d="M7 4.5l13 7.5-13 7.5z"/></svg>',
        pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
        note:  '<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg>'
    };

    function mediaFrom(server) {
        if (!server || server.state === 'INACTIVE' || !server.playback) return null;
        var pb = server.playback, st = pb.state;
        if (st !== 'PLAY' && st !== 'PAUSE') return null;
        var md = pb.metadata || {};
        return {
            server: server, appId: server.name, state: st,
            title: md.title || '', artist: md.artist || md.album || '',
            picture: md.picture || '', position: pb.position || 0,
            duration: parseInt(md.duration, 10) || 0
        };
    }

    function readMedia(done) {
        if (!isTizen) return done(media.demo);
        var client;
        try { client = tizen.mediacontroller.getClient(); } catch (e) { return done(null); }
        try {
            if (client.getLatestServerInfo) return done(mediaFrom(client.getLatestServerInfo()));
            client.findServers(function (list) {
                var found = null;
                list.forEach(function (s) { found = found || mediaFrom(s); });
                done(found);
            }, function () { done(null); });
        } catch (e) { done(null); }
    }

    function pollMedia() {
        if (document.hidden || view !== 'home') return;
        readMedia(function (now) {
            var had = !!media.now;
            media.now = now;
            if (!now && zone === 'media') zone = 'row';
            if (had !== !!now) renderRow(); else renderMedia();
        });
    }

    function renderMedia() {
        var box = $('media'), m = media.now;
        $('weather').classList.toggle('compact', !!m);
        if (!m) { box.classList.add('hidden'); return; }
        box.classList.remove('hidden');

        var app = findApp(m.appId);
        $('m-title').textContent = m.title || (app ? app.name : 'Tocando agora');
        $('m-artist').textContent = m.artist;
        $('m-app').textContent = app ? app.name : '';

        var cover = $('m-cover');
        var known = app && resolved[app.id];
        var pic = m.picture || (known && !known.full ? known.url : '') || '';
        if (cover.getAttribute('data-src') !== pic) {
            cover.setAttribute('data-src', pic);
            cover.innerHTML = MEDIA_SVG.note;
            if (pic) {
                var img = new Image();
                img.onload = function () { cover.innerHTML = ''; cover.appendChild(img); };
                img.src = pic;
            }
        }

        var bar = $('m-bar');
        bar.style.visibility = m.duration ? 'visible' : 'hidden';
        if (m.duration) $('m-fill').style.width = Math.min(100, 100 * m.position / m.duration) + '%';

        var btns = [null, MEDIA_SVG.prev, m.state === 'PLAY' ? MEDIA_SVG.pause : MEDIA_SVG.play, MEDIA_SVG.next];
        var row = $('m-btns');
        row.innerHTML = '';
        for (var i = 1; i < btns.length; i++) {
            var d = document.createElement('div');
            d.className = 'm-btn' + (zone === 'media' && mediaIndex === i ? ' focus' : '');
            d.innerHTML = btns[i];
            row.appendChild(d);
        }
        box.classList.toggle('focus-open', zone === 'media' && mediaIndex === 0);
    }

    function mediaAction(i) {
        var m = media.now;
        if (!m) return;
        if (i === 0) {
            var app = findApp(m.appId);
            return app ? launch(app) : toast('App de mídia não encontrado');
        }
        var action = i === 1 ? 'PREV' : i === 3 ? 'NEXT' : (m.state === 'PLAY' ? 'PAUSE' : 'PLAY');
        if (!isTizen) {
            if (i === 2) m.state = action;
            return renderMedia();
        }
        try {
            if (m.server.sendPlaybackAction) m.server.sendPlaybackAction(action, function () { });
            else m.server.sendPlaybackState(action, function () { }, function (e) { toast(e.message); });
        } catch (e) {
            toast('O app não aceitou o comando: ' + e.message);
        }
        setTimeout(pollMedia, 700);
    }

    // ---------- Todos os apps ----------
    function renderAll() {
        var grid = $('grid');
        grid.innerHTML = '';
        var inner = document.createElement('div');
        inner.className = 'inner';
        installed.forEach(function (app, i) {
            var t = makeTile(app);
            if (i === gridIndex) t.classList.add('focus');
            inner.appendChild(t);
        });
        grid.appendChild(inner);
        var rowH = 140 + 40, visibleRows = 4;
        var r = Math.floor(gridIndex / GRID_COLS);
        inner.style.transform = 'translateY(' + (-Math.max(0, r - visibleRows + 1) * rowH) + 'px)';
    }
    function allKey(code) {
        var n = installed.length;
        switch (code) {
            case KEY.LEFT:  if (gridIndex % GRID_COLS > 0) gridIndex--; break;
            case KEY.RIGHT: if (gridIndex % GRID_COLS < GRID_COLS - 1 && gridIndex < n - 1) gridIndex++; break;
            case KEY.UP:    if (gridIndex >= GRID_COLS) gridIndex -= GRID_COLS; break;
            case KEY.DOWN:  if (gridIndex + GRID_COLS < n) gridIndex += GRID_COLS; break;
            case KEY.ENTER: if (installed[gridIndex]) launch(installed[gridIndex]); break;
            case KEY.BACK: case KEY.ESC: case KEY.YELLOW: closeOverlay(); return;
        }
        renderAll();
    }
    function openAll() {
        view = 'all'; gridIndex = 0;
        renderAll();
        $('all').classList.remove('hidden');
    }

    // ---------- Painel ----------
    function wallpaperName() {
        for (var i = 0; i < WALLPAPERS.length; i++) if (WALLPAPERS[i].id === state.wallpaper) return WALLPAPERS[i].name;
        return '';
    }
    function actions() {
        return [
            { name: 'Reorganizar apps', run: function () {
                closeOverlay();
                if (favorites().length) { zone = 'row'; focusIndex = 0; moving = true; renderRow(); }
            } },
            { name: 'Fundo: ' + wallpaperName(), run: function () {
                var i = 0;
                while (WALLPAPERS[i].id !== state.wallpaper) i++;
                state.wallpaper = WALLPAPERS[(i + 1) % WALLPAPERS.length].id;
                save(); applyWallpaper();
            } },
            { name: 'Atualizar clima', run: function () { loadWeather(true); } },
            { name: 'Fechar launcher', run: function () {
                if (isTizen) tizen.application.getCurrentApplication().exit();
            } }
        ];
    }

    function sectionLength(s) {
        return s === 0 ? THEMES.length : s === 1 ? actions().length : installed.length;
    }

    function renderPanel() {
        var themes = $('themes');
        themes.innerHTML = '';
        THEMES.forEach(function (t, i) {
            var c = document.createElement('div');
            c.className = 'chip' + (t.id === state.theme ? ' active' : '') +
                (panelFocus.section === 0 && panelFocus.index === i ? ' focus' : '');
            c.textContent = t.name;
            themes.appendChild(c);
        });

        var acts = $('actions');
        acts.innerHTML = '';
        actions().forEach(function (a, i) {
            var c = document.createElement('div');
            c.className = 'chip' + (panelFocus.section === 1 && panelFocus.index === i ? ' focus' : '');
            c.textContent = a.name;
            acts.appendChild(c);
        });

        var apps = $('apps');
        apps.innerHTML = '';
        var inner = document.createElement('div');
        inner.className = 'inner';
        installed.forEach(function (app, i) {
            var on = state.favorites.indexOf(app.id) >= 0;
            var it = document.createElement('div');
            it.className = 'app-item' + (on ? ' on' : '') +
                (panelFocus.section === 2 && panelFocus.index === i ? ' focus' : '');
            it.innerHTML = '<span></span><span class="check">' + (on ? '●' : '○') + '</span>';
            it.firstChild.textContent = app.name;
            inner.appendChild(it);
        });
        apps.appendChild(inner);
        // rolagem simples: mantém o item focado visível
        if (panelFocus.section === 2) {
            var itemH = 78, visible = Math.floor(apps.clientHeight / itemH);
            var offset = Math.max(0, panelFocus.index - visible + 2);
            inner.style.top = (-offset * itemH) + 'px';
        }
    }

    function panelKey(code) {
        var f = panelFocus;
        var horizontal = f.section < 2;
        switch (code) {
            case KEY.LEFT:  if (horizontal && f.index > 0) f.index--; break;
            case KEY.RIGHT: if (horizontal && f.index < sectionLength(f.section) - 1) f.index++; break;
            case KEY.UP:
                if (f.section === 2 && f.index > 0) f.index--;
                else if (f.section > 0) { f.section--; f.index = 0; }
                break;
            case KEY.DOWN:
                if (f.section === 2) { if (f.index < installed.length - 1) f.index++; }
                else if (sectionLength(f.section + 1) > 0) { f.section++; f.index = 0; }
                break;
            case KEY.ENTER:
                if (f.section === 0) { state.theme = THEMES[f.index].id; applyTheme(); save(); }
                else if (f.section === 1) { actions()[f.index].run(); if (view !== 'panel') return; }
                else toggleFavorite(installed[f.index].id);
                break;
            case KEY.BACK: case KEY.ESC: case KEY.GREEN:
                closeOverlay();
                return;
        }
        renderPanel();
    }

    function toggleFavorite(id) {
        var i = state.favorites.indexOf(id);
        if (i >= 0) state.favorites.splice(i, 1);
        else state.favorites.push(id);
        save();
        renderRow();
    }

    function openPanel() {
        view = 'panel';
        panelFocus = { section: 0, index: 0 };
        renderPanel();
        $('panel').classList.remove('hidden');
    }
    function closeOverlay() {
        view = 'home';
        pollMedia();
        $('panel').classList.add('hidden');
        $('all').classList.add('hidden');
        renderRow();
    }

    // ---------- Aparência ----------
    function applyTheme() {
        document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
        document.body.classList.add('theme-' + state.theme);
    }

    function showWallpaper(url, title, credit) {
        var wp = $('wallpaper');
        var img = new Image();
        img.onload = function () {
            wp.style.backgroundImage = 'url("' + url + '")';
            wp.classList.add('on');
            $('photo-title').textContent = title || '';
            $('photo-credit').textContent = credit || '';
        };
        img.onerror = function () { hideWallpaper(); };
        img.src = url;
    }
    function hideWallpaper() {
        $('wallpaper').classList.remove('on');
        $('photo-title').textContent = '';
        $('photo-credit').textContent = '';
    }

    function applyWallpaper() {
        if (state.wallpaper === 'off') return hideWallpaper();
        if (state.wallpaper === 'local') return showWallpaper('wallpaper.jpg', '', '');

        // Foto do dia do Bing; guarda a última para funcionar sem internet
        var cached = cacheGet('wallpaper.bing');
        if (cached) showWallpaper(cached.url, cached.title, cached.credit);
        getJSON(BING_URL, function (data) {
            var im = data.images && data.images[0];
            if (!im) return;
            // "Título (© Autor/Agência)" → separa título e crédito
            var m = /^(.*?)\s*\((©.*)\)\s*$/.exec(im.copyright || '');
            var info = {
                url: 'https://www.bing.com' + im.url.replace(/_\d+x\d+\.jpg/, '_1920x1080.jpg'),
                title: m ? m[1] : (im.title || ''),
                credit: m ? m[2] : ''
            };
            cacheSet('wallpaper.bing', info);
            if (state.wallpaper === 'bing' && (!cached || cached.url !== info.url)) {
                showWallpaper(info.url, info.title, info.credit);
            }
        }, function () {
            if (!cached) showWallpaper('wallpaper.jpg', '', '');
        });
    }

    // ---------- Clima ----------
    function renderWeather(data) {
        var c = data.current, d = data.daily, h = data.hourly;
        var now = wmo(c.weather_code, c.is_day);
        $('w-icon').innerHTML = WX_ICON[now.i];
        $('w-temp').textContent = Math.round(c.temperature_2m);
        $('w-desc').textContent = now.d;
        $('w-place').textContent = PLACE.name;
        $('w-extra').innerHTML = '';
        [
            '↑ ' + Math.round(d.temperature_2m_max[0]) + '°  ↓ ' + Math.round(d.temperature_2m_min[0]) + '°  ·  Sensação ' + Math.round(c.apparent_temperature) + '°',
            'Umidade ' + c.relative_humidity_2m + '%  ·  Chuva ' + (d.precipitation_probability_max[0] || 0) + '%  ·  Vento ' + Math.round(c.wind_speed_10m) + ' km/h'
        ].forEach(function (line) {
            var div = document.createElement('div');
            div.textContent = line;
            $('w-extra').appendChild(div);
        });

        // Próximas horas, de 3 em 3
        var hours = $('w-hours');
        hours.innerHTML = '';
        var start = 0;
        while (start < h.time.length && h.time[start] < c.time) start++;
        for (var k = 1; k <= 4; k++) {
            var i = start + k * 3;
            if (i >= h.time.length) break;
            var w = wmo(h.weather_code[i], h.is_day[i]);
            var el = document.createElement('div');
            el.className = 'w-hour';
            el.innerHTML = '<div class="h">' + h.time[i].slice(11, 13) + 'h</div>' + WX_ICON[w.i] +
                '<div class="t">' + Math.round(h.temperature_2m[i]) + '°</div>';
            hours.appendChild(el);
        }
    }

    function loadWeather(manual) {
        var cached = cacheGet('weather');
        if (cached && !manual) renderWeather(cached);
        getJSON(WEATHER_URL, function (data) {
            cacheSet('weather', data);
            renderWeather(data);
            if (manual) toast('Clima atualizado');
        }, function () {
            if (!cached) $('w-desc').textContent = 'Sem conexão para o clima';
            if (manual) toast('Não foi possível atualizar o clima');
        });
    }

    // ---------- Relógio e avisos ----------
    function tick() {
        var now = new Date();
        var h = now.getHours(), m = now.getMinutes();
        $('clock').textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        var date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        $('date').textContent = date.charAt(0).toUpperCase() + date.slice(1);
    }

    var toastTimer;
    function toast(msg) {
        var t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3000);
    }

    // ---------- Inicialização ----------
    function registerKeys() {
        if (!window.tizen || !tizen.tvinputdevice) return;
        ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'].forEach(function (k) {
            try { tizen.tvinputdevice.registerKey(k); } catch (e) { }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (view === 'panel') panelKey(e.keyCode);
        else if (view === 'all') allKey(e.keyCode);
        else homeKey(e.keyCode);
    });

    // Ao voltar para o launcher: recarrega apps (instalados/removidos) e o clima
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) { loadInstalled(renderRow); loadWeather(false); pollMedia(); }
    });

    load();
    applyTheme();
    applyWallpaper();
    registerKeys();
    tick();
    setInterval(tick, 10000);
    loadWeather(false);
    setInterval(pollMedia, 2000);
    setInterval(function () { loadWeather(false); }, 30 * 60 * 1000);
    setInterval(applyWallpaper, 6 * 60 * 60 * 1000);
    loadInstalled(function () {
        // Primeira execução: sugere alguns apps comuns, se estiverem instalados.
        if (!state.favorites.length) {
            var common = /youtube|netflix|globoplay|prime video|disney|^max$|spotify/i;
            state.favorites = installed.filter(function (a) { return common.test(a.name); })
                                       .map(function (a) { return a.id; });
            save();
        }
        renderRow();
        pollMedia();
    });
})();
