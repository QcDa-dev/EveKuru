/**
 * 共通UIの初期化とGAS APIの呼び出し関数
 */

// --- Configuration ---
// !!!【重要】!!! デプロイしたGASウェブアプリのURLに必ず置き換えてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzLKle5sOfzZakkhHIsPECeEp5IavsRIvTfsv_AZWP3c9PXW-ChMuWUhtuOD_rwQhxP/exec'; 

/**
 * URLからクエリパラメータを取得する
 * @param {string} name - パラメータ名
 * @return {string | null} パラメータの値
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// --- API Call Helper ---
export async function callGasApi(action, payload = {}) {
    // URLからイベント識別子を取得
    const attribute = getQueryParam('event');
    if (!attribute) {
        throw new Error('イベントが指定されていません。URLに ?event=<イベント名> を追加してください。');
    }

    // ペイロードにイベント識別子を追加
    const fullPayload = {
        action,
        attribute,
        ...payload
    };

    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(fullPayload),
            redirect: 'follow'
        });
        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'API request failed');
        }
        return result.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- Common UI Initialization ---
export function initCommonUI(appName) {
    const header = document.getElementById('app-header');
    const footer = document.querySelector('.app-footer');
    const body = document.body;

    // --- Header ---
    if (header) {
        const eventId = getQueryParam('event') || 'Event';
        header.innerHTML = `
            <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                <a href="index.html?event=${eventId}" class="text-xl font-bold text-primary">${appName}</a>
                <button id="menu-btn" class="text-gray-600 focus:outline-none z-50">
                    <i class="fas fa-bars fa-lg"></i>
                </button>
            </div>
        `;
    }

    // --- Footer ---
    if (footer) {
        footer.innerHTML = `
            <p>&copy; 2025 QcDa Project. All Rights Reserved.</p>
        `;
    }

    // --- Hamburger Menu ---
    const menuHTML = `
        <div id="menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"></div>
        <nav id="side-menu" class="fixed top-0 right-0 h-full bg-white w-64 shadow-lg p-6 z-50 transform translate-x-full transition-transform duration-300 ease-in-out">
            <ul class="space-y-4">
                <li><a href="guide.html" target="_blank" class="menu-link">使い方ガイド</a></li>
                <li><a href="#" id="contact-link" class="menu-link">お問い合わせ</a></li>
                <li><a href="release-notes.html" target="_blank" class="menu-link">リリースノート</a></li>
                <li class="border-t pt-4 mt-4"></li>
                <li><a href="https://qcda-dev.github.io/HP/" target="_blank" class="menu-link">QcDa Projectとは</a></li>
            </ul>
            <p class="absolute bottom-4 right-4 text-xs text-gray-400">ver 1.1.0</p>
        </nav>
    `;
    body.insertAdjacentHTML('beforeend', menuHTML);
    
    // --- Menu Event Listeners ---
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        sideMenu.classList.toggle('translate-x-full');
        menuOverlay.classList.toggle('hidden');
    };

    if(menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if(menuOverlay) menuOverlay.addEventListener('click', toggleMenu);
    
    // お問い合わせリンクはダミー
    const contactLink = document.getElementById('contact-link');
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('お問い合わせ先のURLを後で設定します。');
        });
    }
}

