/*
 * Launcher minimalista para TVs Samsung Tizen.
 * Funciona como um app comum: lista os apps instalados (tizen.application.getAppsInfo),
 * deixa você escolher os favoritos e abre cada um com tizen.application.launch.
 * Fora da TV (navegador do PC) roda em modo de demonstração com apps fictícios.
 */
(function () {
    'use strict';

    var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27,
                RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406 };

    var THEMES = [
        { id: 'grafite',  name: 'Grafite' },
        { id: 'noite',    name: 'Meia-noite' },
        { id: 'floresta', name: 'Floresta' },
        { id: 'areia',    name: 'Areia' },
        { id: 'oled',     name: 'Preto OLED' }
    ];

    // Ícones de linha simples. Cada app recebe um por palavra-chave do nome;
    // os demais ficam com a inicial do nome (monograma).
    var GLYPHS = {
        play:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg>',
        film:  '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 12h18"/></svg>',
        tv:    '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/></svg>',
        music: '<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/></svg>',
        globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
        gear:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
        game:  '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r=".8"/><circle cx="18" cy="13" r=".8"/></svg>',
        photo: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg>'
    };
    var GLYPH_RULES = [
        [/youtube|twitch|vimeo/i, 'play'],
        [/netflix|prime|disney|max|hbo|globo|paramount|star|apple tv|filme|cine|mubi|pluto/i, 'film'],
        [/spotify|deezer|music|música|musica|tidal|radio/i, 'music'],
        [/internet|browser|navegador|web/i, 'globe'],
        [/game|jogo|xbox|steam|geforce|luna/i, 'game'],
        [/galeria|gallery|photo|foto/i, 'photo'],
        [/tv|live|ao vivo|canais/i, 'tv']
    ];

    var STORE_KEY = 'minilauncher.v1';
    var state = { theme: 'grafite', favorites: [], wallpaper: true };

    var installed = [];   // [{id, name}]
    var focusIndex = 0;
    var moving = false;
    var panelOpen = false;
    var panelFocus = { section: 0, index: 0 };   // 0 = temas, 1 = ações, 2 = apps

    var isTizen = typeof window.tizen !== 'undefined' && tizen.application;

    // ---------- Persistência ----------
    function load() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORE_KEY));
            if (saved) {
                state.theme = saved.theme || state.theme;
                state.favorites = saved.favorites || [];
                state.wallpaper = saved.wallpaper !== false;
            }
        } catch (e) { /* começa com o padrão */ }
    }
    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
    }

    // ---------- Apps instalados ----------
    function loadInstalled(done) {
        if (!isTizen) {
            installed = [
                { id: 'demo.youtube', name: 'YouTube' }, { id: 'demo.netflix', name: 'Netflix' },
                { id: 'demo.globoplay', name: 'Globoplay' }, { id: 'demo.prime', name: 'Prime Video' },
                { id: 'demo.spotify', name: 'Spotify' }, { id: 'demo.browser', name: 'Internet' }
            ];
            return done();
        }
        try {
            tizen.application.getAppsInfo(function (list) {
                var self = tizen.application.getCurrentApplication().appInfo.id;
                installed = list
                    .filter(function (a) { return a.show && a.id !== self && a.name; })
                    .map(function (a) { return { id: a.id, name: a.name }; })
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

    function appName(id) {
        for (var i = 0; i < installed.length; i++) if (installed[i].id === id) return installed[i].name;
        return null;
    }

    function launch(id) {
        if (!isTizen) return toast('Demonstração: abriria ' + appName(id));
        tizen.application.launch(id, null, function (err) {
            toast('Não foi possível abrir: ' + err.message);
        });
    }

    // ---------- Ícones ----------
    function iconFor(app) {
        // Ícone personalizado: icons/<id do app>.png dentro do pacote
        var custom = 'icons/' + app.id + '.png';
        var glyph = null;
        for (var i = 0; i < GLYPH_RULES.length; i++) {
            if (GLYPH_RULES[i][0].test(app.name)) { glyph = GLYPHS[GLYPH_RULES[i][1]]; break; }
        }
        var fallback = glyph || '<span>' + app.name.charAt(0).toUpperCase() + '</span>';
        var el = document.createElement('div');
        el.className = 'icon';
        el.innerHTML = fallback;
        var img = new Image();
        img.onload = function () { el.innerHTML = ''; el.appendChild(img); };
        img.src = custom;
        return el;
    }

    // ---------- Tela inicial ----------
    function tiles() {
        var list = state.favorites
            .filter(function (id) { return appName(id) !== null; })
            .map(function (id) { return { id: id, name: appName(id) }; });
        list.push({ id: '__settings', name: 'Personalizar', settings: true });
        return list;
    }

    function renderRow() {
        var row = document.getElementById('row');
        var list = tiles();
        if (focusIndex >= list.length) focusIndex = list.length - 1;
        row.innerHTML = '';
        list.forEach(function (app, i) {
            var t = document.createElement('div');
            t.className = 'tile' + (i === focusIndex ? ' focus' : '') + (moving && i === focusIndex ? ' moving' : '');
            var icon = app.settings ? (function () {
                var d = document.createElement('div'); d.className = 'icon'; d.innerHTML = GLYPHS.gear; return d;
            })() : iconFor(app);
            var label = document.createElement('div');
            label.className = 'label';
            label.textContent = app.name;
            t.appendChild(icon);
            t.appendChild(label);
            row.appendChild(t);
        });
        var hint = document.getElementById('hint');
        if (moving) hint.textContent = '◀ ▶ mover   ·   OK concluir';
        else if (state.favorites.length === 0) hint.textContent = 'Abra "Personalizar" para escolher seus apps';
        else hint.textContent = '';
    }

    function homeKey(code) {
        var list = tiles();
        var lastApp = list.length - 2;   // último índice que é app (antes de "Personalizar")
        switch (code) {
            case KEY.LEFT:
                if (moving) { swap(focusIndex, focusIndex - 1); }
                else if (focusIndex > 0) focusIndex--;
                break;
            case KEY.RIGHT:
                if (moving) { if (focusIndex < lastApp) swap(focusIndex, focusIndex + 1); }
                else if (focusIndex < list.length - 1) focusIndex++;
                break;
            case KEY.ENTER:
                if (moving) { moving = false; save(); break; }
                if (list[focusIndex].settings) openPanel();
                else launch(list[focusIndex].id);
                break;
            case KEY.GREEN:
                openPanel();
                break;
            case KEY.RED:
                if (!list[focusIndex].settings) moving = !moving;
                if (!moving) save();
                break;
            case KEY.BACK: case KEY.ESC:
                if (moving) { moving = false; save(); break; }
                return; // na tela inicial o Voltar não fecha o launcher
        }
        renderRow();
    }

    function swap(a, b) {
        if (b < 0) return;
        var visible = tiles().slice(0, -1).map(function (t) { return t.id; });
        var tmp = visible[a]; visible[a] = visible[b]; visible[b] = tmp;
        // mantém favoritos de apps desinstalados no final
        var hidden = state.favorites.filter(function (id) { return visible.indexOf(id) < 0; });
        state.favorites = visible.concat(hidden);
        focusIndex = b;
    }

    // ---------- Painel ----------
    function actions() {
        return [
            { name: 'Reorganizar apps', run: function () {
                closePanel();
                if (state.favorites.length) { focusIndex = 0; moving = true; renderRow(); }
            } },
            { name: 'Papel de parede: ' + (state.wallpaper ? 'ligado' : 'desligado'), run: function () {
                state.wallpaper = !state.wallpaper; save(); applyWallpaper();
            } },
            { name: 'Fechar launcher', run: function () {
                if (isTizen) tizen.application.getCurrentApplication().exit();
            } }
        ];
    }

    function sectionLength(s) {
        return s === 0 ? THEMES.length : s === 1 ? actions().length : installed.length;
    }

    function renderPanel() {
        var themes = document.getElementById('themes');
        themes.innerHTML = '';
        THEMES.forEach(function (t, i) {
            var c = document.createElement('div');
            c.className = 'chip' + (t.id === state.theme ? ' active' : '') +
                (panelFocus.section === 0 && panelFocus.index === i ? ' focus' : '');
            c.textContent = t.name;
            themes.appendChild(c);
        });

        var acts = document.getElementById('actions');
        acts.innerHTML = '';
        actions().forEach(function (a, i) {
            var c = document.createElement('div');
            c.className = 'chip' + (panelFocus.section === 1 && panelFocus.index === i ? ' focus' : '');
            c.textContent = a.name;
            acts.appendChild(c);
        });

        var apps = document.getElementById('apps');
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
                else if (f.section === 1) { actions()[f.index].run(); if (!panelOpen) return; }
                else toggleFavorite(installed[f.index].id);
                break;
            case KEY.BACK: case KEY.ESC: case KEY.GREEN:
                closePanel();
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
        panelOpen = true;
        panelFocus = { section: 0, index: 0 };
        renderPanel();
        document.getElementById('panel').classList.remove('hidden');
    }
    function closePanel() {
        panelOpen = false;
        document.getElementById('panel').classList.add('hidden');
        renderRow();
    }

    // ---------- Aparência ----------
    function applyTheme() {
        document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
        document.body.classList.add('theme-' + state.theme);
        applyWallpaper();
    }

    // Coloque um arquivo wallpaper.jpg na raiz do projeto para usar como fundo.
    function applyWallpaper() {
        var wp = document.getElementById('wallpaper');
        if (!state.wallpaper) {
            wp.classList.remove('on'); document.body.classList.remove('has-wallpaper'); return;
        }
        var img = new Image();
        img.onload = function () {
            wp.style.backgroundImage = 'url(wallpaper.jpg)';
            wp.classList.add('on'); document.body.classList.add('has-wallpaper');
        };
        img.onerror = function () {
            wp.classList.remove('on'); document.body.classList.remove('has-wallpaper');
        };
        img.src = 'wallpaper.jpg';
    }

    function tick() {
        var now = new Date();
        var h = now.getHours(), m = now.getMinutes();
        document.getElementById('clock').textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        var date = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        document.getElementById('date').textContent = date.charAt(0).toUpperCase() + date.slice(1);
        document.getElementById('greeting').textContent =
            h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    }

    var toastTimer;
    function toast(msg) {
        var t = document.getElementById('toast');
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
        if (panelOpen) panelKey(e.keyCode);
        else homeKey(e.keyCode);
    });

    // Recarrega a lista quando o launcher volta ao primeiro plano (app instalado/removido).
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) loadInstalled(renderRow);
    });

    load();
    applyTheme();
    registerKeys();
    tick();
    setInterval(tick, 10000);
    loadInstalled(function () {
        // Primeira execução: sugere alguns apps comuns, se estiverem instalados.
        if (!state.favorites.length) {
            var common = /youtube|netflix|globoplay|prime video|disney|max|spotify/i;
            state.favorites = installed.filter(function (a) { return common.test(a.name); })
                                       .map(function (a) { return a.id; });
            save();
        }
        renderRow();
    });
})();
