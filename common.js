/**
 * =================================================================
 * EveKuru 共通スクリプト (common.js)
 * =================================================================
 */

// --- グローバル設定 ---
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw_uoAzQx99fw9J0vX8IYmKRI_l7KEmpsmNnjPG9AUjUkMsgcem_OZa8c3XgqWNdAzI/exec';

/**
 * GASのAPIを呼び出す (JSONP形式)
 * @param {string} action - 実行したいGAS側の関数名
 * @param {object} params - GASに渡すパラメータ
 * @returns {Promise<object>} GASからのレスポンス
 */
function callGasApi(action, params) {
    const event = new URLSearchParams(window.location.search).get('event');
    if (!event && action !== 'sendResetEmail' && action !== 'resetCredential') {
        console.error("URLに 'event' パラメータが指定されていません。");
        return Promise.resolve({ success: false, message: "イベント情報が見つかりません。URLを確認してください。" });
    }

    const payload = { action, event, ...params };
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');

    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('リクエストがタイムアウトしました。')), 15000);
    });

    const jsonpPromise = new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

        window[callbackName] = (response) => {
            document.head.removeChild(script);
            delete window[callbackName];
            clearTimeout(timeoutId);
            resolve(response);
        };

        const script = document.createElement('script');
        const encodedPayload = encodeURIComponent(JSON.stringify(payload));
        script.src = `${GAS_API_URL}?callback=${callbackName}&payload=${encodedPayload}`;
        
        script.onerror = () => {
            delete window[callbackName];
            clearTimeout(timeoutId);
            reject(new Error('APIとの通信に失敗しました。'));
        };

        document.head.appendChild(script);
    });

    return Promise.race([jsonpPromise, timeoutPromise])
        .catch(error => ({ success: false, message: error.message }))
        .finally(() => {
            if (loader) loader.classList.add('hidden');
        });
}

/**
 * 共通のヘッダーとメニューを生成する
 */
function createCommonUI() {
    const uiContainer = document.createElement('div');
    const eventParam = window.location.search;
    uiContainer.innerHTML = `
        <header class="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-20">
            <div class="max-w-md mx-auto px-4 h-16 flex justify-between items-center">
                <a href="index.html${eventParam}" class="text-2xl font-bold text-primary">EveKuru</a>
                <button id="menu-button" class="p-2 -mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0.0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-700">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
        </header>
        <div id="menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>
        <nav id="side-menu" class="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 transform translate-x-full transition-transform duration-300 ease-in-out">
            <div class="p-6">
                <h2 class="text-2xl font-bold text-primary mb-8">Menu</h2>
                <div class="flex flex-col space-y-2">
                    <a href="guide.html${eventParam}" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">使い方ガイド</a>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSdM4I2XfjOuIE4uUyxJsuS9QTXlmfm6vu-fr-1SJRtt_Xs8EA/viewform" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">お問い合わせ</a>
                    <a href="release-notes.html${eventParam}" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">リリースノート</a>
                    <div class="border-t pt-4 mt-2">
                         <a href="https://qcda-dev.github.io/HP/" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">QcDa Projectとは</a>
                    </div>
                </div>
            </div>
            <div class="absolute bottom-4 left-6 text-sm text-gray-400">ver 4.0.0</div>
        </nav>
        <footer class="text-center py-4 mt-auto">
            <p class="text-xs text-gray-500">&copy; 2025 QcDa Project. All Rights Reserved.</p>
        </footer>
    `;
    document.body.prepend(uiContainer.querySelector('header'));
    document.body.prepend(uiContainer.querySelector('#menu-overlay'));
    document.body.prepend(uiContainer.querySelector('#side-menu'));
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.appendChild(uiContainer.querySelector('footer'));
    }

    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    const toggleMenu = () => {
        sideMenu.classList.toggle('translate-x-full');
        menuOverlay.classList.toggle('hidden');
    };
    menuButton.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
}

/**
 * ユーザーへのメッセージを表示する
 */
function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const textColor = isError ? '#b91c1c' : '#065f46';
    const bgColor = isError ? '#fee2e2' : '#d1fae5';
    el.innerHTML = `<div style="background-color: ${bgColor}; color: ${textColor};" class="p-3 rounded-lg">${message}</div>`;
    setTimeout(() => { el.innerHTML = ''; }, 5000);
}

// ページの初期化
document.addEventListener('DOMContentLoaded', createCommonUI);

