(function() {
    'use strict';


    window._musicPlayerInit = true;

    var config = window.MUSIC_CONFIG || {};
    var API_URL = config.API_URL || 'https://wyyapi.cxdqq.top';
    var LINK_API_URL = config.LINK_API_URL || 'https://wyyapi.cxdqq.top/song/url/v1';
    var COOKIE = config.COOKIE || '';
    var TIMEOUT = config.TIMEOUT || 15000;
    var MAX_RETRIES = config.RETRY_COUNT || 3;

    var state = {
        currentUrl: location.href,
        currentSongId: '',
        isLoading: false,
        isInitialized: false,
        watchInterval: null,
        notifiedIdMismatch: false
    };

    function log() {}

    function error() {}

    function notifyUser(message, type) {
        type = type || 'warning';
        try {
            if (typeof notify === 'function') {
                notify(message, type);
            } else if (typeof toastr === 'function') {
                toastr[type](message);
            } else {
                console.log('[音乐播放器提示]', message);
            }
        } catch(e) {}
    }

    function validateIds(requestedId, returnedId) {
        return String(requestedId) === String(returnedId);
    }

    function setupErrorFiltering() {
        try {
            var originalError = console.error;
            console.error = function() {
                var args = Array.prototype.slice.call(arguments);
                var message = args.join(' ');
                var shouldIgnore = ['/Page/Index/null', 'mCustomScrollbar is not a function', 'mCustomScrollbar', 'scrollBar'].some(function(k) { return message.indexOf(k) !== -1; });
                if (shouldIgnore) return;
                originalError.apply(console, args);
            };
            window.addEventListener('error', function(e) {
                var msg = e.message || '';
                if (msg.indexOf('mCustomScrollbar') !== -1 || msg.indexOf('scrollBar') !== -1) { e.preventDefault(); return true; }
            }, true);
        } catch(e) {}
    }

    function buildData(params) {
        var data = params ? JSON.parse(JSON.stringify(params)) : {};
        if (COOKIE) data.cookie = COOKIE;
        return data;
    }

    function isIndexPage(url) {
        url = url || location.href;
        return url.indexOf('/Page/Index/') !== -1 || url.indexOf('/Page/Index.html') !== -1;
    }

    function ajax(url, data, retryCount) {
        retryCount = retryCount || 0;
        
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: data,
                timeout: TIMEOUT,
                success: function(response) {
                    resolve(response);
                },
                fail: function(xhr, status, err) {
                    if ((status === 'timeout' || status === 'abort') && retryCount < MAX_RETRIES) {
                        notifyUser('请求超时，立即重试 (' + (retryCount + 1) + '/' + MAX_RETRIES + ')', 'warning');
                        ajax(url, data, retryCount + 1).then(resolve).catch(reject);
                    } else {
                        reject({ status: status, error: err, retried: retryCount });
                    }
                },
                error: function(xhr, status, err) {
                    if (retryCount < MAX_RETRIES && (status === 'timeout' || xhr.status >= 500)) {
                        notifyUser('服务器错误 (' + xhr.status + ')，立即重试...', 'error');
                        ajax(url, data, retryCount + 1).then(resolve).catch(reject);
                    } else {
                        reject({ status: xhr.status, error: err, retried: retryCount });
                    }
                }
            });
        });
    }

    function resetPlayer() {
        try {
            document.querySelectorAll('audio').forEach(function(a) { try { a.pause(); a.src = ''; } catch(e) {} });
            if (window._PlayerCore) {
                try { if (window._PlayerCore.e) { window._PlayerCore.e.pause(); window._PlayerCore.e.src = ''; } } catch(e) {}
                if (window._PlayerCore.SongIdList) {
                    for (var i = 0; i < 20 && window._PlayerCore.SongIdList.length > 0; i++) {
                        try { window._PlayerCore.RemoveSong(0); } catch(e) {}
                    }
                }
            }
        } catch(e) {}
        state.currentSongId = '';
        state.isLoading = false;
    }

    function showPlayer() {
        try {
            var player = document.getElementById('CorePlayer');
            if (player) player.style.display = 'block';

            var wrapper = document.getElementById('CoreWrapper');
            if (wrapper) {
                wrapper.style.cssText = 'display:flex !important; opacity:1 !important; visibility:visible !important; transform:translate(0) !important;';
                wrapper.classList.remove('hidden');
            }
        } catch(e) {}
    }

    function hidePlayer() {
        try {
            var wrapper = document.getElementById('CoreWrapper');
            if (wrapper) {
                wrapper.classList.add('hidden');
                wrapper.style.display = 'none';
                wrapper.style.visibility = 'hidden';
            }
            var player = document.getElementById('CorePlayer');
            if (player) player.style.display = 'none';
        } catch(e) {}
    }

    function showNoMusicAlert() {
        notifyUser('无法播放音乐，出现bug', 'danger');
    }

    async function fetchSongDetail(songId, retryCount) {
        retryCount = retryCount || 0;

        var url = API_URL + '/song/detail';
        var data = buildData({ ids: String(songId) });

        var response = await ajax(url, data);

        if (!response || response.code !== 200 || !response.songs || !response.songs.length) {
            throw new Error('无效的详情响应: ' + (response ? response.code : '空'));
        }

        var song = response.songs[0];

        var idMatch = validateIds(songId, song.id);

        if (!idMatch) {
            if (!state.notifiedIdMismatch) {
                state.notifiedIdMismatch = true;
                notifyUser('歌曲ID不匹配，正在重新获取...', 'warning');
            }
            return fetchSongDetail(songId, retryCount + 1);
        }

        state.notifiedIdMismatch = false;
        return song;
    }

    async function fetchSongUrl(songId, retryCount) {
        retryCount = retryCount || 0;

        var url = LINK_API_URL;
        var data = buildData({ id: String(songId), level: 'lossless' });

        var response = await ajax(url, data);

        if (!response || response.code !== 200 || !response.data || !response.data.length) {
            throw new Error('无效的URL响应: ' + (response ? response.code : '空'));
        }

        var dataItem = response.data[0];

        var urlIdMatch = true;
        if (dataItem.id) {
            urlIdMatch = validateIds(songId, dataItem.id);
        }

        if (!urlIdMatch && dataItem.id) {
            if (!state.notifiedIdMismatch) {
                state.notifiedIdMismatch = true;
                notifyUser('歌曲URL ID不匹配，正在重新获取...', 'warning');
            }
            //return fetchSongUrl(songId, retryCount + 1);
        }

        if (dataItem.code !== 200 || !dataItem.url) {
            throw new Error('无效的URL数据: 状态码=' + (dataItem.code || '无'));
        }

        var finalUrl = dataItem.url.replace(/^http:/, 'https:');
        return finalUrl;
    }

    async function playSong(songId, forceReload) {
        if (state.isLoading) {
            return;
        }

        state.isLoading = true;
        state.notifiedIdMismatch = false;

        try {
            showPlayer();

            var detail = await fetchSongDetail(songId);
            var artists = detail.ar ? detail.ar.map(function(a) { return a.name; }).join(', ') : '未知歌手';

            var url = await fetchSongUrl(songId);

            if (!window._PlayerCore) {
                throw new Error('播放器核心未加载');
            }

            var songInfo = {
                name: detail.name || '未知歌曲',
                id: parseInt(songId),
                apiId: detail.id,
                src: url,
                author: artists,
                album: detail.al ? detail.al.name : undefined,
                img: detail.al && detail.al.picUrl ? detail.al.picUrl : undefined
            };

            if (forceReload) {
                try {
                    var currentPlaylist = window._PlayerCore.SongIdList ? window._PlayerCore.SongIdList.slice() : [];

                    for (var ci = currentPlaylist.length - 1; ci >= 0; ci--) {
                        try {
                            window._PlayerCore.RemoveSong(currentPlaylist[ci]);
                        } catch(ri) {}
                    }

                    var remainingMapKeys = window._PlayerCore.SongIdMap ? Object.keys(window._PlayerCore.SongIdMap) : [];
                    if (remainingMapKeys.length > 0) {
                        for (var mi = 0; mi < remainingMapKeys.length; mi++) {
                            delete window._PlayerCore.SongIdMap[remainingMapKeys[mi]];
                        }
                    }

                    var remainingList = window._PlayerCore.SongIdList || [];
                    if (remainingList.length > 0) {
                        window._PlayerCore.SongIdList.length = 0;
                    }
                } catch(clearErr) {}
            }

            try {
                window._PlayerCore.AppendSongOnTail(songInfo);
            } catch(appendErr) {

                if (appendErr.message && appendErr.message.indexOf('repeat id') !== -1) {
                    try {
                        state.currentSongId = songId;

                        setTimeout(function() {
                            try {
                                window._PlayerCore.PlaySelectSong(parseInt(songId));
                                if (window._PlayerCore.e) {
                                    window._PlayerCore.e.load();
                                }
                            } catch(playErr) {}
                            state.isLoading = false;
                        }, 0);
                        return;
                    } catch(recoverErr) {}
                }

                throw appendErr;
            }

            state.currentSongId = songId;

            setTimeout(function() {
                try {
                    window._PlayerCore.PlaySelectSong(parseInt(songId));
                } catch(playErr) {}
                state.isLoading = false;
            }, 0);

        } catch(err) {
            state.isLoading = false;

            if (err && (err.status === 'timeout' || err.error === 'timeout')) {
                notifyUser('加载超时，3秒后自动重试', 'error');
                setTimeout(function() { checkAndPlay(true); }, 3000);
            } else if (err && err.status >= 500) {
                notifyUser('服务器错误，5秒后自动重试', 'error');
                setTimeout(function() { checkAndPlay(true); }, 5000);
            } else {
                showNoMusicAlert();
            }
        }
    }

    function checkAndPlay(forceReload) {
        try {
            var musicElement = document.getElementById('page-music-data');

            if (!musicElement) {
                hidePlayer();
                state.currentSongId = '';
                return;
            }

            var musicId = (musicElement.getAttribute('data-music-id') || '').trim();

            if (!musicId) {
                hidePlayer();
                resetPlayer();
                state.currentSongId = '';
                return;
            }

            if (!forceReload && musicId === state.currentSongId && state.currentSongId !== '') {
                return;
            }

            playSong(musicId, forceReload);
        } catch(err) {
            hidePlayer();
        }
    }

    function handlePageChange(newUrl) {
        state.currentUrl = newUrl;

        if (isIndexPage(newUrl)) {
            setTimeout(function() { checkAndPlay(true); }, 1500);
        } else {
            hidePlayer();
            resetPlayer();
            state.currentSongId = '';
        }
    }

    function startWatching() {
        state.currentUrl = location.href;

        if (state.watchInterval) clearInterval(state.watchInterval);

        state.watchInterval = setInterval(function() {
            var currentUrl = location.href;
            if (currentUrl !== state.currentUrl) handlePageChange(currentUrl);
        }, 1000);
    }

    function loadDependencies() {
        return new Promise(function(resolve, reject) {
            if (window._PlayerCore && typeof PetiteVue !== 'undefined') {
                resolve();
                return;
            }

            var vueScript = document.createElement('script');
            vueScript.src = '/assets/js/petite-vue.iife.js?v=' + Date.now();

            vueScript.onload = function() {
                this.remove();

                var playerScript = document.createElement('script');
                playerScript.src = '/assets/js/index.bundle.js?v=' + Date.now();

                playerScript.onload = function() {
                    this.remove();
                    resolve();
                };

                playerScript.onerror = function() {
                    this.remove();
                    reject(new Error('播放器加载失败'));
                };

                document.head.appendChild(playerScript);
            };

            vueScript.onerror = function() {
                this.remove();
                reject(new Error('Vue加载失败'));
            };

            document.head.appendChild(vueScript);
        });
    }

    function setupPjaxListeners() {
        try {
            $(document).on('pjax:beforeSend', function(e, xhr, options) {
                resetPlayer();
            });

            $(document).on('pjax:complete', function(e, s, xhr, options) {
                var url = options.url || '';

                if (isIndexPage(url)) {
                    setTimeout(function() { checkAndPlay(true); }, 1200);
                } else {
                    hidePlayer();
                    resetPlayer();
                    state.currentSongId = '';
                }
            });
        } catch(e) {}
    }

    async function init() {
        setupErrorFiltering();
        resetPlayer();

        try {
            await loadDependencies();
            setupPjaxListeners();
            startWatching();
            checkAndPlay(true);
        } catch(err) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
