// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  인스티즈 사이트의 광고를 차단하는 스크립트 (공간 제거 버전)
// @author       AI Assistant
// @match        https://www.instiz.net/*
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // CSS 스타일을 이용한 광고 차단 (공간까지 완전히 제거)
    const hideElements = `
        /* 확실한 광고 요소와 컨테이너 완전히 제거 */
        #sense14,
        .between_house.content,
        div[id^="div-gpt-ad"],
        ins.adsbygoogle,
        iframe[src*="adsense"],
        iframe[src*="ad.doubleclick"],
        img[src*="ad.doubleclick"],
        a[href*="ad.doubleclick"],
        div.notice,
        td > div[style*="height:100px"],
        div[style*="height:100px"][style*="padding:20px"],
        div[style*="min-height:250px"][style*="padding:25px"]
    {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        overflow: hidden !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        width: 0 !important;
    }
    
    /* 광고 컨테이너의 부모 요소 높이값 제거 */
    [style*="height"][style*="padding"] > ins.adsbygoogle,
    [style*="height"] > ins.adsbygoogle
    {
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }
    
    /* 테이블 셀 안의 광고 공간 제거 */
    td[style*="padding"][style*="line-height"][style*="text-align:center"]
    {
        height: 0 !important;
        padding: 0 !important;
        line-height: 0 !important;
    }
    
    /* 빈 공간으로 남는 광고 관련 컨테이너 제거 */
    td > div[style*="width:100%"][style*="height:100px"],
    div[style*="width:100%"][style*="height:100px"],
    div[style*="margin:0 auto"][style*="min-height:250px"]
    {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }`;
    
    // 스타일 요소 생성 및 삽입
    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.documentElement.appendChild(style);
    }
    
    // DOM이 로드되기 전에 스타일 적용 (빠른 차단)
    addStyle(hideElements);
    
    // 안전하게 광고 숨기기 (공간까지 완전히 제거)
    function hideAds() {
        // 정확한 광고 요소 대상
        const adSelectors = [
            // 일반 광고 선택자
            '#sense14',
            '.between_house.content',
            'ins.adsbygoogle',
            'div[id^="div-gpt-ad"]',
            'iframe[src*="adsense"]',
            'iframe[src*="ad.doubleclick"]',
            
            // 제공된 HTML에서 추출한 구체적인 선택자
            'div.notice',
            'div#sense14',
            'td > div[style*="height:100px"]',
            'div[style*="width:100%"][style*="height:100px"]',
            'div[style*="margin:0 auto"][style*="min-height:250px"]'
        ];
        
        // 각 선택자에 해당하는 모든 요소와 컨테이너 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // 요소 자체를 완전히 숨기기
                        element.style.display = 'none';
                        element.style.height = '0';
                        element.style.minHeight = '0';
                        element.style.maxHeight = '0';
                        element.style.padding = '0';
                        element.style.margin = '0';
                        element.style.border = 'none';
                        element.style.overflow = 'hidden';
                        element.style.visibility = 'hidden';
                        element.style.opacity = '0';
                        element.style.position = 'absolute';
                        element.style.width = '0';
                        
                        // 부모 요소도 가능한 경우 높이 제거
                        if (element.parentElement) {
                            // td나 div와 같은 부모 컨테이너인 경우
                            if (element.parentElement.tagName === 'DIV' || 
                                element.parentElement.tagName === 'TD') {
                                // 부모 요소의 높이, 패딩 등 제거
                                element.parentElement.style.height = '0';
                                element.parentElement.style.minHeight = '0';
                                element.parentElement.style.padding = '0';
                                element.parentElement.style.margin = '0';
                                element.parentElement.style.border = 'none';
                            }
                        }
                    }
                });
            } catch (e) {
                console.log('광고 숨기기 중 오류 발생:', e.message);
            }
        });
        
        // 공지사항 공간 제거 (class="notice"인 요소)
        try {
            const noticeElements = document.querySelectorAll('.notice, div[id$="notice"]');
            noticeElements.forEach(element => {
                if (element) {
                    element.style.display = 'none';
                    element.style.height = '0';
                    element.style.padding = '0';
                    element.style.margin = '0';
                }
            });
        } catch (e) {
            console.log('공지 제거 중 오류 발생:', e.message);
        }
        
        // 광고 컨테이너 내부 스크립트 실행 방지
        try {
            const adContainers = [
                'div#sense14', 
                'div[style*="height:100px"]'
            ];
            
            adContainers.forEach(selector => {
                const containers = document.querySelectorAll(selector);
                containers.forEach(container => {
                    // 스크립트 요소 비활성화
                    const scripts = container.querySelectorAll('script');
                    scripts.forEach(script => {
                        if (script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                    });
                });
            });
        } catch (e) {
            console.log('스크립트 제거 중 오류 발생:', e.message);
        }
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
                setupObserver();
            });
        } else {
            hideAds();
            setupObserver();
        }
        
        // 페이지가 완전히 로드된 후 한 번 더 실행 (지연 로드된 광고 대응)
        window.addEventListener('load', hideAds);
        
        // 2초 후 한 번 더 실행 (늦게 로드되는 광고 대응)
        setTimeout(hideAds, 2000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 