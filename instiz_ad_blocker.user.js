// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  인스티즈 사이트의 모든 광고와 불필요한 콘텐츠를 차단하는 스크립트
// @author       AI Assistant
// @match        https://www.instiz.net/*
// @grant        none
// @run-at       document-start
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/instiz_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // CSS 스타일을 이용한 광고 및 불필요한 콘텐츠 차단
    const hideElements = `
        /* 확실한 광고 요소 타겟팅 */
        #sense14, #sense27, #sense10, #sense20, #sense9,
        div[id^="sense"],
        div[id^="div-gpt-ad"],
        ins.adsbygoogle,
        iframe[src*="adsense"],
        iframe[src*="ad.doubleclick"],
        iframe[src*="iframe_fit.htm"],
        img[src*="ad.doubleclick"],
        div[id*="ad-container"],
        
        /* 사용자가 제공한 특정 공지 형태의 광고 */
        div.notice,
        div[class*="notice"][style*="display: block"],
        
        /* 광고 공간과 컨테이너 */
        .view_top,
        .list_foot,
        .foot,
        .hot_under,
        td > div[style*="height:100px"],
        div[style*="min-height:100px"],
        div[style*="min-height:250px"],
        div[style*="height:100px"],
        div[style*="margin:0 auto"][style*="text-align:center"],
        
        /* 관련 광고 영역 */
        .powerlink_m4,
        a[class^="ad"] > div[id="list_ad"],
        div[class*="naver_powerlink"],
        
        /* '이런 글은 어떠세요?' 영역 */
        div.howabout_wrap,
        div.content > .texthead.bttitle:contains("이런 글은 어떠세요"),
        div#swiper-container-recom,
        .howabout_pagination,
        
        /* '찬성하면 신설돼요' 영역 */
        .content.between_house,
        div.content:has(.texthead.bttitle:contains("찬성하면 신설돼요")),
        
        /* 팬 캘린더 영역 */
        .content_sub,
        .topbtn2,
        .topbtn1,
        #swiper-container-fantime-latest
    {
        display: none !important;
        height: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        z-index: -9999 !important;
        width: 0 !important;
        max-width: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
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
    
    // 광고 및 불필요한 콘텐츠 숨기기
    function hideAds() {
        // 정확한 광고 요소 대상
        const adSelectors = [
            // 확실한 광고 선택자
            '#sense14', '#sense27', '#sense10', '#sense20', '#sense9',
            'div[id^="sense"]',
            'ins.adsbygoogle',
            'div[id^="div-gpt-ad"]',
            'iframe[src*="adsense"]',
            'iframe[src*="ad.doubleclick"]',
            'iframe[src*="iframe_fit.htm"]',
            'div[id*="ad-container"]',
            '.powerlink_m4',
            'a[class^="ad"] > div[id="list_ad"]',
            'div[class*="naver_powerlink"]',
            
            // 컨테이너 및 공간
            '.view_top',
            '.list_foot',
            '.foot',
            '.hot_under',
            'td > div[style*="height:100px"]',
            'div[style*="min-height:100px"]',
            'div[style*="min-height:250px"]',
            'div[style*="height:100px"]',
            'div[style*="margin:0 auto"][style*="text-align:center"]',
            
            // 공지 형태의 광고
            'div.notice',
            'div[class*="notice"][style*="display: block"]',
            
            // 찬성하면 신설돼요 영역
            '.content.between_house',
            
            // 팬 캘린더 영역
            '.content_sub',
            '.topbtn2',
            '.topbtn1',
            '#swiper-container-fantime-latest'
        ];
        
        // 각 선택자에 해당하는 모든 요소와 컨테이너 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // 요소 숨기기 및 공간 제거
                        element.style.setProperty('display', 'none', 'important');
                        element.style.setProperty('height', '0', 'important');
                        element.style.setProperty('min-height', '0', 'important');
                        element.style.setProperty('padding', '0', 'important');
                        element.style.setProperty('margin', '0', 'important');
                        element.style.setProperty('visibility', 'hidden', 'important');
                        element.style.setProperty('opacity', '0', 'important');
                        element.style.setProperty('pointer-events', 'none', 'important');
                        element.style.setProperty('position', 'absolute', 'important');
                        element.style.setProperty('z-index', '-9999', 'important');
                        element.style.setProperty('width', '0', 'important');
                        element.style.setProperty('max-width', '0', 'important');
                        element.style.setProperty('max-height', '0', 'important');
                        element.style.setProperty('overflow', 'hidden', 'important');
                    }
                });
            } catch (e) {
                console.log('광고 숨기기 중 오류 발생:', e.message);
            }
        });
        
        // "이런 글은 어떠세요?" 영역 완전히 제거
        try {
            // 1. 직접 howabout_wrap 찾아 제거
            const howaboutWraps = document.querySelectorAll('.howabout_wrap, div.howabout_wrap');
            howaboutWraps.forEach(el => {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('height', '0', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('position', 'absolute', 'important');
                el.style.setProperty('z-index', '-9999', 'important');
                el.parentNode.removeChild(el); // 가능하면 DOM에서 완전히 제거
            });
            
            // 2. "이런 글은 어떠세요?" 텍스트 찾아 그 요소와 관련 컨테이너 제거
            const textElements = getElementByText("이런 글은 어떠세요");
            textElements.forEach(element => {
                // 텍스트 요소의 부모 컨테이너 찾기
                let target = element;
                let depth = 0;
                
                // 최대 5단계 부모까지만 확인
                while (target && depth < 5) {
                    if (target.classList && 
                        (target.classList.contains('howabout_wrap') || 
                         target.classList.contains('content'))) {
                        target.style.setProperty('display', 'none', 'important');
                        target.style.setProperty('height', '0', 'important');
                        target.style.setProperty('position', 'absolute', 'important');
                        target.style.setProperty('z-index', '-9999', 'important');
                        try {
                            target.parentNode.removeChild(target); // 가능하면 DOM에서 완전히 제거
                        } catch (e) {}
                        break;
                    }
                    target = target.parentElement;
                    depth++;
                }
            });
            
            // 3. "찬성하면 신설돼요" 텍스트 찾아 그 요소와 관련 컨테이너 제거
            const textElements2 = getElementByText("찬성하면 신설돼요");
            textElements2.forEach(element => {
                let target = element;
                let depth = 0;
                
                while (target && depth < 5) {
                    if (target.classList && 
                        (target.classList.contains('between_house') || 
                         target.tagName === 'TD')) {
                        target.style.setProperty('display', 'none', 'important');
                        target.style.setProperty('height', '0', 'important');
                        target.style.setProperty('position', 'absolute', 'important');
                        target.style.setProperty('z-index', '-9999', 'important');
                        try {
                            target.parentNode.removeChild(target);
                        } catch (e) {}
                        break;
                    }
                    target = target.parentElement;
                    depth++;
                }
            });
        } catch (e) {
            console.log('불필요한 콘텐츠 제거 중 오류 발생:', e.message);
        }
    }
    
    // 동적으로 추가되는 광고 및 콘텐츠를 감지하기 위한 MutationObserver 설정
    function setupObserver() {
        const observer = new MutationObserver(mutations => {
            let shouldHide = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    // 새로 추가된 노드가 광고인지 확인
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element 노드
                            if (node.id && (node.id.startsWith('sense') || node.id.includes('ad-container')) || 
                                (node.classList && 
                                 (node.classList.contains('powerlink_m4') || 
                                  node.classList.contains('howabout_wrap') ||
                                  node.classList.contains('notice') ||
                                  node.classList.contains('between_house') ||
                                  node.classList.contains('content_sub')))) {
                                shouldHide = true;
                            }
                            
                            // iframe이 추가된 경우도 확인
                            if (node.tagName === 'IFRAME' && 
                                (node.src && (node.src.includes('adsense') || 
                                            node.src.includes('doubleclick') ||
                                            node.src.includes('iframe_fit.htm')))) {
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
        
        // 3초 후에도 한 번 더 실행 (매우 늦게 로드되는 광고 대응)
        setTimeout(hideAds, 3000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 