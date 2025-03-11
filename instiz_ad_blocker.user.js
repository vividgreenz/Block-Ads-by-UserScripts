// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  인스티즈 사이트의 광고를 차단하는 스크립트 (수정버전)
// @author       AI Assistant
// @match        https://www.instiz.net/*
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // CSS 스타일을 이용한 광고 차단 (uBlock Origin 필터와 동일한 효과)
    const hideElements = `
        /* 확실한 광고 요소만 선택적으로 숨김 */
        #sense14,
        .between_house.content,
        div[id^="div-gpt-ad"],
        iframe[src*="adsense"],
        iframe[src*="ad.doubleclick"],
        img[src*="ad.doubleclick"],
        a[href*="ad.doubleclick"],
        ins.adsbygoogle
    {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }`;
    
    // 스타일 요소 생성 및 삽입
    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.documentElement.appendChild(style);
    }
    
    // DOM이 로드되기 전에 스타일 적용 (빠른 차단)
    addStyle(hideElements);
    
    // 안전하게 광고 숨기기 (제거하지 않고 숨기기만 함)
    function hideAds() {
        // 확실한 광고 요소만 대상으로 함
        const adSelectors = [
            '#sense14',                       // 광고 컨테이너
            '.between_house.content',         // 광고 콘텐츠 영역
            'div[id^="div-gpt-ad"]',          // Google Publisher Tag 광고
            'iframe[src*="adsense"]',         // Google AdSense 광고
            'iframe[src*="ad.doubleclick"]',  // DoubleClick 광고
            'img[src*="ad.doubleclick"]',     // DoubleClick 이미지 광고
            'a[href*="ad.doubleclick"]',      // DoubleClick 링크 광고
            'ins.adsbygoogle'                 // Google AdSense 광고
        ];
        
        // 각 선택자에 해당하는 모든 요소 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // 제거하지 않고 숨기기만 함
                        element.style.display = 'none';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                        element.style.pointerEvents = 'none';
                        // 콘텐츠 공간 차지하지 않도록 함
                        element.style.position = 'absolute';
                        element.style.width = '0';
                        element.style.height = '0';
                        element.style.overflow = 'hidden';
                    }
                });
            } catch (e) {
                // 오류 발생 시 무시하고 계속 진행
                console.log('광고 숨기기 중 오류 발생:', e.message);
            }
        });
        
        // 기존 필터 중 문제가 없는 것들만 조심스럽게 적용
        const safeSelectors = [
            '.notice:not(.important)',       // 중요하지 않은 공지사항만 
            '#swiper-container-fantime-latest > .swiper-wrapper:not(.important-content)'
        ];
        
        safeSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.style.display = 'none';
                    }
                });
            } catch (e) {
                console.log('선택적 숨기기 중 오류 발생:', e.message);
            }
        });
    }
    
    // 동적으로 추가되는 광고를 감지하기 위한 MutationObserver 설정
    function setupObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldHide = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    shouldHide = true;
                }
            });
            
            if (shouldHide) {
                hideAds();
            }
        });
        
        // body 요소가 로드되면 변화 감지 시작
        if (document.body) {
            observer.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
        } else {
            // body가 아직 없으면 로드될 때까지 대기
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            });
        }
    }
    
    // 스크립트 초기화 함수
    function init() {
        // 광고 숨기기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                hideAds();
                setupObserver(); // 동적 광고 감지를 위해 다시 추가
            });
        } else {
            hideAds();
            setupObserver(); // 동적 광고 감지를 위해 다시 추가
        }
        
        // 페이지가 완전히 로드된 후 한 번 더 실행 (지연 로드된 광고 대응)
        window.addEventListener('load', hideAds);
        
        // 2초 후 한 번 더 실행 (늦게 로드되는 광고 대응)
        setTimeout(hideAds, 2000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 