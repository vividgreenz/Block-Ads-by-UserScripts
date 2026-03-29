// ==UserScript==
// @name         첨부파일 영역 복구 (모든 사이트 적용)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  첨부파일 영역에 고의로 섞어둔 광고 클래스를 제거하여 화면에 다시 표시합니다.
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // CSS로 강제 표시 (애드가드보다 빠르게, 페이지 로딩 시작부터 적용)
    const style = document.createElement('style');
    style.textContent = '.view_file_download { display: block !important; visibility: visible !important; }';
    document.documentElement.appendChild(style);

    // 혹시 클래스 제거도 필요할 경우를 위해 DOM 감시
    const observer = new MutationObserver(() => {
        document.querySelectorAll('.view_file_download').forEach(el => {
            el.classList.remove('google-ads', 'ad-banner', 'adbox');
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    });
})();
