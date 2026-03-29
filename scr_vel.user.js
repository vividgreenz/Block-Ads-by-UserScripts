// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리
// @namespace    http://tampermonkey.net/
// @version      7.0
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const fixFile = (el) => {
        el.classList.remove('google-ads', 'ad-banner', 'adbox');
        el.setAttribute('style',
            'display:block!important;visibility:visible!important;' +
            'opacity:1!important;height:auto!important;'
        );
    };

    const fixTags = () => {
        const tagDiv = document.querySelector('#tags_1 > div');
        if (!tagDiv) return;
        Array.from(tagDiv.children).forEach((el, i) => {
            if (i >= 6) el.setAttribute('style', 'display:none!important;');
        });
    };

    const fixAll = () => {
        // 언더바 없는 viewfiledownload 가 정확한 클래스명
        document.querySelectorAll('.viewfiledownload').forEach(fixFile);
        fixTags();
    };

    fixAll();

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                const el = m.target;
                if (el.classList && el.classList.contains('viewfiledownload')) {
                    fixFile(el);
                }
            }
            if (m.type === 'childList') fixAll();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    setTimeout(() => observer.disconnect(), 10000);

})();
