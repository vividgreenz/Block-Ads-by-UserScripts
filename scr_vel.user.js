// ==UserScript==
// @name         첨부파일 영역 복구 + 태그 필터
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  첨부파일/링크 복구 및 특정 태그 글 숨김
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 첨부파일 + 링크 복구
    const style = document.createElement('style');
    style.textContent = `
        .view_file_download { display: block !important; visibility: visible !important; }
        .view_link_item { display: block !important; visibility: visible !important; }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.view_file_download, .view_link_item').forEach(el => {
        el.classList.remove('google-ads', 'ad-banner', 'adbox', 'adlink');
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
    });

    // 태그 필터 (숨길 키워드 목록)
    const hideKeywords = ['만화'];

    document.querySelectorAll('#list-body li').forEach(li => {
        const font = li.querySelector('div.wr-subject a font');
        if (font && hideKeywords.some(keyword => font.textContent.includes(keyword))) {
            li.style.setProperty('display', 'none', 'important');
        }
    });

})();
