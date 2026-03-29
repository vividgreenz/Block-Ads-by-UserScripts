// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리
// @namespace    http://tampermonkey.net/
// @version      6.1
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
        document.querySelectorAll('.view_file_download').forEach(fixFile);
        fixTags();
    };

    // 즉시 실행
    fixAll();

    // style 속성이 제거되거나 변경되면 즉시 재적용
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'attributes') {
                const el = m.target;
                if (el.classList && el.classList.contains('view_file_download')) {
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

    // 10초 후 옵저버 종료
    setTimeout(() => observer.disconnect(), 10000);

})();
