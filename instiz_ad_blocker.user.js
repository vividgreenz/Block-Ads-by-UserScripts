// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  인스티즈 사이트의 광고와 불필요한 컨텐츠를 차단하는 스크립트
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
        div[style*="min-height:250px"][style*="padding:25px"],
        
        /* '이런 글은 어떠세요?' 영역 완전 제거 */
        .howabout_wrap,
        div.howabout_wrap,
        .texthead.bttitle,
        div[class*="howabout_"],
        .howabout_pagination,
        #swiper-container-recom,
        .swiper-container[id*="recom"],
        div[id^="swiper-container"],
        .swiper-wrapper,
        .powerlink_m4,
        [class*="powerlink"],
        a[class^="ad"],
        div[id="list_ad"],
        .top_link,
        .tag_comps
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
        max-width: 0 !important;
        transform: scale(0) !important;
        transform-origin: 0 0 !important;
    }
    
    /* 광고 컨테이너의 부모 요소 높이값 제거 - 더 강력하게 적용 */
    [style*="height"] > ins,
    [style*="height"] > iframe,
    [style*="height"] > div[style*="height"],
    [style*="height"][style*="padding"],
    div.content:has(.texthead.bttitle),
    div.content:has(.howabout_)
    {
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        display: none !important;
        visibility: hidden !important;
    }
    
    /* 테이블 셀 안의 광고 공간 제거 */
    td[style*="padding"][style*="line-height"][style*="text-align:center"],
    td:has(div[style*="height:100px"]),
    td:has(.adsbygoogle)
    {
        height: 0 !important;
        padding: 0 !important;
        line-height: 0 !important;
        display: none !important;
    }
    
    /* '이런 글은 어떠세요?' 컨테이너 완전 제거 */
    div.howabout_wrap,
    div:has(> .howabout_pagination),
    div:has(> #swiper-container-recom)
    {
        display: none !important;
        height: 0 !important;
        visibility: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
        z-index: -9999 !important;
        clip: rect(0, 0, 0, 0) !important;
        opacity: 0 !important;
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
            
            // 방법 2: 백업 방법 (일부 브라우저에서 더 빠르게 적용)
            const styleText = document.createTextNode(css);
            const styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.id = 'instiz-adblock-style-backup';
            styleElement.appendChild(styleText);
            document.documentElement.appendChild(styleElement);
        } catch (e) {
            console.log('스타일 추가 중 오류:', e.message);
        }
    }
    
    // DOM이 로드되기 전에 스타일 적용 (빠른 차단)
    addStyle(hideElements);
    
    // 강력하게 광고 숨기기 (공간까지 완전히 제거)
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
            'div[style*="margin:0 auto"][style*="min-height:250px"]',
            
            // '이런 글은 어떠세요?' 영역
            '.howabout_wrap',
            '.texthead.bttitle',
            '#swiper-container-recom',
            '.howabout_pagination',
            '.swiper-wrapper',
            '.powerlink_m4',
            'div.content:has(.texthead.bttitle)'
        ];
        
        // 각 선택자에 해당하는 모든 요소와 컨테이너 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // 요소 자체를 완전히 숨기기
                        element.style.setProperty('display', 'none', 'important');
                        element.style.setProperty('height', '0', 'important');
                        element.style.setProperty('min-height', '0', 'important');
                        element.style.setProperty('max-height', '0', 'important');
                        element.style.setProperty('padding', '0', 'important');
                        element.style.setProperty('margin', '0', 'important');
                        element.style.setProperty('border', 'none', 'important');
                        element.style.setProperty('overflow', 'hidden', 'important');
                        element.style.setProperty('visibility', 'hidden', 'important');
                        element.style.setProperty('opacity', '0', 'important');
                        element.style.setProperty('position', 'absolute', 'important');
                        element.style.setProperty('width', '0', 'important');
                        element.style.setProperty('pointer-events', 'none', 'important');
                        element.style.setProperty('clip', 'rect(0,0,0,0)', 'important');
                        element.style.setProperty('z-index', '-9999', 'important');
                        
                        // 부모 요소도 가능한 경우 높이 제거
                        if (element.parentElement) {
                            const parent = element.parentElement;
                            // 특정 클래스를 가진 부모 요소인 경우 (이런 글은 어떠세요?) 
                            if (parent.className.includes('content') || 
                                parent.className.includes('howabout')) {
                                parent.style.setProperty('display', 'none', 'important');
                                parent.style.setProperty('height', '0', 'important');
                                parent.style.setProperty('min-height', '0', 'important');
                                parent.style.setProperty('padding', '0', 'important');
                                parent.style.setProperty('margin', '0', 'important');
                                parent.style.setProperty('visibility', 'hidden', 'important');
                            }
                            
                            // td나 div와 같은 부모 컨테이너인 경우
                            if (parent.tagName === 'DIV' || parent.tagName === 'TD') {
                                // 부모 요소의 높이, 패딩 등 제거
                                parent.style.setProperty('height', '0', 'important');
                                parent.style.setProperty('min-height', '0', 'important');
                                parent.style.setProperty('padding', '0', 'important');
                                parent.style.setProperty('margin', '0', 'important');
                                parent.style.setProperty('border', 'none', 'important');
                            }
                        }
                    }
                });
            } catch (e) {
                console.log('광고 숨기기 중 오류 발생:', e.message);
            }
        });
        
        // 특별히 처리: howabout_wrap 관련 요소들 처리
        try {
            // 1. 직접 howabout_wrap 찾아 제거
            const howaboutWraps = document.querySelectorAll('.howabout_wrap, div.howabout_wrap');
            howaboutWraps.forEach(el => {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                
                // 상위 두 단계까지 확인해서 숨기기 (depth 제한)
                let parent = el.parentElement;
                let depth = 0;
                while (parent && depth < 2) {
                    if (parent.classList.contains('content')) {
                        parent.style.setProperty('display', 'none', 'important');
                        parent.style.setProperty('height', '0', 'important');
                    }
                    parent = parent.parentElement;
                    depth++;
                }
            });
            
            // 2. "이런 글은 어떠세요?" 텍스트 찾아 부모 요소 제거
            const textNodes = [];
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while(node = walk.nextNode()) {
                if (node.nodeValue && node.nodeValue.includes('이런 글은 어떠세요')) {
                    textNodes.push(node);
                }
            }
            
            textNodes.forEach(textNode => {
                let element = textNode.parentElement;
                while (element && element !== document.body) {
                    if (element.classList.contains('content') || 
                        element.classList.contains('howabout_wrap')) {
                        element.style.setProperty('display', 'none', 'important');
                        break;
                    }
                    element = element.parentElement;
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
                    shouldHide = true;
                }
                
                // 특정 클래스가 추가되는 경우도 확인
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList &&
                    (mutation.target.classList.contains('howabout_wrap') || 
                     mutation.target.classList.contains('powerlink'))) {
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
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        } else {
            // body가 아직 없으면 로드될 때까지 대기
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            });
        }
    }
    
    // 브라우저 호환성을 위한 다중 실행 함수
    function executeForAllBrowsers() {
        // 일반 실행
        hideAds();
        
        // 0.2초 후 재실행 (모바일 브라우저 대응)
        setTimeout(hideAds, 200);
    }
    
    // 스크립트 초기화 함수
    function init() {
        // 광고 숨기기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                executeForAllBrowsers();
                setupObserver();
            });
        } else {
            executeForAllBrowsers();
            setupObserver();
        }
        
        // 페이지가 완전히 로드된 후 한 번 더 실행 (지연 로드된 광고 대응)
        window.addEventListener('load', executeForAllBrowsers);
        
        // 2초 후 한 번 더 실행 (늦게 로드되는 광고 대응)
        setTimeout(executeForAllBrowsers, 2000);
        
        // 4초 후 마지막 점검 (일부 모바일 브라우저에서 필요)
        setTimeout(executeForAllBrowsers, 4000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 