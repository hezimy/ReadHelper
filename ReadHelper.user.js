// ==UserScript==
// @name         ReadHelper
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Reading helper with multiple themes and settings
// @author       hezimy (https://github.com/hezimy)
// @match        *://*/*
// @exclude      file:///*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript== 

(function() {
    'use strict';

    // 单例守卫：防止 SPA 路由切换或脚本重复注入导致多组按钮
    if (window.__ReadHelperLoaded) return;
    window.__ReadHelperLoaded = true;

    var isIframe = window.self !== window.top;

    var themes = {
        original: { name: '\u539f\u8272', brightness: 100, contrast: 100, sepia: 0, bg: 'transparent', fg: 'transparent', accent: 'transparent', displayBg: '#f0f0f0', displayFg: '#333', displayAccent: '#999', icon: '\ud83d\udd04' },
        light: { name: '\u660e\u4eae', brightness: 100, contrast: 100, sepia: 0, bg: '#ffffff', fg: '#333333', accent: '#409EFF', icon: '\u2600\ufe0f' },
        paper: { name: '\u7eb8\u7eb9', brightness: 100, contrast: 95, sepia: 5, bg: 'rgb(253, 246, 222)', fg: '#3e2723', accent: '#6d4c41', icon: '\ud83d\udcc4' },
        sepiapaper: { name: '\u6000\u65e7', brightness: 100, contrast: 90, sepia: 40, bg: '#f4e8d0', fg: '#5b4636', accent: '#a0522d', icon: '\ud83d\udcdc' },
        eyecare: { name: '\u62a4\u773c', brightness: 100, contrast: 92, sepia: 18, bg: '#f7f1e1', fg: '#4a3b2a', accent: '#BC942C', icon: '\ud83d\udc41\ufe0f' },
        sage: { name: '\u8c46\u6c99\u7eff', brightness: 100, contrast: 95, sepia: 0, bg: '#dfebdd', fg: '#2e4a33', accent: '#5a8c5a', icon: '\ud83c\udf3f' },
        warmgray: { name: '\u6696\u7070', brightness: 100, contrast: 96, sepia: 8, bg: '#e8e4dc', fg: '#3d3d3d', accent: '#8a8a8a', icon: '\ud83d\udc1a' },
        sky: { name: '\u5929\u7a7a', brightness: 100, contrast: 100, sepia: 0, bg: '#e3f2fd', fg: '#0d47a1', accent: '#638FD9', icon: '\ud83c\udf24\ufe0f' },
        dark: { name: '\u6697\u591c', brightness: 100, contrast: 100, sepia: 0, bg: '#121212', fg: '#e0e0e0', accent: '#90a4ae', icon: '\ud83c\udf11' },
        highcontrast: { name: '\u9ad8\u5bf9\u6bd4', brightness: 110, contrast: 150, sepia: 0, bg: '#000000', fg: '#ffffff', accent: '#F6C342', icon: '\u26ab' },
        midnight: { name: '\u5348\u591c', brightness: 85, contrast: 120, sepia: 5, bg: '#141226', fg: '#b0bec5', accent: '#7e57c2', icon: '\ud83c\udf03' },
        ocean: { name: '\u6d77\u6d0b', brightness: 92, contrast: 105, sepia: 5, bg: '#0d1b2a', fg: '#e0e1dd', accent: '#29b6f6', icon: '\ud83c\udf0a' },
        forest: { name: '\u68ee\u6797', brightness: 95, contrast: 100, sepia: 5, bg: '#1b3a1b', fg: '#c8e6c9', accent: '#4caf50', icon: '\ud83c\udf32' },
        espresso: { name: '\u5496\u5561', brightness: 90, contrast: 100, sepia: 25, bg: '#2c1810', fg: '#d7ccc8', accent: '#8d6e63', icon: '\u2615' },
        nightamber: { name: '\u7425\u73c0\u591c', brightness: 90, contrast: 100, sepia: 35, bg: '#2a2318', fg: '#d9c9a5', accent: '#F6C342', icon: '\ud83d\udd6f\ufe0f' },
        // 以下为方便自定义主题套色设置
        // 柔和米白办公护眼
        officecream: { name: '\u7c73\u767d\u529e\u516c', brightness: 100, contrast: 96, sepia: 5, bg: '#F8F7F4', fg: '#2D3033', accent: '#5B8DB8', secondary: '#6B7278', border: '#DCD9D4', bg2: '#F2F0EB', bg3: '#EAE7E0', hover: '#EAE7E0', select: '#D1E4F2', success: '#368B5E', warning: '#D48A3E', danger: '#C84A4A', icon: '\ud83d\udccb' },
        // 冷调浅灰程序员编辑器风
        codegray: { name: '\u51b7\u7070\u7f16\u8f91\u5668', brightness: 100, contrast: 100, sepia: 0, bg: '#F5F7FA', fg: '#1F2937', accent: '#5B8DB8', secondary: '#64748B', border: '#D1D9E6', bg2: '#EEF2F9', bg3: '#E9EEF7', hover: '#E9EEF7', select: '#C7E0FB', success: '#368B5E', warning: '#D48A3E', danger: '#C84A4A', icon: '\ud83d\udcbb' },
        // 炭灰暖调护眼深色
        warmcharcoal: { name: '\u6696\u70ad\u6df1\u8272', brightness: 95, contrast: 105, sepia: 10, bg: '#2A2927', fg: '#EAE7E0', accent: '#A67F3F', secondary: '#A8A39C', border: '#4B4945', bg2: '#383633', bg3: '#31302E', hover: '#B9924E', select: '#8C6A33', success: '#63A883', warning: '#E09F5C', danger: '#DD6464', icon: '\ud83d\udcd4' },
        // 冷灰程序员暗色
        codedark: { name: '\u51b7\u7070\u4ee3\u7801', brightness: 95, contrast: 110, sepia: 0, bg: '#1E293B', fg: '#E2E8F0', accent: '#5576A8', secondary: '#94A3B8', border: '#475569', bg2: '#334155', bg3: '#273449', hover: '#374151', select: '#1E4068', success: '#63A883', warning: '#E09F5C', danger: '#DD6464', icon: '\ud83d\udd2c' }
    };

    var themeKeys = Object.keys(themes);
    var currentIndex = 0;
    var isActive = false;
    var customCSS = null;
    var bgImage = '';
    var bgOpacity = 0.3;
    var CONFIG_bgSize = 'cover';
    var CONFIG_bgPos = 'center';
    var themeBg = '';
    var themeFg = '';
    var styleScanTimer = null;
    var domObserver = null;
    var scanCount = 0;
    var btnVisible = true;
    var hideTimer = null;
    var hoverTimeout = null;
    var clickCount = 0;
    var clickTimer = null;
    var hasApplied = false;

    // 加载保存的设置
    try {
        var saved = JSON.parse(GM_getValue('rh-settings', '{}'));
        if (saved.themeIndex !== undefined) currentIndex = saved.themeIndex;
        if (saved.bgImage !== undefined) bgImage = saved.bgImage;
        if (saved.bgOpacity !== undefined) bgOpacity = saved.bgOpacity;
        if (saved.bgSize !== undefined) CONFIG_bgSize = saved.bgSize;
        if (saved.bgPos !== undefined) CONFIG_bgPos = saved.bgPos;
        if (saved.hasApplied !== undefined) hasApplied = saved.hasApplied;
        // 防止精简主题后旧索引越界
        if (typeof currentIndex !== 'number' || currentIndex < 0 || currentIndex >= themeKeys.length) currentIndex = 0;
    } catch(e) {}

    function saveSettings() {
        try {
            GM_setValue('rh-settings', JSON.stringify({
                themeIndex: currentIndex,
                bgImage: bgImage,
                bgOpacity: bgOpacity,
                bgSize: CONFIG_bgSize,
                bgPos: CONFIG_bgPos,
                hasApplied: hasApplied
            }));
        } catch(e) {}
    }

    var btnHost, btnShadow, sidebar, btn, gear;
    var showButtons, hideButtons, scheduleHide;

    function whenBodyReady(fn) {
        if (document.body) {
            fn();
        } else {
            var timer = setInterval(function() {
                if (document.body) {
                    clearInterval(timer);
                    fn();
                }
            }, 10);
        }
    }

    function injectStyle(styleEl) {
        if (document.head) {
            document.head.appendChild(styleEl);
        } else if (document.documentElement) {
            document.documentElement.appendChild(styleEl);
        } else {
            var timer = setInterval(function() {
                if (document.head) {
                    clearInterval(timer);
                    document.head.appendChild(styleEl);
                }
            }, 10);
        }
    }

    function initButtons() {
        if (isIframe || btnHost) return;
        // 所有按钮放入 Shadow DOM，防止广告脚本克隆
        // host元素不设position:fixed，避免被广告脚本检测到
        btnHost = document.createElement('div');
        btnHost.id = 'rh-host';
        btnHost.setAttribute('data-rh-ignore', '1');
        btnHost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(btnHost);

        btnShadow = btnHost.attachShadow({mode: 'closed'});
        var btnStyle = document.createElement('style');
        btnStyle.textContent = ':host{display:block;width:0;height:0;overflow:visible;pointer-events:none;}';
        btnShadow.appendChild(btnStyle);

        // 侧边栏切换条
        sidebar = document.createElement('div');
        sidebar.id = 'rh-sidebar';
        sidebar.style.cssText = 'position:fixed!important;bottom:50px!important;left:0!important;width:13px;height:52px;background:rgba(0,0,0,0.2);border-radius:0 4px 4px 0;cursor:pointer;z-index:2147483647!important;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;backdrop-filter:blur(2px);overflow:visible;pointer-events:auto;';
        sidebar.innerHTML = '<span style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:bold;writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:1px;">Rh</span>';
        btnShadow.appendChild(sidebar);

        btn = document.createElement('div');
        btn.id = 'rh-btn';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', 'ReadHelper - Switch theme');
        btn.style.cssText = 'position:fixed!important;bottom:50px!important;left:20px!important;width:50px;height:50px;border-radius:50%;cursor:pointer;z-index:2147483647!important;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:all 0.3s ease;user-select:none;-webkit-user-select:none;pointer-events:auto;';
        btn.innerHTML = themes[themeKeys[currentIndex]].icon;
        btnShadow.appendChild(btn);

        gear = document.createElement('div');
        gear.id = 'rh-gear';
        gear.setAttribute('role', 'button');
        gear.setAttribute('aria-label', 'ReadHelper - Settings');
        gear.innerHTML = '\u2699\ufe0f';
        gear.style.cssText = 'position:fixed!important;bottom:55px!important;left:80px!important;width:40px;height:40px;border-radius:50%;cursor:pointer;z-index:2147483647!important;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.5);transition:all 0.3s ease;opacity:0.7;user-select:none;-webkit-user-select:none;pointer-events:auto;';
        btnShadow.appendChild(gear);

        // 安全网：定期检测并移除广告克隆的 host，只保留当前实例
        function removeClones() {
            var hosts = document.querySelectorAll('#rh-host');
            hosts.forEach(function(el) {
                if (el !== btnHost) el.remove();
            });
        }
        setInterval(removeClones, 2000);

        sidebar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!btnVisible) {
                showButtons();
            } else {
                hideButtons();
            }
        });

        sidebar.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,0,0,0.35)';
        });

        sidebar.addEventListener('mouseleave', function() {
            if (btnVisible) {
                this.style.background = 'rgba(0,0,0,0.2)';
            }
        });

        hideButtons = function() {
            if (!btnVisible) return;
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
            btn.style.transform = 'translateX(-60px) scale(0.8)';
            gear.style.opacity = '0';
            gear.style.pointerEvents = 'none';
            gear.style.transform = 'translateX(-60px) scale(0.8)';
            btnVisible = false;
            sidebar.style.background = 'rgba(0,0,0,0.4)';
        };

        showButtons = function() {
            if (btnVisible) return;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.style.transform = 'translateX(0) scale(1)';
            gear.style.opacity = '0.7';
            gear.style.pointerEvents = 'auto';
            gear.style.transform = 'translateX(0) scale(1)';
            btnVisible = true;
            sidebar.style.background = 'rgba(0,0,0,0.2)';
            clearTimeout(hideTimer);
        };

        scheduleHide = function() {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(hideButtons, 5000);
        };

        btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        switchTheme();
        return false;
    }, true);

    btn.addEventListener('mouseenter', function() {
        if (btnVisible) this.style.transform = 'scale(1.1)';
        clearTimeout(hideTimer);
    });

        btn.addEventListener('mouseleave', function() {
            if (btnVisible) this.style.transform = 'scale(1)';
            scheduleHide();
        });

        gear.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSettings();
        return false;
    }, true);

    gear.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
            this.style.transform = 'rotate(90deg) scale(1.1)';
            clearTimeout(hideTimer);
        });

        gear.addEventListener('mouseleave', function() {
            this.style.opacity = '0.7';
            this.style.transform = 'rotate(0deg) scale(1)';
            scheduleHide();
        });

        document.addEventListener('mousemove', function() {
            scheduleHide();
        });

        window.addEventListener('scroll', function() {
            scheduleHide();
        });
    } // end initButtons

    whenBodyReady(initButtons);

    function applyTheme(idx, noNotify) {
        if (typeof idx !== 'number' || idx < 0 || idx >= themeKeys.length) idx = 0;
        currentIndex = idx;
        var t = themes[themeKeys[idx]];
        if (!t) return;

        // 原始配色 - 清除自定义样式
        if (t.bg === 'transparent') {
            removeCSS();
            isActive = false;
            hasApplied = false;
            if (!noNotify) notify(t.icon + ' 已恢复原始主题');
            saveSettings();
            return;
        }
        
        isActive = true;
        removeCSS();
        addCSS(t);

        // 清除旧主题留下的 JS 覆盖标记并立即重新扫描，避免切换后部分区块仍保留旧色
        whenBodyReady(function() {
            var marked = document.querySelectorAll('[data-rh-themed]');
            for (var i = 0; i < marked.length; i++) marked[i].removeAttribute('data-rh-themed');
            forceContainerStyles();
        });

        // 按钮保持透明，只显示图标（仅主框架）
        if (btn) {
            btn.style.background = 'transparent';
            btn.style.color = t.fg;
            btn.style.borderColor = t.accent;
            btn.style.fontWeight = 'bold';
            btn.innerHTML = t.icon;
        }

        if (gear) {
            gear.style.background = 'transparent';
            gear.style.borderColor = t.accent;
            gear.style.color = t.accent;
        }

        hasApplied = true;
        if (!noNotify) notify(t.icon + ' ' + t.name);
        saveSettings();
    }

    function addCSS(t) {
        customCSS = document.createElement('style');
        customCSS.id = 'rh-css';
        themeBg = t.bg;
        themeFg = t.fg;
        var bg = t.bg;
        var fg = t.fg;
        var ac = t.accent;
        var bg2 = t.bg2 ? t.bg2 : adjustBg(bg, 10);
        var bg3 = t.bg3 ? t.bg3 : adjustBg(bg, -15);
        var bgDim = t.hover ? t.hover : adjustBg(bg, -8);
        var fg2 = adjustBg(fg, 20);
        var borderColor = t.border ? t.border : (isDarkBg(bg) ? adjustBg(bg, 20) : adjustBg(bg, -20));
        var secondaryFg = t.secondary ? t.secondary : (isDarkBg(bg) ? adjustBg(fg, 40) : adjustBg(fg, -30));
        var successColor = t.success ? t.success : (isDarkBg(bg) ? '#63A883' : '#368B5E');
        var warningColor = t.warning ? t.warning : (isDarkBg(bg) ? '#E09F5C' : '#D48A3E');
        var dangerColor = t.danger ? t.danger : (isDarkBg(bg) ? '#DD6464' : '#C84A4A');
        var selectBg = t.select ? t.select : (isDarkBg(bg) ? adjustBg(bg, 18) : adjustBg(bg, -12));
        var selectFg = fg;
        // 浅色主题下把主按钮强调色适当加深，避免高亮刺眼
        var primaryBtnBg = isDarkBg(bg) ? ac : adjustBg(ac, -30);
        var css =
            // 基础
            'html,body{background:' + bg + '!important;color:' + fg + '!important}' +
            // 兜底：避免任何元素残留深色文字在深色背景上（后续更具体的选择器会覆盖它）
            'body *{color:' + fg + '!important}' +
            // 隐藏常见浮动广告
            '.sinaads-float,.sinaad-toolkit-box,.sinaads,[id^="sinaadToolkitBox"],[class*="ad-carousel"],[id^="ad_"],[id*="-ad-"],[id*="_ad_"],.adsbygoogle,.ad-box,.ad-wrapper,.ad-container,.ad-inner,.ad-outer,.float-ad,.fixed-ad,.sticky-ad,[class*="advert"],[class*="ad-banner"],[class*="ads-banner"],[class*="ad-swiper"],[class*="ad-carousel"],[class*="sponsored"],[class*="promotion"]{display:none!important}' +
            'a{color:' + ac + '!important}' +
            'a *{color:' + ac + '!important}' +
            'button *,[role="button"] *{color:inherit!important}' +
            'hr{border-color:' + ac + '!important;background:' + ac + '!important}' +
            'img,video,canvas{background-color:transparent!important}' +
            // 滚动条
            '::-webkit-scrollbar{width:8px!important;height:8px!important;background:' + bgDim + '!important}' +
            '::-webkit-scrollbar-track{background:' + bgDim + '!important}' +
            '::-webkit-scrollbar-thumb{background:' + ac + '!important;border-radius:4px!important}' +
            '::-webkit-scrollbar-button{background:' + bgDim + '!important}' +
            // 选中文字
            '::selection{background:' + ac + '!important;color:' + bg + '!important}' +
            '::-moz-selection{background:' + ac + '!important;color:' + bg + '!important}' +
            // 表格行选中/悬停高亮 - 强制覆盖边框和阴影
            'tr:hover td{background:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            'tr:hover>td{background:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            // 表格行选中态使用更明显的主题色，确保深色/浅色行都可见
            'tr.current-row>td,tr.current-row>td *,tr.current-row>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            'tr.selected>td,tr.selected>td *,tr.selected>th,tr.active>td,tr.active>td *,tr.active>th,tr.highlight>td,tr.highlight>td *,tr.highlight>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            'td.selected,td.active,td.highlight,th.selected,th.active,th.highlight{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            'tr[aria-selected="true"]>td,tr[aria-selected="true"]>td *,tr[aria-selected="true"]>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '.el-table__body tr.current-row>td,.el-table__body tr.current-row>td *,.el-table__body tr.current-row>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '.el-table__body tr.hover-row>td,.el-table__body tr.hover-row>td *,.el-table__body tr.hover-row>th{background:' + bgDim + '!important;background-color:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            '.ant-table-tbody tr.ant-table-row-selected>td,.ant-table-tbody tr.ant-table-row-selected>td *,.ant-table-tbody tr.ant-table-row-selected>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '.ant-table-tbody tr:hover>td,.ant-table-tbody tr:hover>td *{background:' + bgDim + '!important;background-color:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            '.ivu-table-row-highlight td,.ivu-table-row-highlight td *,.ivu-table-row-highlight th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '[class*="row-selected"]>td,[class*="row-selected"]>td *,[class*="row-selected"]>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '[class*="row-hover"]>td,[class*="row-hover"]>td *,[class*="row-hover"]>th{background:' + bgDim + '!important;background-color:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            '[class*="is-current"]>td,[class*="is-current"]>td *,[class*="is-current"]>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            '[class*="selected"]>td,[class*="selected"]>td *,[class*="selected"]>th,[class*="active"]>td,[class*="active"]>td *,[class*="active"]>th,[class*="highlight"]>td,[class*="highlight"]>td *,[class*="highlight"]>th{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;outline:none!important;box-shadow:none!important}' +
            // 强制覆盖选中行 tr 本身及伪元素的边框/阴影/过渡，避免蓝色边框和切换时闪回原色
            'tr.selected,tr.active,tr.highlight,tr.current-row,tr[aria-selected="true"],.ant-table-row-selected,.ivu-table-row-highlight,[class*="row-selected"],[class*="is-current"]{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important;border-color:' + selectBg + '!important;outline:none!important;box-shadow:none!important;transition:none!important}' +
            'tr.selected td,tr.selected td::before,tr.selected td::after,tr.active td,tr.active td::before,tr.active td::after,tr.highlight td,tr.highlight td::before,tr.highlight td::after,tr.current-row td,tr.current-row td::before,tr.current-row td::after,tr[aria-selected="true"] td,tr[aria-selected="true"] td::before,tr[aria-selected="true"] td::after,.ant-table-row-selected td,.ant-table-row-selected td::before,.ant-table-row-selected td::after,.ivu-table-row-highlight td,.ivu-table-row-highlight td::before,.ivu-table-row-highlight td::after,[class*="row-selected"]>td,[class*="row-selected"]>td::before,[class*="row-selected"]>td::after,[class*="is-current"]>td,[class*="is-current"]>td::before,[class*="is-current"]>td::after{border-color:' + selectBg + '!important;outline:none!important;box-shadow:none!important;transition:none!important}' +
            // 表格 - 显式覆盖四条边框色，避免 shorthand 被长属性覆盖
            'table,th,td{border-color:' + borderColor + '!important;border-top-color:' + borderColor + '!important;border-right-color:' + borderColor + '!important;border-bottom-color:' + borderColor + '!important;border-left-color:' + borderColor + '!important}' +
            'th{background:' + bg2 + '!important;color:' + fg + '!important}' +
            'td{background:' + bg + '!important;color:' + fg + '!important}' +
            // Ant Design 表格 - 高优先级
            '.ant-table,.ant-table-wrapper,.ant-table-container{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ant-table-thead>tr>th,.ant-table-thead>tr>td{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important;border-top-color:' + borderColor + '!important;border-bottom-color:' + borderColor + '!important}' +
            '.ant-table-tbody>tr>th,.ant-table-tbody>tr>td{background:' + bg + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important;border-top-color:' + borderColor + '!important;border-bottom-color:' + borderColor + '!important}' +
            '.ant-table-cell{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ant-table-thead .ant-table-cell{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.ant-table-column-sorter{color:' + fg + '!important}' +
            '.ant-table-filter-trigger{color:' + fg + '!important}' +
            '.ant-table-body,.ant-table-body-inner{background:' + bg + '!important;color:' + fg + '!important}' +
            // 表格加载遮罩：翻页时的半透明白色覆盖层改为跟随主题背景
            '.ant-spin-container::after,.ant-spin-blur::after,.ant-table-loading,.ant-table-loading .ant-table-cell,.ant-table-loading .ant-table-row{background:' + bg + '!important;opacity:0.45!important}' +
            '.ant-spin-dot-item{background:' + ac + '!important}' +
            '.el-loading-mask,.el-loading-spinner .path{background:' + bg + '!important;opacity:0.6!important}' +
            '.ivu-spin-fix,.ivu-spin-main{background:' + bg + '!important;opacity:0.6!important}' +
            '.loading-mask,.loading-overlay,.table-loading,[class*="loading-mask"],[class*="loading-overlay"],[class*="table-loading"]{background:' + bg + '!important;opacity:0.5!important}' +
            // 广告容器：通过常见类名/属性隐藏，减少页面干扰
            '[data-adid],[ad-category="homepage"],[ad-location][ad-position],[class*="mod_js_ad"],[class^="ad_"],[class*=" ad_"],[class^="tl_ad_"],[class*=" tl_ad_"],[class*="sponsored"],[class*="promotion"]{display:none!important}' +
            // 布局容器
            '.ant-layout,.ant-layout-content,.ant-layout-sider{background:' + bg + '!important;color:' + fg + '!important}' +
            // 通用容器兜底（div 常见类名 / BEM 后缀/前缀，避免误伤行内元素）
            'div.top,div.header,div.footer,div.main,div.content,div.page,div.section,div.container,div.wrapper,div.wrap,div.box,div.card,div.panel,div.layout,div.area,div.block,div.inner,div.outer,div.scroll,div.sidebar,div.sidebar-login-status,div.login-status,div.user-panel,div.user-info,div.profile,div.account,div.menu,div.nav,div.navbar,div.navigation,div.borderFixedTop,div.page-wrapper,div.fit,' +
            'div[class$="-con"],div[class$="-container"],div[class$="-wrap"],div[class$="-wrapper"],div[class$="-box"],div[class$="-page"],div[class$="-content"],div[class$="-main"],div[class$="-layout"],div[class$="-panel"],div[class$="-card"],div[class$="-scroll"],div[class$="-area"],div[class$="-block"],div[class$="-inner"],div[class$="-outer"],div[class$="-section"],div[class$="-header"],div[class$="-footer"],' +
            'div[class*="-con-"],div[class*="-container-"],div[class*="-wrap-"],div[class*="-wrapper-"],div[class*="-box-"],div[class*="-page-"],div[class*="-content-"],div[class*="-main-"],div[class*="-layout-"],div[class*="-panel-"],div[class*="-card-"],div[class*="-scroll-"],div[class*="-area-"],div[class*="-block-"],div[class*="-inner-"],div[class*="-outer-"],div[class*="-section-"],div[class*="-header-"],div[class*="-footer-"],' +
            'div[class*="-con "],div[class*="-container "],div[class*="-wrap "],div[class*="-wrapper "],div[class*="-box "],div[class*="-page "],div[class*="-content "],div[class*="-main "],div[class*="-layout "],div[class*="-panel "],div[class*="-card "],div[class*="-scroll "],div[class*="-area "],div[class*="-block "],div[class*="-inner "],div[class*="-outer "],div[class*="-section "],div[class*="-header "],div[class*="-footer "]' +
            '{background:' + bg + '!important;color:' + fg + '!important}' +
            // iView 组件样式补全：确保 collapse/form/table 等内部区域正常应用主题色
            '.ivu-collapse,.ivu-collapse-item,.ivu-collapse-content,.ivu-collapse-content-box,.ivu-row,.ivu-col,.ivu-form,.ivu-form-item,.ivu-table,.ivu-table-wrapper,.ivu-table-header,.ivu-table-body,.ivu-table-cell{background:' + bg + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ivu-collapse-header,.ivu-collapse-header *{color:' + fg + '!important}' +
            // 全屏布局容器：保持透明不填色
            'div.single-page-con{background:transparent!important}' +
            // canvas 表格：容器填充主题色，canvas 用混合模式与背景融合
            // 深色主题：invert(1) 反转后 screen 混合 → 黑背景变主题色、白文字保持浅色可读
            // 浅色主题：multiply 混合 → 白背景变主题色、黑文字保持深色可读
            'div.jm-sheet-sheet{background:' + bg + '!important;color:' + fg + '!important;border:1px solid ' + borderColor + '!important;overflow:hidden}' +
            (isDarkBg(bg)
                ? 'div.jm-sheet-sheet canvas{display:block;filter:invert(1);mix-blend-mode:screen}'
                : 'div.jm-sheet-sheet canvas{display:block;mix-blend-mode:multiply}') +
            // overlayer 及其所有后代：透明背景 + 主题文字色，让 canvas 混合背景透出
            'div.jm-sheet-overlayer,div.jm-sheet-overlayer *{background:transparent!important;color:' + fg + '!important}' +
            // overlayer 内的菜单/弹出层：恢复不透明背景（CSS 特异性高于上面的 * 规则）
            'div.jm-sheet-overlayer [class*="menu"],div.jm-sheet-overlayer [class*="Menu"],div.jm-sheet-overlayer [class*="dropdown"],div.jm-sheet-overlayer [class*="Dropdown"],div.jm-sheet-overlayer [class*="popup"],div.jm-sheet-overlayer [class*="Popup"],div.jm-sheet-overlayer [class*="context"],div.jm-sheet-overlayer [class*="Context"]{background:' + bg2 + '!important;color:' + fg + '!important;border:1px solid ' + borderColor + '!important;box-shadow:0 2px 8px rgba(0,0,0,0.3)!important}' +
            // jm-sheet 内 hover 白框修复：强制 hover 背景、清除白色 outline/box-shadow/text-shadow
            'div[class*="jm-sheet"] *:hover,div[class*="jm-sheet"] *:focus,div[class*="jm-sheet"] *:active,div[class*="jm-sheet"] *:focus-visible{background-color:transparent!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important;text-shadow:none!important;border-color:' + borderColor + '!important}' +
            'div[class*="jm-sheet"] *::before,div[class*="jm-sheet"] *::after,div[class*="jm-sheet"] *:hover::before,div[class*="jm-sheet"] *:hover::after{outline:none!important;box-shadow:none!important;text-shadow:none!important;border-color:' + borderColor + '!important;background-color:transparent!important}' +
            // jm-sheet 工具栏按钮容器（ty-bar-btn 等）hover 不额外发光
            'div[class*="jm-sheet"] .ty-bar-btn,div[class*="jm-sheet"] .ty-bar-btn>div,div[class*="jm-sheet"] .ty-bar-btn>div:hover,div[class*="jm-sheet"] .ty-bar-btn:hover{background-color:transparent!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important;text-shadow:none!important;border-color:' + borderColor + '!important}' +
            // jm-sheet 内按钮 hover
            'div[class*="jm-sheet"] button,div[class*="jm-sheet"] [role="button"],div[class*="jm-sheet"] .btn,div[class*="jm-sheet"] button *,div[class*="jm-sheet"] [role="button"] *,div[class*="jm-sheet"] .btn *{background-color:transparent!important;color:' + fg + '!important;border-color:' + borderColor + '!important;outline:none!important;box-shadow:none!important;text-shadow:none!important}' +
            'div[class*="jm-sheet"] button:hover,div[class*="jm-sheet"] [role="button"]:hover,div[class*="jm-sheet"] .btn:hover{background:' + bgDim + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important;outline:none!important;box-shadow:none!important;text-shadow:none!important}' +
            // 覆盖常见容器伪元素，避免子层/遮罩层透出原站白色背景
            '.borderFixedTop::before,.borderFixedTop::after,.header::before,.header::after,.page-wrapper::before,.page-wrapper::after,.ant-card::before,.ant-card::after,.ant-card-head::before,.ant-card-head::after,.ant-card-body::before,.ant-card-body::after{background:' + bg + '!important;background-color:' + bg + '!important}' +
            // fixed / sticky 顶栏/底栏兜底
            'div[class*="fixed"],div[class*="Fixed"],div[class*="sticky"],div[class*="Sticky"],div[class*="affix"],div[class*="Affix"]{background:' + bg + '!important;color:' + fg + '!important}' +
            // 辅助/次要文字
            '[class*="secondary"],[class*="sub"],[class*="muted"],[class*="desc"],[class*="tips"],[class*="hint"],[class*="placeholder"],small,.small{color:' + secondaryFg + '!important}' +
            // 成功/警告/危险状态色（标签、按钮、文字、边框）
            // 注：不再使用 [class*="success"] 等通配，避免误伤 Ant Design 表单校验态
            '.el-tag--success,.ant-tag-success,.ivu-tag-success,.btn-success,.button-success,.badge-success,.label-success,.alert-success,.message-success,.notification-success,.result-success,.status-success,.status-ok{background:' + successColor + '!important;color:' + bg + '!important;border-color:' + successColor + '!important}' +
            '.el-tag--warning,.ant-tag-warning,.ivu-tag-warning,.btn-warning,.button-warning,.badge-warning,.label-warning,.alert-warning,.message-warning,.notification-warning,.result-warning,.status-warning,.status-warn{background:' + warningColor + '!important;color:' + bg + '!important;border-color:' + warningColor + '!important}' +
            '.el-tag--danger,.el-tag--error,.ant-tag-error,.ant-tag-red,.ivu-tag-error,.btn-danger,.button-danger,.btn-error,.button-error,.badge-danger,.badge-error,.label-danger,.label-error,.alert-danger,.alert-error,.message-danger,.message-error,.notification-danger,.notification-error,.result-error,.status-error,.status-err,.status-danger{background:' + dangerColor + '!important;color:' + bg + '!important;border-color:' + dangerColor + '!important}' +
            '[class*="text-success"],.text-success{color:' + successColor + '!important}' +
            '[class*="text-warning"],.text-warning{color:' + warningColor + '!important}' +
            '[class*="text-danger"],.text-danger,[class*="text-error"],.text-error{color:' + dangerColor + '!important}' +
            // 新闻/列表底部渐变遮罩
            '.white_hover,[class*="white_hover"],[class*="fade-mask"],[class*="gradient-mask"],[class*="bottom-mask"]{background-color:transparent!important;background-image:linear-gradient(to top,' + bg + ',transparent)!important;color:' + fg + '!important}' +
            '.white_hover::before,.white_hover::after,[class*="white_hover"]::before,[class*="white_hover"]::after,[class*="fade-mask"]::before,[class*="fade-mask"]::after,[class*="gradient-mask"]::before,[class*="gradient-mask"]::after,[class*="bottom-mask"]::before,[class*="bottom-mask"]::after{background-color:transparent!important;background-image:linear-gradient(to top,' + bg + ',transparent)!important}' +
            '[class*="top-mask"],[class*="top-mask"]::before,[class*="top-mask"]::after{background-color:transparent!important;background-image:linear-gradient(to bottom,' + bg + ',transparent)!important}' +
            // Element UI 表格
            '.el-table th,.el-table td{border-color:' + borderColor + '!important}' +
            '.el-table tr{background:' + bg + '!important}' +
            '.el-table th.el-table__cell{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.el-table .el-table__body tr:hover>td{background:' + bgDim + '!important}' +
            '.el-table .el-table__body tr.current-row>td{background:' + bgDim + '!important}' +
            // 表格边框统一
            'table[border],table[border] td,table[border] th{border-color:' + borderColor + '!important}' +
            // 输入控件
            'input,textarea,select,[role="textbox"],[role="combobox"],[role="spinbutton"]{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            'input::placeholder,textarea::placeholder{color:' + fg2 + '!important;opacity:0.6}' +
            // 按钮
            'button,.btn,.el-button,.ant-btn{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + adjustBg(ac, 15) + '!important}' +
            'button:hover,.btn:hover,.el-button:hover,.ant-btn:hover{background:' + bgDim + '!important;color:' + fg + '!important;outline:none!important;box-shadow:none!important}' +
            'button:active,.btn:active,.el-button:active,.ant-btn:active{background:' + bg3 + '!important;color:' + fg + '!important}' +
            '.ant-btn-default{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + adjustBg(ac, 15) + '!important}' +
            '.ant-btn-default:hover{background:' + bgDim + '!important;color:' + fg + '!important;border-color:' + adjustBg(ac, 15) + '!important}' +
            '.ant-btn-primary,.el-button--primary,.ivu-btn-primary{background:' + primaryBtnBg + '!important;color:' + bg + '!important;border-color:' + primaryBtnBg + '!important}' +
            '.ant-btn-primary:hover,.el-button--primary:hover,.ivu-btn-primary:hover{filter:brightness(0.85)!important}' +
            // 卡片/面板/盒子 - 只保留具体框架选择器，避免通配类名破坏布局
            '.ant-card,.ant-card-body,.ant-card-small,.ant-card-bordered{background:' + bg + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ant-card-head,.ant-card-extra{color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.el-card,.el-card__header,.el-card__body{background:' + bg + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 行内白色背景兜底（rgb / rgba / hex / white）
            '[style*="background-color: rgb(255"],[style*="background-color: rgba(255"]{background-color:' + bg + '!important}' +
            '[style*="background: rgb(255"],[style*="background: rgba(255"]{background:' + bg + '!important}' +
            '[style*="background:#fff"],[style*="background:#FFF"],[style*="background:#ffffff"],[style*="background:#FFFFFF"]{background:' + bg + '!important}' +
            '[style*="background: white"]{background:' + bg + '!important}' +
            '[style*="background-color:#fff"],[style*="background-color:#FFF"],[style*="background-color:#ffffff"],[style*="background-color:#FFFFFF"]{background-color:' + bg + '!important}' +
            '[style*="background-color: #fff"],[style*="background-color: #FFF"],[style*="background-color: #ffffff"],[style*="background-color: #FFFFFF"]{background-color:' + bg + '!important}' +
            '[style*="background-color: white"]{background-color:' + bg + '!important}' +
            // 兜底：常见白底白字/黑底黑字等不可读组合
            '[style*="background-color: rgb(255"][style*="color: rgb(255"], [style*="background:#fff"][style*="color:#fff"], [style*="background:#ffffff"][style*="color:#ffffff"]{background:' + bg + '!important;color:' + fg + '!important}' +
            '[style*="background-color: rgb(0"][style*="color: rgb(0"], [style*="background:#000"][style*="color:#000"], [style*="background:#000000"][style*="color:#000000"]{background:' + bg + '!important;color:' + fg + '!important}' +
            // 分页 - 高优先级覆盖Ant Design
            '.ant-pagination-item,.ant-pagination-item a{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ant-pagination-item a{color:' + fg + '!important}' +
            '.ant-pagination-item-active,.ant-pagination-item-active a{background:' + ac + '!important;color:' + bg + '!important;border-color:' + ac + '!important}' +
            '.ant-pagination-prev,.ant-pagination-next,.ant-pagination-prev button,.ant-pagination-next button{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ant-pagination-prev button:disabled,.ant-pagination-next button:disabled{background:' + bg2 + '!important;color:' + fg2 + '!important;opacity:0.5}' +
            '.ant-pagination-jump-prev,.ant-pagination-jump-next{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.ant-pagination-options .ant-select-selector{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.el-pagination button,.el-pager li{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.el-pager li.is-active{background:' + ac + '!important;color:' + bg + '!important}' +
            '.el-pagination .el-input__inner{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.ant-pagination-options-size-changer .ant-select-selector{background:' + bg2 + '!important;color:' + fg + '!important}' +
            // layui 分页
            '.layui-laypage .layui-laypage-curr .layui-laypage-em{background:' + ac + '!important}' +
            '.layui-laypage a,.layui-laypage span{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.layui-laypage .layui-laypage-curr em{color:#ffffff!important}' +
            '.layui-laypage input,.layui-laypage button{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 标签页
            '.el-tabs__item,.el-tabs__nav,.el-tabs__nav-scroll,.el-tabs__header,.ant-tabs-tab,.ant-tabs-nav,.ant-tabs-nav-wrap,.ant-tabs-nav-list,.ant-tabs-content,.ant-tabs-tabpane,.el-tabs__content{color:' + fg + '!important;background:' + bg + '!important}' +
            '.el-tabs__item.is-active,.ant-tabs-tab-active{color:' + ac + '!important}' +
            '.ant-tabs-ink-bar{background:' + ac + '!important}' +
            '.el-tabs__active-bar{background:' + ac + '!important}' +
            '.ant-tabs-nav::before{border-color:' + borderColor + '!important}' +
            '.el-tabs__nav-wrap::after{background:' + borderColor + '!important}' +
            // layui 标签页
            '.layui-tab-title li{color:' + fg + '!important;background:' + bg + '!important}' +
            '.layui-tab-title li.layui-this,.layui-tab-item.layui-show{color:#ffffff!important;background:' + ac + '!important}' +
            // iView / 通用 tab
            '.ivu-tabs,.ivu-tabs-bar,.ivu-tabs-nav-container,.ivu-tabs-nav-wrap{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ivu-tabs-tab{color:' + fg + '!important;background:' + bg + '!important}' +
            '.ivu-tabs-tab-active,.ivu-tabs-tab:hover{color:' + ac + '!important}' +
            '.ivu-tabs-ink-bar{background:' + ac + '!important}' +
            '.tags-inner-scroll-body,.tags-outer-scroll-con{background:' + bg + '!important;color:' + fg + '!important}' +
            '.tab-label,.tab-item,.nav-tabs,.nav-item,.nav-link,.tab-pane,.tab-panel,[class*="tab-label"],[class*="tab-item"],[class*="tabs__item"],[class*="tabs__nav"],[class*="tab__item"],[class*="tab-pane"],[class*="tab-panel"],[class*="tab-content"],[class*="tabs-content"]{background:' + bg + '!important;color:' + fg + '!important}' +
            '.nav-item.active,.nav-link.active,[class*="tab-item"][class*="active"],[class*="tabs__item"][class*="active"]{color:' + ac + '!important}' +
            // 新闻/文章列表
            '.news-list,.article-list,.item-list,.list-item,.news-item,.article-item,.item-card,.media-list,li.item,li.news,li.article,[class*="news-list"],[class*="article-list"],[class*="item-list"],[class*="list-item"],[class*="news-item"],[class*="article-item"],[class*="item-card"],[class*="media-list"]{background:' + bg + '!important;color:' + fg + '!important}' +
            '.news-list li:hover,.article-list li:hover,.item-list li:hover,.news-item:hover,.article-item:hover,.item-card:hover,[class*="news-list"] [class*="item"]:hover,[class*="article-list"] [class*="item"]:hover,[class*="item-list"] [class*="item"]:hover,[class*="item-card"]:hover{background:' + bgDim + '!important;color:' + fg + '!important}' +
            // 标签/徽章
            '.el-tag,.el-tag--dark,.ant-tag,.ivu-tag,.ivu-tag-default,.ivu-tag-checked,.badge{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 弹窗/对话框/抽屉/浮层：只强制文字和边框，背景交给 processElement 处理，避免把半透明/毛玻璃弹窗填实
            '.el-dialog,.el-dialog__header,.el-dialog__body,.el-dialog__footer,.ant-modal,.ant-modal-content,.ant-modal-header,.ant-modal-body,.ant-modal-footer,.ant-drawer,.ant-drawer-content,.ant-drawer-header,.ant-drawer-body,.ant-drawer-footer,.el-drawer,.el-drawer__header,.el-drawer__body,.ivu-drawer,.ivu-drawer-content{color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ant-popover,.ant-popover-content,.ant-popover-inner,.ant-popover-inner-content,.ant-popover-title,.ant-popover-message,.ant-popover-buttons,.ant-popconfirm,.el-popover,.el-popover__title,.ivu-poptip,.ivu-poptip-content,.ivu-poptip-title{color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ant-tour,.ant-tour-content,.ant-tour-inner,.ant-tour-title,.ant-tour-description,.ant-tour-close,.ant-tour-buttons,.ant-tour-arrow{color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 遮罩层保持半透明，不要填充主题色
            '.ant-modal-mask,.ant-drawer-mask,.ant-image-preview-mask,.ant-picker-dropdown,.el-dialog__wrapper,.ivu-modal-mask{background:rgba(0,0,0,0.45)!important}' +
            // 消息/通知/Toast
            '.ant-message-notice-content,.ant-notification-notice,.ant-notification-notice-message,.ant-notification-notice-description,.el-message,.el-message__content,.el-notification,.el-notification__title,.el-notification__content,.ivu-message-notice-content,.ivu-notice-notice,.toast,.toast-body,.snackbar,.snackbar__content,[class*="toast"],[class*="snackbar"]{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 下拉菜单
            '.el-dropdown-menu,.el-dropdown-menu__item,.ant-dropdown,.ant-dropdown-menu,.ant-dropdown-menu-item,.ant-dropdown-menu-submenu-title{background:' + bg + '!important;color:' + fg + '!important}' +
            '.el-dropdown-menu__item:hover,.ant-dropdown-menu-item:hover,.ant-dropdown-menu-submenu-title:hover{background:' + bgDim + '!important;color:' + fg + '!important}' +
            // 下拉选择框高亮项（Ant Design / Element / iView / 通用）
            '.ant-select-dropdown-menu-item-active,.ant-select-dropdown-menu-item-selected,.ant-select-dropdown-menu-item:hover,.ant-select-dropdown-menu-item-active:hover,.ant-select-dropdown-menu-item-selected:hover{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important}' +
            '.el-select-dropdown__item.hover,.el-select-dropdown__item.selected,.el-select-dropdown__item:hover{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important}' +
            '.ivu-select-item-focus,.ivu-select-item-selected,.ivu-select-item:hover,.ivu-select-dropdown-list .ivu-select-item:hover{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important}' +
            '[class*="dropdown"] [class*="item"]:hover,[class*="dropdown"] [class*="item"][class*="active"],[class*="dropdown"] [class*="item"][class*="selected"],[class*="select"] [class*="option"]:hover,[class*="select"] [class*="option"][class*="active"],[class*="select"] [class*="option"][class*="selected"]{background:' + selectBg + '!important;background-color:' + selectBg + '!important;color:' + selectFg + '!important}' +
            // 进度条
            '.el-progress,.el-progress-bar__outer,.ant-progress,.ant-progress-bg,.ant-progress-inner,.ant-progress-success-bg,.ant-progress-circle-trail{background:' + bg2 + '!important}' +
            '.ant-progress-text{color:' + fg + '!important}' +
            // 表单
            '.el-form-item__label,.ant-form-item-label,.ant-form-item,.el-form-item{color:' + fg + '!important}' +
            '.el-form-item__content,.ant-form-item-control{color:' + fg + '!important}' +
            // Ant Design 表单校验态 - 只保留提示色，避免整行被涂成绿/黄/红条
            '.ant-form-item-has-success,.ant-form-item-has-warning,.ant-form-item-has-error,.ant-form-item-is-validating{background:' + bg + '!important}' +
            '.ant-form-item-has-success .ant-form-item-control-input,.ant-form-item-has-success .ant-form-item-control-input-content,.ant-form-item-has-success .ant-form-item-explain,.ant-form-item-has-success .ant-form-item-extra,.ant-form-item-has-success .ant-form-item-help,.ant-form-item-has-success .ant-form-item-info{background:' + bg + '!important;color:' + successColor + '!important;border-color:' + successColor + '!important}' +
            '.ant-form-item-has-warning .ant-form-item-control-input,.ant-form-item-has-warning .ant-form-item-control-input-content,.ant-form-item-has-warning .ant-form-item-explain,.ant-form-item-has-warning .ant-form-item-extra,.ant-form-item-has-warning .ant-form-item-help,.ant-form-item-has-warning .ant-form-item-info{background:' + bg + '!important;color:' + warningColor + '!important;border-color:' + warningColor + '!important}' +
            '.ant-form-item-has-error .ant-form-item-control-input,.ant-form-item-has-error .ant-form-item-control-input-content,.ant-form-item-has-error .ant-form-item-explain,.ant-form-item-has-error .ant-form-item-extra,.ant-form-item-has-error .ant-form-item-help,.ant-form-item-has-error .ant-form-item-info{background:' + bg + '!important;color:' + dangerColor + '!important;border-color:' + dangerColor + '!important}' +
            '.ant-form-item-is-validating .ant-form-item-control-input,.ant-form-item-is-validating .ant-form-item-control-input-content,.ant-form-item-is-validating .ant-form-item-explain,.ant-form-item-is-validating .ant-form-item-extra,.ant-form-item-is-validating .ant-form-item-help,.ant-form-item-is-validating .ant-form-item-info{background:' + bg + '!important;color:' + ac + '!important;border-color:' + ac + '!important}' +
            '.ant-form-item-explain,.ant-form-item-extra,.ant-form-item-help,.ant-form-item-info{background:' + bg + '!important;color:' + secondaryFg + '!important}' +
            // 单选/复选
            '.el-radio-button__inner,.el-checkbox-button__inner,.ant-radio-inner,.ant-checkbox-inner{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // 日期选择器
            '.el-date-editor,.el-date-table td,.el-date-table td span,.ant-picker,.ant-picker-panel,.ant-picker-cell,.ant-picker-cell-inner{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ant-picker-header,.ant-picker-header button,.ant-picker-content th{color:' + fg + '!important}' +
            '.ant-picker-cell:hover .ant-picker-cell-inner,.ant-picker-cell-selected .ant-picker-cell-inner{background:' + bgDim + '!important;color:' + fg + '!important}' +
            '.el-date-table td.today span{color:' + ac + '!important}' +
            '.el-date-table td.current:not(.disabled) span{background:' + ac + '!important;color:' + bg + '!important}' +
            // 通知/消息
            '.el-notification,.el-message,.el-message-box,.ant-notification,.ant-message,.ant-message-notice-content{background:' + bg + '!important;color:' + fg + '!important}' +
            // 滚动条
            '.el-scrollbar__bar{background:' + bgDim + '!important}' +
            '.el-scrollbar__thumb{background:' + ac + '!important}' +
            '.el-scrollbar__bar.is-horizontal{height:6px!important}' +
            '.el-scrollbar__bar.is-vertical{width:6px!important}' +
            // 工具提示
            '.el-tooltip__popper,.el-tooltip__popper .popper__arrow,.ant-tooltip,.ant-tooltip-arrow{background:' + bg3 + '!important;color:' + fg + '!important}' +
            // 版本标签/状态标签等span背景
            '.ant-layout-sider,.ant-layout-sider-dark{background:' + bg3 + '!important}' +
            '.ant-layout-header{background:' + bg + '!important}' +
            // Ant Design 菜单/侧边栏
            '.ant-menu,.ant-menu-dark,.ant-menu-sub{background:' + bg3 + '!important;color:' + fg + '!important}' +
            '.ant-menu-item,.ant-menu-submenu-title{color:' + fg + '!important}' +
            '.ant-menu-item:hover,.ant-menu-submenu-title:hover{background:' + bgDim + '!important;color:' + fg + '!important}' +
            '.ant-menu-item-selected{background:' + ac + '!important;color:' + bg + '!important}' +
            // Element UI 菜单
            '.el-menu,.el-menu-item,.el-submenu__title{background:' + bg3 + '!important;color:' + fg + '!important}' +
            '.el-menu-item:hover,.el-submenu__title:hover,.el-menu-item:focus{background:' + bgDim + '!important;color:' + fg + '!important}' +
            '.el-menu-item.is-active{background:' + ac + '!important;color:' + bg + '!important}' +
            // iView / View UI
            '.ivu-layout,.ivu-layout-content,.ivu-layout-sider{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ivu-menu,.ivu-menu-item,.ivu-menu-submenu-title{background:' + bg3 + '!important;color:' + fg + '!important}' +
            '.ivu-menu-item:hover,.ivu-menu-submenu-title:hover,.ivu-menu-item-active{background:' + bgDim + '!important;color:' + fg + '!important}' +
            '.ivu-menu-item.ivu-menu-item-active{background:' + ac + '!important;color:' + bg + '!important}' +
            '.ivu-table,.ivu-table-cell,.ivu-table-row{background:' + bg + '!important;color:' + fg + '!important}' +
            '.ivu-table th{background:' + bg2 + '!important;color:' + fg + '!important}' +
            '.ivu-card,.ivu-card-head,.ivu-card-body{background:' + bg + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            '.ivu-btn,.ivu-btn-default{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + adjustBg(ac, 15) + '!important}' +
            '.ivu-input,.ivu-select-selection{background:' + bg2 + '!important;color:' + fg + '!important;border-color:' + borderColor + '!important}' +
            // Ant Design 布局
            '.ant-layout{background:' + bg + '!important}' +
            '.ant-layout-sider{background:' + bg3 + '!important}' +
            // 穿透图片/视频
            'img,video,canvas{background-color:transparent!important}' +
            (bgImage ? 'img,video,canvas,svg,image{mix-blend-mode:normal!important;filter:none!important}' : '') +
            (bgImage ? 'body::after{content:"";position:fixed;top:0;left:0;width:100%;height:100%;background:url(\'' + bgImage + '\') ' + (CONFIG_bgPos || 'center') + '/' + (CONFIG_bgSize || 'cover') + ' no-repeat;opacity:' + bgOpacity + ';z-index:-1;pointer-events:none}' : '');
        customCSS.textContent = css;
        injectStyle(customCSS);
        startStyleScan();
    }

    function removeCSS() {
        stopStyleScan();
        if (customCSS) customCSS.remove();
        customCSS = null;
        themeBg = '';
        themeFg = '';
        // 切换回原色时，清除 JS 扫描添加的 inline 背景/文字色，避免残留自定义颜色
        if (document.body) {
            var marked = document.querySelectorAll('[data-rh-themed]');
            for (var i = 0; i < marked.length; i++) {
                var el = marked[i];
                el.style.removeProperty('background');
                el.style.removeProperty('color');
                el.removeAttribute('data-rh-themed');
            }
        }
    }

    function startStyleScan() {
        if (styleScanTimer) return;
        styleScanTimer = setInterval(function() {
            scanCount++;
            // 每隔约 60 秒清除一次标记，防止页面动态恢复白色后无法重新覆盖
            if (scanCount % 6 === 0) {
                var marked = document.querySelectorAll('[data-rh-themed]');
                for (var i = 0; i < marked.length; i++) marked[i].removeAttribute('data-rh-themed');
            }
            if (document.body) forceContainerStyles();
        }, 10000);
        whenBodyReady(function() {
            forceContainerStyles();
            startDomObserver();
        });
    }

    function stopStyleScan() {
        if (styleScanTimer) { clearInterval(styleScanTimer); styleScanTimer = null; scanCount = 0; }
        stopDomObserver();
    }

    function startDomObserver() {
        if (domObserver || !window.MutationObserver) return;
        var pendingTimer = null;
        domObserver = new MutationObserver(function(mutations) {
            var added = [];
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type !== 'childList') continue;
                for (var j = 0; j < m.addedNodes.length; j++) {
                    var node = m.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                    if (node.id === 'rh-host' || node.id === 'rh-overlay' || node.getAttribute('data-rh-ignore')) continue;
                    added.push(node);
                }
            }
            if (!added.length) return;
            if (pendingTimer) clearTimeout(pendingTimer);
            pendingTimer = setTimeout(function() {
                pendingTimer = null;
                forceContainerStyles(added);
            }, 100);
        });
        whenBodyReady(function() {
            domObserver.observe(document.body, { childList: true, subtree: true });
        });
    }

    function stopDomObserver() {
        if (domObserver) { domObserver.disconnect(); domObserver = null; }
    }

    function shouldThemeElement(el) {
        var skipTags = { SCRIPT:1, STYLE:1, LINK:1, META:1, IMG:1, VIDEO:1, CANVAS:1, SVG:1, IFRAME:1, INPUT:1, BUTTON:1, SELECT:1, TEXTAREA:1, A:1, SPAN:1, STRONG:1, EM:1, B:1, I:1, SMALL:1, LABEL:1, CODE:1, SUP:1, SUB:1, BR:1, HR:1, WBR:1 };
        if (skipTags[el.tagName]) return false;
        if (el.hasAttribute('data-rh-themed')) return false;
        if (el.id === 'rh-host' || el.id === 'rh-overlay' || el.id === 'rh-css') return false;
        if (el.getAttribute && el.getAttribute('data-rh-ignore')) return false;
        return true;
    }

    function processElement(el) {
        // 跳过 canvas 元素自身
        if (el.tagName === 'CANVAS') return;
        // 跳过直接包含 canvas 的容器（如 jm-sheet-sheet），避免背景色遮挡 canvas
        var hasCanvasChild = false;
        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].tagName === 'CANVAS') { hasCanvasChild = true; break; }
        }
        if (hasCanvasChild) return;
        // 跳过 overlayer 容器及其所有后代（CSS 统一处理透明背景和文字色）
        if (el.className && typeof el.className === 'string' && /jm-sheet-overlayer/i.test(el.className)) return;
        var p = el.parentElement;
        while (p) {
            if (p.className && typeof p.className === 'string' && /jm-sheet-overlayer/i.test(p.className)) return;
            p = p.parentElement;
        }
        var style = window.getComputedStyle(el);
        var bgColor = style.backgroundColor;
        var color = style.color;
        var bgImage = style.backgroundImage || 'none';
        // 跳过毛玻璃/半透明弹窗：保留原有透明感和 backdrop-filter
        if (style.backdropFilter && style.backdropFilter !== 'none') return;
        if (parseAlpha(bgColor) > 0 && parseAlpha(bgColor) < 1) return;
        // 只处理元素自身声明了近白背景，或包含白色/近白色的渐变遮罩
        var hasLightGradient = bgImage !== 'none' && /gradient/i.test(bgImage) && /rgba?\(\s*(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})[\s,]*(?:25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})[\s,]*(?:25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})|#fff|white/i.test(bgImage);
        var themed = false;
        if (isLightColor(bgColor) || hasLightGradient) {
            el.style.setProperty('background', themeBg, 'important');
            el.style.setProperty('color', themeFg, 'important');
            themed = true;
        }
        // 全局对比度兜底：低对比度文字强制改为 themeFg
        if (!themed && hasBadContrast(bgColor, color) && !isInsideSpecial(el)) {
            el.style.setProperty('color', themeFg, 'important');
            themed = true;
        }
        if (themed) el.setAttribute('data-rh-themed', '1');
    }

    function hideAds(nodes) {
        var selector = '[data-adid],[ad-category="homepage"],[ad-location][ad-position],[class*="mod_js_ad"],[class^="ad_"],[class*=" ad_"],[class^="tl_ad_"],[class*=" tl_ad_"],[class*="sponsored"],[class*="promotion"]';var targets;
        if (nodes && nodes.length) {
            targets = [];
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (node.nodeType === 1) {
                    if (node.matches && node.matches(selector)) node.style.setProperty('display', 'none', 'important');
                    var descendants = node.querySelectorAll(selector);
                    for (var j = 0; j < descendants.length; j++) descendants[j].style.setProperty('display', 'none', 'important');
                }
            }
        } else {
            var ads = document.querySelectorAll(selector);
            for (var k = 0; k < ads.length; k++) ads[k].style.setProperty('display', 'none', 'important');
        }
    }

    function forceContainerStyles(nodes) {
        if (!isActive || !themeBg) return;
        hideAds(nodes);
        var targets;
        if (nodes && nodes.length) {
            targets = [];
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (node.nodeType === 1) {
                    targets.push(node);
                    var descendants = node.querySelectorAll('*');
                    for (var j = 0; j < descendants.length; j++) targets.push(descendants[j]);
                }
            }
            // 新节点数量少，直接同步处理
            for (var k = 0; k < targets.length; k++) {
                if (shouldThemeElement(targets[k])) processElement(targets[k]);
            }
        } else {
            targets = document.querySelectorAll('body, body *');
            var idx = 0;
            var batchSize = 250;
            function processBatch() {
                for (var end = Math.min(idx + batchSize, targets.length); idx < end; idx++) {
                    if (shouldThemeElement(targets[idx])) processElement(targets[idx]);
                }
                if (idx < targets.length) requestAnimationFrame(processBatch);
            }
            requestAnimationFrame(processBatch);
        }
    }

    function isLightColor(color) {
        var rgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!rgb) return false;
        var r = parseInt(rgb[1], 10), g = parseInt(rgb[2], 10), b = parseInt(rgb[3], 10);
        // 捕获白色、米白、浅灰等近白背景（如 #FEFAF5、#F5F5F5）
        return r >= 240 && g >= 240 && b >= 240;
    }

    function adjustBg(color, amt) {
        var r, g, b;
        var hex = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        if (hex) {
            r = parseInt(hex[1], 16);
            g = parseInt(hex[2], 16);
            b = parseInt(hex[3], 16);
        } else {
            var rgb = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (!rgb) return color;
            r = parseInt(rgb[1], 10);
            g = parseInt(rgb[2], 10);
            b = parseInt(rgb[3], 10);
        }
        r = Math.max(0, Math.min(255, r + amt));
        g = Math.max(0, Math.min(255, g + amt));
        b = Math.max(0, Math.min(255, b + amt));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function isDarkBg(color) {
        var r, g, b;
        var hex = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        if (hex) {
            r = parseInt(hex[1], 16);
            g = parseInt(hex[2], 16);
            b = parseInt(hex[3], 16);
        } else {
            var rgb = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (!rgb) return false;
            r = parseInt(rgb[1], 10);
            g = parseInt(rgb[2], 10);
            b = parseInt(rgb[3], 10);
        }
        return (r * 0.299 + g * 0.587 + b * 0.114) < 100;
    }

    function parseColor(color) {
        var r, g, b, a = 1;
        var hex = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
        if (hex) {
            r = parseInt(hex[1], 16);
            g = parseInt(hex[2], 16);
            b = parseInt(hex[3], 16);
        } else {
            var rgb = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
            if (!rgb) return null;
            r = parseInt(rgb[1], 10);
            g = parseInt(rgb[2], 10);
            b = parseInt(rgb[3], 10);
            if (rgb[4] !== undefined) a = parseFloat(rgb[4]);
        }
        return { r: r, g: g, b: b, a: a };
    }

    function parseAlpha(color) {
        var c = parseColor(color);
        return c ? c.a : 1;
    }

    function luminance(color) {
        var c = parseColor(color);
        if (!c) return NaN;
        var rsRGB = c.r / 255, gsRGB = c.g / 255, bsRGB = c.b / 255;
        var r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        var g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        var b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function hasBadContrast(bg, text) {
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false;
        var bgLum = luminance(bg);
        var textLum = luminance(text);
        if (isNaN(bgLum) || isNaN(textLum)) return false;
        // WCAG 对比度公式
        var lighter = Math.max(bgLum, textLum);
        var darker = Math.min(bgLum, textLum);
        var ratio = (lighter + 0.05) / (darker + 0.05);
        return ratio < 2.5;
    }

    function isInsideSpecial(el) {
        var node = el.parentElement;
        while (node && node !== document.body) {
            var tag = node.tagName;
            if (tag === 'A' || tag === 'BUTTON') return true;
            var cls = node.className || '';
            if (typeof cls === 'string' && /link|btn|button|tag|badge|pill|anchor|primary|success|warning|danger|error|accent/i.test(cls)) return true;
            node = node.parentElement;
        }
        return false;
    }

    function switchTheme() {
        var next = (currentIndex + 1) % themeKeys.length;
        applyTheme(next);
    }

    function toggle() {
        if (isActive) {
            removeCSS();
            isActive = false;
            notify('\u26aa 已禁用');
        } else {
            applyTheme(currentIndex);
            isActive = true;
            notify(themes[themeKeys[currentIndex]].icon + ' 已启用');
        }
    }

    function notify(msg) {
        console.log('ReadHelper: ' + msg);
        var n = document.createElement('div');
        n.innerHTML = msg;
        n.style.cssText = 'position:fixed;bottom:110px;left:20px;background:#333;color:#fff;padding:10px 16px;border-radius:6px;z-index:999999;font-size:13px;opacity:0;transform:translateY(10px);transition:all 0.3s;max-width:250px;white-space:nowrap;';
        document.body.appendChild(n);
        setTimeout(function() { n.style.opacity = '1'; n.style.transform = 'translateY(0)'; }, 10);
        setTimeout(function() { n.style.opacity = '0'; n.style.transform = 'translateY(10px)'; setTimeout(function() { n.remove(); }, 300); }, 2000);
    }

    // Settings overlay
    var overlay = null;
    var panel = null;
    var shadowRoot = null;

    function toggleSettings() {
        if (panel) {
            overlay.remove();
            panel = null;
            shadowRoot = null;
            overlay = null;
            return;
        }

        showButtons();
        clearTimeout(hideTimer);

        overlay = document.createElement('div');
        overlay.id = 'rh-overlay';
        overlay.setAttribute('data-rh-ignore', '1');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:2147483647;overflow-y:auto;padding:60px 20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;';
        document.body.appendChild(overlay);

        shadowRoot = overlay.attachShadow({mode: 'open'});

        // 设置面板跟随当前主题配色
        var curT = themes[themeKeys[currentIndex]];
        var isOriginal = curT.bg === 'transparent';
        var panelBg = isOriginal ? '#ffffff' : (curT.displayBg || curT.bg);
        var panelFg = isOriginal ? '#333333' : (curT.displayFg || curT.fg);
        var panelAccent = isOriginal ? '#1677ff' : (curT.displayAccent || curT.accent);
        var panelBg2 = isOriginal ? '#f5f5f5' : adjustBg(panelBg, 8);
        var panelDim = isOriginal ? '#666666' : (isDarkBg(panelBg) ? adjustBg(panelFg, 40) : adjustBg(panelFg, -30));
        var panelBorder = isOriginal ? '#e7e7e7' : adjustBg(panelAccent, 30);

        var style = document.createElement('style');
        style.textContent = '*{margin:0;padding:0;box-sizing:border-box}' +
            ':host{display:block;width:100%;height:100%;overflow-y:auto}' +
            '#rh-panel{background:' + panelBg + ';border-radius:8px;width:100%;max-width:700px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,0.15);overflow:hidden;color:' + panelFg + ';font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;max-height:calc(100vh - 120px);display:flex;flex-direction:column}' +
            '#rh-panel>div:last-child{overflow-y:auto;flex:1}' +
            '.rt{color:' + panelDim + ';border-bottom:none;padding:8px 16px;cursor:pointer;font-size:13px}' +
            '.rt[data-t="theme"]{color:' + panelAccent + ';border-bottom:2px solid ' + panelAccent + '}' +
            '.th-card{border:2px solid transparent}' +
            '#rh-prev{border-radius:6px;padding:14px}' +
            '#rh-bgprev{height:150px;border-radius:8px;background:' + panelBg2 + ';border:1px solid ' + panelBorder + ';display:flex;align-items:center;justify-content:center}' +
            'input[type="text"]{width:100%;padding:10px;border:1px solid ' + panelBorder + ';border-radius:6px;font-size:14px;outline:none;background:' + panelBg + ';color:' + panelFg + '}' +
            'input[type="range"]{width:100%}';
        shadowRoot.appendChild(style);

        panel = document.createElement('div');
        panel.id = 'rh-panel';
        shadowRoot.appendChild(panel);

        var html = '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #e7e7e7;background:#fafafa;">' +
            '<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:18px;">\ud83d\udd27</span><h2 style="margin:0;font-size:16px;font-weight:500;color:#222;">ReadHelper 阅读助手</h2></div>' +
            '<button id="rh-close" style="background:none;border:none;color:#999;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:4px;line-height:1;" title="Close">\u00d7</button></div>' +
            '<div style="padding:20px;">';

        // Tabs
        html += '<div id="rh-tabs" style="display:flex;border-bottom:2px solid #e7e7e7;margin-bottom:20px;">' +
            '<div class="rt" data-t="theme" style="padding:8px 16px;cursor:pointer;border-bottom:2px solid #1677ff;color:#1677ff;font-weight:500;margin-bottom:-2px;font-size:13px;">主题</div>' +
            '<div class="rt" data-t="bg" style="padding:8px 16px;cursor:pointer;color:#666;margin-bottom:-2px;font-size:13px;">背景</div>' +
            '<div class="rt" data-t="about" style="padding:8px 16px;cursor:pointer;color:#666;margin-bottom:-2px;font-size:13px;">关于</div></div>';

        // Theme tab
        html += '<div id="rc-theme" style="display:block;">';
        html += '<div style="margin-bottom:14px;"><div style="font-size:13px;color:#666;margin-bottom:8px;">选择主题</div>';
        html += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">';

        themeKeys.forEach(function(k, i) {
            var th = themes[k];
            html += '<div class="th-card" data-i="' + i + '" style="padding:8px 4px;border-radius:6px;background:' + (th.displayBg || th.bg) + ';color:' + (th.displayFg || th.fg) + ';border:2px solid ' + (i === currentIndex ? (th.displayAccent || th.accent) : 'transparent') + ';cursor:pointer;text-align:center;line-height:1.2;">' +
                '<div style="font-size:20px;margin-bottom:3px;">' + th.icon + '</div><div style="font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + th.name + '</div></div>';
        });
        html += '</div></div>';

        var previewBg = themes[themeKeys[currentIndex]].displayBg || themes[themeKeys[currentIndex]].bg;
        var previewFg = themes[themeKeys[currentIndex]].displayFg || themes[themeKeys[currentIndex]].fg;
        var previewAccent = themes[themeKeys[currentIndex]].displayAccent || themes[themeKeys[currentIndex]].accent;
        html += '<div style="margin-bottom:16px;"><div style="font-size:13px;color:#666;margin-bottom:8px;">预览</div>';
        html += '<div id="rh-prev" style="padding:14px;border-radius:6px;background:' + previewBg + ';color:' + previewFg + ';border-left:4px solid ' + previewAccent + ';">';
        html += '<div style="font-size:16px;font-weight:600;margin-bottom:6px;">示例标题</div>';
        html += '<div style="font-size:13px;line-height:1.6;opacity:0.9;">当前主题颜色效果预览</div></div></div>';

        html += '</div>';

        // Background tab
        html += '<div id="rc-bg" style="display:none;">' +
            '<div style="margin-bottom:20px;"><div style="font-size:14px;color:#666;margin-bottom:10px;">背景图片 URL</div>' +
            '<input type="text" id="rh-bgurl" placeholder="https://example.com/image.jpg" value="' + (bgImage || '') + '" style="width:100%;padding:10px;border:1px solid #d9d9d9;border-radius:6px;font-size:14px;box-sizing:border-box;outline:none;" onfocus="this.style.borderColor=\'#1677ff\'" onblur="this.style.borderColor=\'#d9d9d9\'"></div>' +
            '<div style="margin-bottom:20px;"><div style="font-size:14px;color:#666;margin-bottom:10px;">透明度: <span id="rh-opval">' + Math.round(bgOpacity * 100) + '%</span></div>' +
            '<input type="range" id="rh-opslid" min="5" max="100" value="' + Math.round(bgOpacity * 100) + '" style="width:100%;"></div>' +
            '<div style="margin-bottom:20px;"><div style="font-size:14px;color:#666;margin-bottom:10px;">预览</div>' +
            '<div id="rh-bgprev" style="height:150px;border-radius:8px;background:#f5f5f5;border:1px solid #e7e7e7;display:flex;align-items:center;justify-content:center;"><span style="color:#999;font-size:14px;">设置背景后可预览效果</span></div></div></div>';

        // About tab
        html += '<div id="rc-about" style="display:none;"><div style="text-align:center;padding:30px 0;">' +
            '<div style="font-size:48px;margin-bottom:16px;">\ud83d\udcd6</div>' +
            '<h3 style="margin:0 0 8px;font-size:20px;color:#222;">ReadHelper v0.1.0</h3>' +
            '<p style="color:#666;font-size:14px;margin:0 0 24px;">多功能阅读辅助工具</p></div>' +
            '<div style="background:#f5f5f5;padding:16px;border-radius:8px;margin-bottom:20px;"><div style="font-size:14px;color:#666;margin-bottom:10px;">快捷操作</div>' +
            '<div style="font-size:13px;line-height:2;color:#333;"><div>\ud83d\uddb1\ufe0f 圆形按钮 - 切换主题</div>' +
            '<div>\u2699\ufe0f 齿轮按钮 - 打开设置</div></div></div>' +
            '<div style="background:#f5f5f5;padding:16px;border-radius:8px;"><div style="font-size:14px;color:#666;margin-bottom:10px;">开发者</div>' +
            '<div style="font-size:13px;color:#333;"><a href="https://github.com/hezimy" target="_blank" style="color:#1677ff;text-decoration:none;">hezimy</a>' +
            '<span style="color:#999;margin:0 8px;">|</span><span>github.com/hezimy</span></div></div></div>';

        html += '</div>';
        panel.innerHTML = html;

        // 覆盖设置面板内联样式，确保跟随主题
        var themeStyle = document.createElement('style');
        themeStyle.textContent = '#rh-panel>div:first-child{background:' + panelBg2 + '!important;border-color:' + panelBorder + '!important}' +
            '#rh-panel h2,#rh-panel h3{color:' + panelFg + '!important}' +
            '#rh-panel [style*="color:#222"]:not(.th-card),#rh-panel [style*="color:#333"]:not(.th-card),#rh-panel [style*="color:#666"]:not(.th-card),#rh-panel [style*="color:#999"]:not(.th-card){color:' + panelDim + '!important}' +
            '#rh-tabs{border-color:' + panelBorder + '!important}' +
            '#rh-panel .rt{color:' + panelDim + '!important}' +
            '#rh-panel .rt[data-t="theme"]{color:' + panelAccent + '!important;border-color:' + panelAccent + '!important}' +
            '#rh-panel input[type="text"]:focus{border-color:' + panelAccent + '!important}' +
            '#rc-about>div:nth-child(2),#rc-about>div:nth-child(3){background:' + panelBg2 + '!important;border-color:' + panelBorder + '!important}' +
            '#rh-bgprev span{color:' + panelDim + '!important}' +
            '#rh-close{color:' + panelDim + '!important}';
        shadowRoot.appendChild(themeStyle);

        // Bind events after panel is in DOM
        bindSettingsEvents();

        function bindSettingsEvents() {
            var closeBtn = panel.querySelector('#rh-close');
            if (!closeBtn) return;
            
            closeBtn.addEventListener('click', function() {
                toggleSettings();
                scheduleHide();
            });
            
            overlay.addEventListener('click', function(e) { 
                var path = e.composedPath();
                if (path[0] === overlay) { 
                    toggleSettings(); 
                    scheduleHide();
                } 
            });

            document.addEventListener('keydown', function esc(e) {
                if (e.key === 'Escape' && panel) { toggleSettings(); document.removeEventListener('keydown', esc); }
            });

            scheduleHide();

            var tabs = panel.querySelectorAll('.rt');
            tabs.forEach(function(tab) {
                tab.addEventListener('click', function() {
                    var targetTab = this.getAttribute('data-t');
                    tabs.forEach(function(t) { t.style.borderBottom = 'none'; t.style.color = panelDim; });
                    this.style.borderBottom = '2px solid ' + panelAccent;
                    this.style.color = panelAccent;
                    panel.querySelectorAll('[id^="rc-"]').forEach(function(c) { c.style.display = 'none'; });
                    panel.querySelector('#rc-' + targetTab).style.display = 'block';
                });
            });

            var themeCards = panel.querySelectorAll('.th-card');
            var cardSwitching = false;
            themeCards.forEach(function(card) {
                card.addEventListener('click', function() {
                    if (cardSwitching) return;
                    cardSwitching = true;
                    setTimeout(function() { cardSwitching = false; }, 300);
                    var i = parseInt(this.getAttribute('data-i'));
                    var th = themes[themeKeys[i]];
                    themeCards.forEach(function(c) { c.style.borderColor = 'transparent'; });
                    this.style.borderColor = th.displayAccent || th.accent;
                    var prev = panel.querySelector('#rh-prev');
                    if (prev) {
                        prev.style.background = th.displayBg || th.bg;
                        prev.style.color = th.displayFg || th.fg;
                        prev.style.borderLeftColor = th.displayAccent || th.accent;
                    }
                    currentIndex = i;
                    if (btn) btn.innerHTML = th.icon;
                    applyTheme(i, true);
                });
            });

            // Remove next/toggle button handlers

            var bgUrlInput = panel.querySelector('#rh-bgurl');
            if (bgUrlInput) {
                bgUrlInput.addEventListener('input', function() {
                    bgImage = this.value;
                    updateBackgroundPreview();
                    if (isActive) { var t = themes[themeKeys[currentIndex]]; removeCSS(); addCSS(t); }
                    saveSettings();
                });
            }
            
            var bgOpacitySlider = panel.querySelector('#rh-opslid');
            if (bgOpacitySlider) {
                bgOpacitySlider.addEventListener('input', function() {
                    bgOpacity = parseInt(this.value) / 100;
                    var opVal = panel.querySelector('#rh-opval');
                    if (opVal) opVal.textContent = this.value + '%';
                    updateBackgroundPreview();
                    if (isActive) { var t = themes[themeKeys[currentIndex]]; removeCSS(); addCSS(t); }
                    saveSettings();
                });
            }
            
            panel.querySelectorAll('input[name="rh-bg-size"]').forEach(function(radio) {
                radio.addEventListener('change', function() {
                    CONFIG_bgSize = this.value;
                    if (isActive) { var t = themes[themeKeys[currentIndex]]; removeCSS(); addCSS(t); }
                    saveSettings();
                });
            });
            panel.querySelectorAll('input[name="rh-bg-pos"]').forEach(function(radio) {
                radio.addEventListener('change', function() {
                    CONFIG_bgPos = this.value;
                    if (isActive) { var t = themes[themeKeys[currentIndex]]; removeCSS(); addCSS(t); }
                    saveSettings();
                });
            });

            function updateBackgroundPreview() {
                var prev = panel.querySelector('#rh-bgprev');
                if (!prev) return;
                if (bgImage) {
                    prev.style.background = 'url("' + bgImage + '") ' + (CONFIG_bgSize || 'cover') + ' ' + (CONFIG_bgPos || 'center') + ' no-repeat ' + panelBg2;
                    prev.querySelector('span').style.display = 'none';
                } else {
                    prev.style.background = panelBg2;
                    prev.querySelector('span').style.display = '';
                }
            }

            updateBackgroundPreview();
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode === 66) { e.preventDefault(); toggle(); }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode === 78) { e.preventDefault(); switchTheme(); }
    });

    window.ReadHelper = { enable: function() { if (!isActive) { applyTheme(currentIndex); isActive = true; } }, disable: function() { if (isActive) { removeCSS(); isActive = false; } }, toggle: toggle, switch: switchTheme, settings: toggleSettings };

    // 自动应用保存的主题
    if (hasApplied) {
        applyTheme(currentIndex, true);
    }

    console.log('ReadHelper loaded. Click gear icon for settings.');
})();
