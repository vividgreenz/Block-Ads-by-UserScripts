// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리
// @namespace    http://tampermonkey.net/
// @version      5.0
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const fix = () => {
        // 1. 첨부파일 복구
        document.querySelectorAll('.view_file_download').forEach(el => {
            el.classList.remove('google-ads', 'ad-banner', 'adbox');
            el.setAttribute('style',
                'display:block!important;' +
                'visibility:visible!important;' +
                'opacity:1!important;' +
                'height:auto!important;' +
                'overflow:visible!important;'
            );
        });

        // 2. 태그 두 번째 줄부터 숨김
        document.querySelectorAll('.tags-item').forEach(container => {
            let hiding = false;
            Array.from(container.children).forEach(el => {
                if (el.classList && el.classList.contains('tags-line')) {
                    hiding = true;
                }
                if (hiding) {
                    el.setAttribute('style', 'display:none!important;');
                }
            });
        });
    };

    // 즉시 한 번 실행
    fix();

    // 10초간 0.2초마다 계속 덮어쓰기 (사이트 스크립트가 언제 복원하든 우리가 이김)
    let count = 0;
    const timer = setInterval(() => {
        fix();
        if (++count >= 50) clearInterval(timer);
    }, 200);

})();
