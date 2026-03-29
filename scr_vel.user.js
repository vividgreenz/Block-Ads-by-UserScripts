// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리 (깜빡임 제거)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  애드블록 깜빡임 없이 첨부파일 복구 및 태그 첫 줄만 남기기
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 브라우저가 화면을 그리기 전에 강력한 CSS를 먼저 주입합니다. (깜빡임 방지 & 태그 숨김)
    // GM_addStyle을 사용하면 사이트 보안(CSP)을 우회하여 무조건 적용됩니다.
    GM_addStyle(`
        /* 파일 첨부 영역 강제 표시 (애드블록이 숨기기도 전에 덮어씌움) */
        .view_file_download {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
        }
        
        /* 태그 첫 번째 줄바꿈(.tags-line)과 그 밑에 오는 모든 태그를 강제로 숨김 */
        .tags-item[data-toggle="buttons"] .tags-line,
        .tags-item[data-toggle="buttons"] .tags-line ~ * {
            display: none !important;
        }
    `);

    // 2. DOM이 생성되는 즉시 실시간으로 감시해서 애드블록 클래스 이름 떼어내기 (옵저버 패턴)
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === 1) { // 요소 노드일 경우만
                    // 방금 추가된 요소 자체가 첨부파일인 경우
                    if (node.classList && node.classList.contains('view_file_download')) {
                        node.classList.remove('google-ads', 'ad-banner', 'adbox');
                    }
                    // 방금 추가된 요소의 하위에 첨부파일이 있는 경우
                    else if (node.querySelectorAll) {
                        const files = node.querySelectorAll('.view_file_download');
                        files.forEach(file => {
                            file.classList.remove('google-ads', 'ad-banner', 'adbox');
                        });
                    }
                }
            }
        }
    });

    // 문서 로딩이 시작되자마자 실시간 감시 시작
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 페이지 로딩이 완료되면 실시간 감시를 종료하여 컴퓨터 자원(CPU) 낭비 방지
    window.addEventListener('DOMContentLoaded', () => {
        // 혹시 놓친 게 있는지 마지막으로 한 번 더 확인
        const files = document.querySelectorAll('.view_file_download');
        files.forEach(file => file.classList.remove('google-ads', 'ad-banner', 'adbox'));
        
        // 감시 종료
        observer.disconnect();
    });

})();
