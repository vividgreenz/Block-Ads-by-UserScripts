// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리 (모든 사이트 적용)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  첨부파일 광고 클래스 제거 및 태그 리스트 첫 줄만 남기기
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const fixElements = () => {
        // 1. 첨부파일 영역 복구
        const files = document.querySelectorAll('.view_file_download');
        files.forEach(file => {
            file.classList.remove('google-ads', 'ad-banner', 'adbox');
            file.style.setProperty('display', 'block', 'important');
            file.style.setProperty('visibility', 'visible', 'important');
            file.style.setProperty('opacity', '1', 'important');
        });

        // 2. 태그 선택 영역: 첫 번째 줄만 남기고 나머지 숨김
        const tagContainer = document.querySelector('.tags-item[data-toggle="buttons"]');
        if (tagContainer) {
            let passedFirstLine = false;
            
            // childNodes 대신 children을 써야 텍스트(공백) 에러가 나지 않습니다.
            Array.from(tagContainer.children).forEach(el => {
                // tags-line을 만나는 순간부터 숨김 처리 시작
                if (el.classList.contains('tags-line')) {
                    passedFirstLine = true;
                }
                
                // 첫 번째 줄바꿈 요소와 그 밑의 모든 요소 숨김
                if (passedFirstLine) {
                    el.style.setProperty('display', 'none', 'important');
                }
            });
        }
    };

    // 즉시 한 번 실행
    fixElements();

    // 혹시 모를 지연 로딩(AJAX 등)을 대비해 0.5초 간격으로 10번(5초간) 넉넉하게 찔러줍니다.
    let attempts = 0;
    let interval = setInterval(() => {
        fixElements();
        attempts++;
        if (attempts >= 10) clearInterval(interval);
    }, 500);

})();
