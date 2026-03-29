// ==UserScript==
// @name         첨부파일 영역 복구 및 태그 정리
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  첨부파일 복구 (깜빡임 방지) + 태그 첫 줄만 표시
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 파일 복구 (언더바 있는 것, 없는 것 둘 다 잡음)
    const showFile = (el) => {
        if (!el || !el.classList) return;
        if (el.classList.contains('view_file_download') || el.classList.contains('viewfiledownload')) {
            el.classList.remove('google-ads', 'ad-banner', 'adbox');
            el.style.setProperty('display', 'block', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('height', 'auto', 'important');
        }
    };

    // 태그 첫 줄만 남기기 (CSS 없이 JS inline style로 직접 처리)
    const hideTags = () => {
        document.querySelectorAll('.tags-item').forEach(container => {
            let hiding = false;
            Array.from(container.children).forEach(el => {
                if (el.classList && el.classList.contains('tags-line')) hiding = true;
                if (hiding) el.style.setProperty('display', 'none', 'important');
            });
        });
    };

    // MutationObserver: DOM 추가 및 class/style 속성 변경을 실시간 감시
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                // 파일 요소 처리
                showFile(node);
                if (node.querySelectorAll) {
                    node.querySelectorAll('.view_file_download, .viewfiledownload').forEach(showFile);
                }
                // tags-item 내부에 변화가 생겼으면 태그 재처리
                if (node.closest && node.closest('.tags-item')) hideTags();
                if (node.querySelectorAll) node.querySelectorAll('.tags-item').forEach(() => hideTags());
            }
            // 애드블록이 나중에 class나 style을 수정할 때 즉시 반격
            if (mutation.type === 'attributes') showFile(mutation.target);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });

    // DOM 완성 후 태그 정리 (간격을 두고 여러 번 실행)
    window.addEventListener('DOMContentLoaded', () => {
        hideTags();
        setTimeout(hideTags, 300);
        setTimeout(hideTags, 700);
        setTimeout(hideTags, 1200);
    });

    // 완전 로딩 후 마무리 & 옵저버 종료
    window.addEventListener('load', () => {
        document.querySelectorAll('.view_file_download, .viewfiledownload').forEach(showFile);
        hideTags();
        observer.disconnect();
    });

})();
