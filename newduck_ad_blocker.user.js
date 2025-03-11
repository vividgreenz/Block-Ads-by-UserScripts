// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  newduck.net 사이트의 모든 광고 영역 차단 (게시판 및 게시글 페이지)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 간소화된 광고 차단 스크립트 (성능 최적화)
    
    // 중요 콘텐츠를 나타내는 선택자 목록 (보존할 요소들)
    const preserveSelectors = [
        // 게시판 및 게시글 관련 필수 요소
        '.board_list', '.board_read', '.board_content', '.board_header',
        '.document_list', '.document', '.articleList', '.article', '.board',
        
        // 사이트 레이아웃 필수 요소
        '.sl-header', '.sl-footer', '.sl-body', '.sl-content', 
        '.sl-footer-body', '.sl-card', '.sl-category',
        
        // 테이블 요소
        'table', 'tr', 'td', '.board_table', '.list_table'
    ];
    
    // 광고 컨테이너 선택자 목록
    const adSelectors = [
        // 구글 광고 컨테이너
        '#ad-container', 'div[id^="aswift_"][id$="_host"]',
        'div.google-auto-placed', 'ins.adsbygoogle',
        '[data-ad-client]', '[data-adsbygoogle-status]',
        
        // 파워링크 광고 관련 컨테이너
        '#powerLink', '#powerLink1', '.powerlink', '.toplink', '.powerlink_list',
        
        // 하단 배너 광고 컨테이너
        '.custom-banner', 'aside.custom-cul-banner', '#content_bottom_link',
        '.custom-image-container', 'p[style*="text-align: center"] span[style*="color:#ff6699"]',
        
        // 기타 광고 컨테이너
        '.adfit', 'div[id^="div-gpt-ad"]'
    ];
    
    // 안전한 방식으로 광고 요소 제거
    function removeAds() {
        // 1. 일반 광고 컨테이너 제거
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 보존해야 할 중요 요소의 자식인지 확인
                    if (isPreservedElement(element)) return;
                    
                    // 광고 컨테이너 제거 처리
                    hideElement(element);
                });
            } catch (e) {
                // 오류 무시
            }
        });
        
        // 2. 광고 iframe 처리
        try {
            const adIframes = document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"]');
            adIframes.forEach(frame => {
                if (frame.parentElement && !isPreservedElement(frame.parentElement)) {
                    hideElement(frame.parentElement);
                } else {
                    hideElement(frame);
                }
            });
        } catch (e) {
            // 오류 무시
        }
        
        // 3. 특정 컨테이너 처리
        try {
            // 광고 컨테이너 제거
            const adContainers = document.querySelectorAll('#ad-container');
            adContainers.forEach(container => {
                if (!isPreservedElement(container)) {
                    hideElement(container);
                    
                    // 부모 요소도 확인하여 제거
                    if (container.parentElement && !isPreservedElement(container.parentElement)) {
                        hideElement(container.parentElement);
                    }
                }
            });
            
            // 하단 배너 광고 제거
            const customBanners = document.querySelectorAll('aside.custom-cul-banner, .custom-banner');
            customBanners.forEach(banner => {
                if (!isPreservedElement(banner)) {
                    hideElement(banner);
                    
                    // 관련된 다음 요소가 텍스트 컨테이너인 경우 그것도 제거
                    const nextElement = banner.nextElementSibling;
                    if (nextElement && nextElement.tagName === 'P' && 
                        !isPreservedElement(nextElement)) {
                        hideElement(nextElement);
                    }
                }
            });
        } catch (e) {
            // 오류 무시
        }
    }
    
    // 요소를 숨기는 심플한 함수
    function hideElement(element) {
        if (!element || !element.style) return;
        if (element.dataset.adBlockerRemoved === 'true') return;
        
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.height = '0px';
        element.style.margin = '0px';
        element.style.padding = '0px';
        element.dataset.adBlockerRemoved = 'true';
    }
    
    // 요소가 보존해야 할 중요 콘텐츠인지 확인하는 함수
    function isPreservedElement(element) {
        if (!element) return false;
        
        // 빠른 클래스 체크
        if ((element.className && 
            typeof element.className === 'string' && 
            (element.className.includes('sl-footer') || 
             element.className.includes('board_list') ||
             element.className.includes('sl-header')))) {
            return true;
        }
        
        // 캐싱된 결과 재사용
        if (element.dataset.adBlockerChecked === 'true') {
            return element.dataset.isPreserved === 'true';
        }
        
        // 현재 요소가 보존 대상 선택자와 일치하는지 확인
        for (const selector of preserveSelectors) {
            try {
                if (element.matches && element.matches(selector)) {
                    element.dataset.adBlockerChecked = 'true';
                    element.dataset.isPreserved = 'true';
                    return true;
                }
            } catch (e) {
                // 선택자 일치 오류 무시
            }
        }
        
        // 클래스나 ID로 중요 요소 판단
        if (element.id) {
            const id = element.id.toLowerCase();
            if (id.includes('content') || id.includes('board') || id.includes('list')) {
                element.dataset.adBlockerChecked = 'true';
                element.dataset.isPreserved = 'true';
                return true;
            }
        }
        
        if (element.className && typeof element.className === 'string') {
            const className = element.className.toLowerCase();
            if (className.includes('content') || className.includes('board') || 
                className.includes('list') || className.includes('footer')) {
                element.dataset.adBlockerChecked = 'true';
                element.dataset.isPreserved = 'true';
                return true;
            }
        }
        
        // 부모가 보존 대상인지는 체크하지 않음 (성능 이슈 방지)
        
        element.dataset.adBlockerChecked = 'true';
        element.dataset.isPreserved = 'false';
        return false;
    }
    
    // 초기화 및 실행
    function init() {
        // 페이지 로드 시 실행
        window.addEventListener('load', function() {
            setTimeout(removeAds, 500);
        });
        
        // DOMContentLoaded 시에도 실행
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(removeAds, 100);
        });
        
        // 지연 실행
        setTimeout(removeAds, 1000);
        setTimeout(removeAds, 2000);
    }
    
    // 스크립트 실행
    init();
})(); 