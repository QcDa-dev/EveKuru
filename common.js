/**
 * =================================================================
 * EveKuru 共通スクリプト (common.js) 変更してみた
 * =================================================================
 */

// --- グローバル設定 ---
// 【重要】GASを「新しいデプロイ」で再発行し、必ずこのURLを置き換えてください。
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw_uoAzQx99fw9J0vX8IYmKRI_l7KEmpsmNnjPG9AUjUkMsgcem_OZa8c3XgqWNdAzI/exec';

/**
 * GASのAPIを呼び出す (JSONP形式)
 * @param {string} action - 実行したいGAS側の関数名
 * @param {object} params - GASに渡すパラメータ
 * @returns {Promise<object>} GASからのレスポンス
 */
function callGasApi(action, params) {
    const event = new URLSearchParams(window.location.search).get('event');
    if (!event) {
        console.error("URLに 'event' パラメータが指定されていません。");
        // ユーザーにエラーを通知するUI処理をここに追加することも可能です。
        return Promise.reject(new Error("'event' parameter is missing."));
    }

    const payload = { action, event, ...params };
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');

    // タイムアウト処理
    let timeoutId = null;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Request timed out after 15 seconds.'));
        }, 15000); // 15秒でタイムアウト
    });

    // JSONPリクエスト処理
    const jsonpPromise = new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

        window[callbackName] = (response) => {
            // クリーンアップ
            document.head.removeChild(script);
            delete window[callbackName];
            clearTimeout(timeoutId);
            
            if (response.success) {
                resolve(response);
            } else {
                reject(new Error(response.message || 'An unknown error occurred.'));
            }
        };

        const script = document.createElement('script');
        const encodedPayload = encodeURIComponent(JSON.stringify(payload));
        script.src = `${GAS_API_URL}?callback=${callbackName}&payload=${encodedPayload}`;
        
        script.onerror = () => {
             // クリーンアップ
            delete window[callbackName];
            clearTimeout(timeoutId);
            reject(new Error('Failed to load the script. Check GAS URL and network.'));
        };

        document.head.appendChild(script);
    });

    return Promise.race([jsonpPromise, timeoutPromise])
        .catch(error => {
            console.error('API Error:', error);
            // エラーをオブジェクトとして整形して返すことで、呼び出し元での処理を統一
            return { success: false, message: error.message };
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}


/**
 * 共通のヘッダーとメニューを生成する
 */
function createCommonHeader() {
    const headerContainer = document.createElement('div');
    headerContainer.innerHTML = `
        <!-- ヘッダー -->
        <header class="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-20">
            <div class="max-w-md mx-auto px-4 h-16 flex justify-between items-center">
                <a href="index.html${window.location.search}" class="text-2xl font-bold text-primary">EveKuru</a>
                <button id="menu-button" class="p-2 -mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-700">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
        </header>

        <!-- サイドメニュー -->
        <div id="menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden"></div>
        <nav id="side-menu" class="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-40 transform translate-x-full transition-transform duration-300 ease-in-out">
            <div class="p-6">
                <h2 class="text-2xl font-bold text-primary mb-8">Menu</h2>
                <div class="flex flex-col space-y-2">
                    <a href="guide.html${window.location.search}" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">使い方ガイド</a>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSdM4I2XfjOuIE4uUyxJsuS9QTXlmfm6vu-fr-1SJRtt_Xs8EA/viewform?usp=sharing&ouid=103863843545359943443" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">お問い合わせ</a>
                    <a href="release-notes.html${window.location.search}" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">リリースノート</a>
                    <div class="border-t pt-4 mt-2">
                         <a href="https://qcda-dev.github.io/HP/" target="_blank" class="text-lg text-gray-700 hover:bg-gray-100 p-3 rounded-md transition-colors">QcDa Projectとは</a>
                    </div>
                </div>
            </div>
            <div class="absolute bottom-4 left-6 text-sm text-gray-400">ver 3.1.0</div>
        </nav>
    `;
    document.body.prepend(headerContainer);

    // メニューの開閉ロジック
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    function toggleMenu() {
        sideMenu.classList.toggle('translate-x-full');
        menuOverlay.classList.toggle('hidden');
    }

    menuButton.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
}

/**
 * 共通のフッターを生成する
 */
function createCommonFooter() {
    const footer = document.createElement('footer');
    footer.className = 'text-center py-4 mt-auto';
    footer.innerHTML = `<p class="text-xs text-gray-500">&copy; 2025 QcDa Project. All Rights Reserved.</p>`;
    // #appコンテナがあることを前提とする
    const appContainer = document.getElementById('app');
    if(appContainer) {
        appContainer.appendChild(footer);
    }
}


// --- ページの初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    createCommonHeader();
    createCommonFooter();
});

