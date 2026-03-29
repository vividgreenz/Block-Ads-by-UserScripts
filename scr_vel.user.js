// ==UserScript==
// @name         첨부파일 영역 복구 (모든 사이트 적용)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  첨부파일 영역에 고의로 섞어둔 광고 클래스를 제거하여 화면에 다시 표시합니다.
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.textContent = '.view_file_download { display: block !important; visibility: visible !important; }';
    document.head.appendChild(style);

    document.querySelectorAll('.view_file_download').forEach(el => {
        el.classList.remove('google-ads', 'ad-banner', 'adbox');
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
    });
})();
