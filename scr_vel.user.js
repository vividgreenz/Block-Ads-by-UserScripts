// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 첫 줄 표시
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  첨부파일 광고 클래스 제거 및 태그 리스트 첫 줄만 남기기
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 1. 태그 선택 영역: 첫 번째 줄만 남기고 나머지 숨김 (CSS 주입)
    // 자바스크립트 실행 타이밍과 무관하게 브라우저가 알아서 숨기도록 CSS를 덮어씌웁니다.
    const style = document.createElement('style');
    style.innerHTML = `
        /* 첫 번째 태그 구분선(.tags-line)과 그 뒤에 오는 모든 요소를 강제로 숨김 */
        .tags-item[data-toggle="buttons"] .tags-line,
        .tags-item[data-toggle="buttons"] .tags-line ~ * {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2. 페이지 로딩 후 애드블록이 숨긴 요소에서 '광고 이름표'만 떼어냅니다.
    const fixAttachments = () => {
        // view_file_download(첨부파일) 클래스를 가진 모든 요소를 찾음
        const files = document.querySelectorAll('.view_file_download');
        
        files.forEach(file => {
            // 애드블록이 발작하는 원인인 3개의 클래스만 정확히 삭제
            file.classList.remove('google-ads', 'ad-banner', 'adbox');
            
            // CSS 우선순위 문제로 혹시 씹힐 경우를 대비해 강제 표시 속성 추가
            file.style.setProperty('display', 'block', 'important');
            file.style.setProperty('visibility', 'visible', 'important');
        });
    };

    // 스크립트 실행 타이밍을 맞추기 위해 0.5초 간격으로 3번 정도 찔러봅니다.
    let attempts = 0;
    let interval = setInterval(() => {
        fixAttachments();
        attempts++;
        if(attempts >= 3) clearInterval(interval);
    }, 500);

})();
