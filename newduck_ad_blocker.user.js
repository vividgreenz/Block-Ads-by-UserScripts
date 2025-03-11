// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  newduck.net 사이트의 명확한 광고만 차단 (광고 외 콘텐츠는 보존)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 명확한 광고만 차단하는 간단한 스크립트
    
    // 명확한 광고 선택자만 포함 (확실한 광고만)
    const clearAdSelectors = [
        // 구글 광고
        'ins.adsbygoogle',
        'div[id^="aswift_"][id$="_host"]',
        'div[id^="google_ads_iframe_"]',
        'iframe[id^="google_ads_iframe_"]',
        'div.google-auto-placed',
        
        // 뉴덕 사이트 특정 광고
        '#ad-container',
        '.custom-banner',
        'aside.custom-cul-banner',
        '#content_bottom_link',
        
        // 푸드페스타 광고 (명확하게 식별 가능)
        'p:has(span[style*="color:#ff6699"])',
        'p[style*="text-align: center"]:has(span[style*="color:#ff6699"])'
    ];
    
    // 광고만 제거하는 함수
    function removeOnlyAds() {
        for (const selector of clearAdSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    elements.forEach(element => {
                        element.style.display = 'none';
                        element.style.height = '0px';
                        element.style.margin = '0px';
                        element.style.overflow = 'hidden';
                        element.style.padding = '0px';
                    });
                }
            } catch (e) {
                // 선택자 오류 무시
            }
        }
        
        // 추가: 구글 광고 iframes 처리
        document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"]').forEach(frame => {
            if (frame && frame.parentElement) {
                frame.parentElement.style.display = 'none';
                frame.parentElement.style.height = '0px';
            }
        });
    }
    
    // 초기화 및 실행
    function init() {
        // 페이지 로드 시 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeOnlyAds);
        } else {
            removeOnlyAds();
        }
        
        // 페이지 완전히 로드된 후 한번 더 실행
        window.addEventListener('load', removeOnlyAds);
        
        // 1초, 3초 후 지연 실행 (늦게 로드되는 광고 처리)
        setTimeout(removeOnlyAds, 1000);
        setTimeout(removeOnlyAds, 3000);
    }
    
    // 스크립트 실행
    init();
})(); 