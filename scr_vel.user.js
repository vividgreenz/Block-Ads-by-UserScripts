// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리 (종결판)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  애드블록 충돌 완벽 해결 및 첫 번째 태그 그룹만 표시
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 브라우저 렌더링 전에 뼈대부터 강제로 고정하는 CSS 주입
    // 사이트의 안티 애드블록 스크립트보다 무조건 먼저, 강력하게(important) 적용됩니다.
    GM_addStyle(`
        /* 1. 파일 첨부 영역 복구 (깜빡임 없이 즉시 표시) */
        /* 사이트에서 사용하는 구글 광고 클래스를 포함하더라도 무조건 보여주게 만듭니다 */
        .view_file_download,
        .view_file_download.google-ads,
        .view_file_download.ad-banner,
        .view_file_download.adbox {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            position: static !important;
            overflow: visible !important;
        }
        
        /* 2. 태그 리스트 첫 줄(첫 번째 그룹)만 남기기 */
        /* 첫 번째 .tags-line 이후에 나오는 모든 .tags-line과 라벨(태그)들을 강제로 숨김 */
        .tags-item[data-toggle="buttons"] .tags-line ~ .tags-line,
        .tags-item[data-toggle="buttons"] .tags-line ~ label,
        .tags-item[data-toggle="buttons"] .tags-line ~ br {
            display: none !important;
        }
    `);

    // 만약에 대비해, 문서 로드 완료 후 애드블록이 클래스를 덧씌웠을 때를 대비한 안전장치
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.view_file_download').forEach(file => {
            file.classList.remove('google-ads', 'ad-banner', 'adbox', 'adsbygoogle');
        });
    });

})();
