// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  인스티즈 사이트의 광고만 정확하게 차단하는 스크립트
// @author       AI Assistant
// @match        https://www.instiz.net/*
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // CSS 스타일을 이용한 광고 차단 (게시판 목록은 보존)
    const hideElements = `
        /* 확실한 광고 요소만 정확히 타겟팅 */
        #sense14,
        div[id^="div-gpt-ad"],
        ins.adsbygoogle,
        iframe[src*="adsense"],
        iframe[src*="ad.doubleclick"],
        img[src*="ad.doubleclick"],
        div.notice:not(.important-notice),
        
        /* 관련 광고 영역 */
        .powerlink_m4,
        a[class^="ad"] > div[id="list_ad"],
        div[class*="naver_powerlink"],
        
        /* '이런 글은 어떠세요?' 영역만 정확히 타겟팅 */
        div.howabout_wrap,
        div.content > .texthead.bttitle:contains("이런 글은 어떠세요"),
        div#swiper-container-recom,
        .howabout_pagination
    {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        visibility: hidden !important;
    }
    
    /* 광고 공간만 제거 (핵심 게시판/컨텐츠는 보존) */
    div#sense14,
    td > div[style*="height:100px"],
    div[style*="height:100px"][style*="padding:20px"]
    {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
    }`;
    
    // 스타일 요소 생성 및 삽입 (브라우저 호환성 최대화)
    function addStyle(css) {
        try {
            // 방법 1: 일반적인 방법
            const style = document.createElement('style');
            style.textContent = css;
            style.id = 'instiz-adblock-style';
            
            // head가 없으면 생성
            if (!document.head) {
                const head = document.createElement('head');
                document.documentElement.appendChild(head);
            }
            
            document.head.appendChild(style);
        } catch (e) {
            console.log('스타일 추가 중 오류:', e.message);
        }
    }
    
    // DOM이 로드되기 전에 스타일 적용 (빠른 차단)
    addStyle(hideElements);
    
    // 특정 텍스트를 포함하는 요소 찾는 함수
    function getElementByText(text) {
        const elements = [];
        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while(node = walk.nextNode()) {
            if (node.nodeValue && node.nodeValue.includes(text)) {
                elements.push(node.parentElement);
            }
        }
        return elements;
    }
    
    // 광고만 정확히 숨기기 (게시판 목록은 보존)
    function hideAds() {
        // 정확한 광고 요소 대상
        const adSelectors = [
            // 확실한 광고 선택자
            '#sense14',
            'ins.adsbygoogle',
            'div[id^="div-gpt-ad"]',
            'iframe[src*="adsense"]',
            'iframe[src*="ad.doubleclick"]',
            '.powerlink_m4',
            'a[class^="ad"] > div[id="list_ad"]',
            'div[class*="naver_powerlink"]',
            
            // 필요한 광고 컨테이너
            'td > div[style*="height:100px"]',
            'div[style*="width:100%"][style*="height:100px"]'
        ];
        
        // 각 선택자에 해당하는 모든 요소와 컨테이너 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // 요소 숨기기
                        element.style.setProperty('display', 'none', 'important');
                        element.style.setProperty('height', '0', 'important');
                        element.style.setProperty('min-height', '0', 'important');
                        element.style.setProperty('padding', '0', 'important');
                        element.style.setProperty('margin', '0', 'important');
                        element.style.setProperty('visibility', 'hidden', 'important');
                    }
                });
            } catch (e) {
                console.log('광고 숨기기 중 오류 발생:', e.message);
            }
        });
        
        // "이런 글은 어떠세요?" 영역만 정확히 타겟팅
        try {
            // 1. 직접 howabout_wrap 찾아 제거
            const howaboutWraps = document.querySelectorAll('.howabout_wrap, div.howabout_wrap');
            howaboutWraps.forEach(el => {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
            });
            
            // 2. "이런 글은 어떠세요?" 텍스트 찾아 그 요소만 제거
            const textElements = getElementByText("이런 글은 어떠세요");
            textElements.forEach(element => {
                // 텍스트 요소의 부모 컨테이너만 숨김
                let target = element;
                let depth = 0;
                
                // 최대 3단계 부모까지만 확인
                while (target && depth < 3) {
                    if (target.classList && 
                        (target.classList.contains('howabout_wrap') || 
                         target.classList.contains('content'))) {
                        target.style.setProperty('display', 'none', 'important');
                        target.style.setProperty('height', '0', 'important');
                        break;
                    }
                    target = target.parentElement;
                    depth++;
                }
            });
        } catch (e) {
            console.log('howabout_wrap 제거 중 오류 발생:', e.message);
        }
    }
    
    // 동적으로 추가되는 광고를 감지하기 위한 MutationObserver 설정
    function setupObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldHide = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    // 새로 추가된 노드가 광고인지 확인
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element 노드
                            if (node.id === 'sense14' || 
                                (node.classList && 
                                 (node.classList.contains('powerlink_m4') || 
                                  node.classList.contains('howabout_wrap')))) {
                                shouldHide = true;
                            }
                        }
                    });
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
        
        // 1초 후 한 번 더 실행 (늦게 로드되는 광고 대응)
        setTimeout(hideAds, 1000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 