// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  뉴덕 사이트의 광고만 정확히 차단 (콘텐츠는 유지)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 안전하게 광고만 차단하는 스크립트
    
    // 처리된 요소 추적
    const processedElements = new Set();
    
    // 명확한 광고 선택자 (절대적으로 확실한 광고만)
    const adSelectors = [
        // 구글 광고 관련
        'ins.adsbygoogle',
        'div[id^="aswift_"][id$="_host"]',
        'div[id^="google_ads_iframe_"]',
        'iframe[id^="google_ads_iframe_"]',
        
        // 뉴덕 특정 광고
        '#ad-container', 
        '.custom-banner',
        'aside.custom-cul-banner',
        '#content_bottom_link'
    ];
    
    // 색상 기반 광고 (푸드페스타 등) - 이것만 별도로 처리
    const colorBasedAdSelectors = [
        'p:has(span[style*="color:#ff6699"])',
        'p[style*="text-align: center"]:has(span[style*="color:#ff6699"])'
    ];
    
    // 광고 iframe URL 패턴
    const adIframePatterns = ['googleads', 'doubleclick'];
    
    // 절대 건드리면 안 되는 중요 선택자
    const criticalSelectors = [
        '.sl-content', '.sl-body', '.board_list', 
        '#wrapper', '#container', '#content'
    ];
    
    // 광고 요소 숨기기 함수
    function hideAdElement(element) {
        // 이미 처리한 요소는 건너뛰기
        if (processedElements.has(element)) return;
        
        // 중요 요소인지 확인
        for (const selector of criticalSelectors) {
            try {
                if (element.matches(selector)) return;
            } catch (e) {}
        }
        
        // 요소 숨기기
        element.style.display = 'none';
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.margin = '0px';
        element.style.padding = '0px';
        
        // 처리된 요소로 표시
        processedElements.add(element);
    }
    
    // 광고만 제거하는 함수
    function removeOnlyAds() {
        // 명확한 광고 제거
        adSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    if (!processedElements.has(element)) {
                        hideAdElement(element);
                    }
                });
            } catch (e) {}
        });
        
        // 색상 기반 광고 (푸드페스타 등) - 별도 처리
        colorBasedAdSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    if (!processedElements.has(element)) {
                        hideAdElement(element);
                    }
                });
            } catch (e) {}
        });
        
        // 광고 iframe 처리
        try {
            const iframes = document.getElementsByTagName('iframe');
            for (let i = 0; i < iframes.length; i++) {
                const frame = iframes[i];
                
                // 이미 처리한 iframe은 건너뛰기
                if (processedElements.has(frame)) continue;
                
                // 광고 iframe인지 확인
                const src = frame.src || '';
                const isAdIframe = adIframePatterns.some(pattern => src.includes(pattern));
                
                if (isAdIframe && frame.parentElement) {
                    hideAdElement(frame.parentElement);
                }
            }
        } catch (e) {}
    }
    
    // 안전한 실행 함수
    function safeExecute() {
        try {
            removeOnlyAds();
        } catch (e) {
            console.error("광고 차단 중 오류 발생:", e);
        }
    }
    
    // 초기화 및 실행
    function init() {
        // 페이지 로드 시 한 번만 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', safeExecute);
        } else {
            safeExecute();
        }
        
        // 페이지 완전히 로드된 후 한 번 더 실행
        window.addEventListener('load', function() {
            // 로드 직후 실행
            safeExecute();
            
            // 2초 후 마지막으로 한 번 더 실행 (지연 로드 광고용)
            setTimeout(safeExecute, 2000);
        });
    }
    
    // 스크립트 실행
    init();
})(); 