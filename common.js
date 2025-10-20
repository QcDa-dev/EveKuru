/**
 * =================================================================
 * EveKuru フロントエンド 共通スクリプト (common.js)
 * =================================================================
 */

// --- グローバル定数 ---
// 【重要】GASを「新しいデプロイ」で再発行したURLに必ず置き換えてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw_uoAzQx99fw9J0vX8IYmKRI_l7KEmpsmNnjPG9AUjUkMsgcem_OZa8c3XgqWNdAzI/exec';

// --- UI制御 ---
function showLoader() { document.getElementById('loader')?.classList.remove('hidden'); }
function hideLoader() { document.getElementById('loader')?.classList.add('hidden'); }
function showMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = isError 
    ? 'p-3 rounded-lg text-red-700 bg-red-100' 
    : 'p-3 rounded-lg text-green-700 bg-green-100';
  setTimeout(() => { el.innerHTML = ''; }, 5000);
}

// --- API通信 (JSONP) ---
async function callGasApi(payload) {
  showLoader();
  try {
    const event = new URLSearchParams(window.location.search).get('event') || 'default';
    const finalPayload = { ...payload, event };
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    const encodedPayload = encodeURIComponent(JSON.stringify(finalPayload));
    const url = `${GAS_API_URL}?callback=${callbackName}&payload=${encodedPayload}`;
    
    return await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = callbackName;
      
      window[callbackName] = (result) => {
        document.head.removeChild(script);
        delete window[callbackName];
        resolve(result);
      };
      
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('API request failed.'));
      };

      script.src = url;
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: error.message };
  } finally {
    hideLoader();
  }
}

// --- 共通UI生成 ---
function createCommonUI() {
    const headerHTML = `
    <header class="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
      <div class="max-w-md mx-auto flex justify-between items-center p-4">
        <a href="index.html" class="text-2xl font-bold text-primary">EveKuru</a>
        <button id="menu-button" class="p-2 z-50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-600">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>`;
  
    const menuHTML = `
    <div id="menu-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"></div>
    <div id="side-menu" class="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform translate-x-full transition-transform duration-300">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-primary mb-8">Menu</h2>
        <nav class="flex flex-col space-y-4">
          <a href="guide.html" target="_blank" class="text-lg text-gray-700 hover:text-primary transition-colors">使い方ガイド</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSckrrhDeGQajywfDx9mnGqzDiT1fUPevqi32mAK1JjutlFSlw/viewform" target="_blank" class="text-lg text-gray-700 hover:text-primary transition-colors">お問い合わせ</a>
          <a href="release-notes.html" class="text-lg text-gray-700 hover:text-primary transition-colors">リリースノート</a>
          <div class="border-t pt-4 mt-2">
            <a href="https://qcda-dev.github.io/HP/" target="_blank" class="text-lg text-gray-700 hover:text-primary transition-colors">QcDa Projectとは</a>
          </div>
        </nav>
      </div>
      <div class="absolute bottom-4 left-6 text-sm text-gray-400">ver 4.1.0</div>
    </div>`;

    const footerHTML = `
    <footer class="text-center py-4">
      <p class="text-xs text-gray-500">&copy; 2025 QcDa Project. All Rights Reserved.</p>
    </footer>`;

    const loaderHTML = `
    <div id="loader" class="loader-container hidden">
      <div class="loader-spinner"></div>
    </div>`;

    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    const mainWrapper = document.querySelector('.min-h-screen.flex.flex-col');
    if (mainWrapper) {
        mainWrapper.insertAdjacentHTML('afterbegin', headerHTML + menuHTML);
        mainWrapper.insertAdjacentHTML('beforeend', footerHTML);
    }

    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        sideMenu.classList.toggle('translate-x-full');
        menuOverlay.classList.toggle('hidden');
    };

    if(menuButton && sideMenu && menuOverlay) {
        menuButton.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);
    }
}

// --- ページ初期化エントリーポイント ---
function initCommonPage(pageSpecificInit) {
    // DOMが読み込まれた後に全ての処理を開始する
    document.addEventListener('DOMContentLoaded', () => {
        createCommonUI();
        if (pageSpecificInit && typeof pageSpecificInit === 'function') {
            pageSpecificInit();
        }
    });
}

export { initCommonPage, callGasApi, showMessage };

