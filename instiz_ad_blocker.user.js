// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  인스티즈 사이트의 모든 광고와 불필요한 콘텐츠를 단순하게 차단하는 스크립트 (#ingreen 제외)
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
        
        /* 더보기 누른 후 나타나는 광고 공간 제거 - 모든 패턴 포함 */
        tr > td[style*="padding:0"][style*="line-height:0"],
        tr > td[style*="padding: 0"][style*="line-height: 0"],
        tr > td[style*="padding:0;line-height:0"],
        tr:has(td[style*="padding:0"][style*="line-height:0"]),
        tr:has(td[style*="padding: 0px"][style*="line-height: 0"]),
        tr:has(div[style*="width:100%"][style*="height:100px"][style*="padding:20px 0"]),
        tr:has(ins.adsbygoogle),
        tr[style*="height: auto"] > td[style*="padding: 0px"] > div[style*="padding: 20px 0px"],
        tr[style*="height: auto"][style*="padding: 0px"],
        td[style*="padding:0"][style*="line-height:0"][style*="text-align:center"],
        td[style*="padding:0;line-height:0;text-align:center"],
        td[style*="padding: 0px"][style*="line-height: 0"],
        td[style*="padding:0"][style*="line-height:0"],
        td[style*="text-align:center"][style*="padding:0"],
        
        /* 더보기 누른 후 나타나는 광고 div 요소 */
        div[style*="width:100%"][style*="height:100px"][style*="padding:20px 0"],
        div[style*="width: 100%"][style*="height: 100px"][style*="padding: 20px 0px"],
        div[style*="width:100%"][style*="height:100px"],
        div[style*="width: 100%"][style*="height: 100px"],
        
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
        
        /* 팬 캘린더 영역 (#ingreen 제외) */
        .content_sub:not(#ingreen .content_sub),
        .topbtn2,
        .topbtn1,
        #swiper-container-fantime-latest,
        
        /* 연관 메뉴 아래 버튼들 (select 제외) */
        .subcategory > span.button,
        
        /* 특정 iframe 요소 */
        iframe#aswift_1,
        iframe#google_ads_iframe_1,
        iframe[id^="aswift_"],
        iframe[id^="google_ads_iframe_"]
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
            
            // 더보기 누른 후 나타나는 광고 공간 - 모든 패턴 포함
            'tr > td[style*="padding:0"][style*="line-height:0"]',
            'tr > td[style*="padding: 0"][style*="line-height: 0"]',
            'tr > td[style*="padding:0;line-height:0"]',
            'tr[style*="height: auto"] > td[style*="padding: 0px"] > div[style*="padding: 20px 0px"]',
            'tr[style*="height: auto"][style*="padding: 0px"]',
            'td[style*="padding:0"][style*="line-height:0"][style*="text-align:center"]',
            'td[style*="padding:0;line-height:0;text-align:center"]',
            'td[style*="padding: 0px"][style*="line-height: 0"]',
            'td[style*="padding:0"][style*="line-height:0"]',
            'td[style*="text-align:center"][style*="padding:0"]',
            
            // 더보기 누른 후 나타나는 광고 div 요소
            'div[style*="width:100%"][style*="height:100px"][style*="padding:20px 0"]',
            'div[style*="width: 100%"][style*="height: 100px"][style*="padding: 20px 0px"]',
            'div[style*="width:100%"][style*="height:100px"]',
            'div[style*="width: 100%"][style*="height: 100px"]',
            
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
            
            // 팬 캘린더 영역 (#ingreen 제외)
            '.content_sub:not(#ingreen .content_sub)',
            '.topbtn2',
            '.topbtn1',
            '#swiper-container-fantime-latest',
            
            // 연관 메뉴 아래 버튼들 (select 제외)
            '.subcategory > span.button',
            
            // 특정 iframe 요소
            'iframe#aswift_1',
            'iframe#google_ads_iframe_1',
            'iframe[id^="aswift_"]',
            'iframe[id^="google_ads_iframe_"]'
        ];
        
        // 각 선택자에 해당하는 모든 요소와 컨테이너 숨기기
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        // #ingreen 내부의 .content_sub는 제외
                        if (selector.includes('content_sub') && 
                            element.closest('#ingreen')) {
                            return; // 이 요소는 건너뜀
                        }
                        
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
                        
                        // 가능하면 부모 테이블 행에서 완전히 제거
                        if (selector.includes('td[style') || 
                            selector.includes('div[style*="width:100%"][style*="height:100px"]') ||
                            element.tagName === 'TD') {
                            let parent = element.parentElement;
                            let depth = 0;
                            
                            // 최대 3단계 부모까지 확인하여 tr 찾기
                            while (parent && depth < 3) {
                                if (parent.tagName === 'TR') {
                                    try {
                                        parent.style.setProperty('display', 'none', 'important');
                                        parent.style.setProperty('height', '0', 'important');
                                        parent.style.setProperty('min-height', '0', 'important');
                                        parent.style.setProperty('visibility', 'hidden', 'important');
                                        parent.parentNode.removeChild(parent);
                                    } catch (e) {}
                                    break;
                                }
                                parent = parent.parentElement;
                                depth++;
                            }
                        }
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
                try {
                    el.parentNode.removeChild(el); // 가능하면 DOM에서 완전히 제거
                } catch (e) {}
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
            
            // 4. 더보기 버튼 누른 후 나타나는 광고 영역 제거 (더 정확하고 광범위하게)
            // (1) 모든 td 스타일 패턴 검색
            const adRows = document.querySelectorAll(
                'td[style*="padding:0"][style*="line-height:0"], ' +
                'td[style*="padding: 0"][style*="line-height: 0"], ' +
                'td[style*="padding:0;line-height:0"], ' +
                'td[style*="text-align:center"][style*="padding: 0px"], ' +
                'td[style*="text-align:center"][style*="padding:0"]'
            );
            
            adRows.forEach(row => {
                // 부모 tr까지 찾아서 제거
                let parentRow = row.parentElement;
                if (parentRow && parentRow.tagName === 'TR') {
                    parentRow.style.setProperty('display', 'none', 'important');
                    parentRow.style.setProperty('height', '0', 'important');
                    parentRow.style.setProperty('min-height', '0', 'important');
                    parentRow.style.setProperty('visibility', 'hidden', 'important');
                    try {
                        parentRow.parentNode.removeChild(parentRow);
                    } catch (e) {}
                }
            });
            
            // (2) adsbygoogle 요소가 포함된 tr 찾아 제거
            const adsByGoogleRows = document.querySelectorAll('tr:has(ins.adsbygoogle)');
            adsByGoogleRows.forEach(row => {
                row.style.setProperty('display', 'none', 'important');
                row.style.setProperty('height', '0', 'important');
                row.style.setProperty('visibility', 'hidden', 'important');
                try {
                    row.parentNode.removeChild(row);
                } catch (e) {}
            });
            
            // (3) 특정 div 스타일 패턴의 부모 tr 찾아 제거
            const divAdContainers = document.querySelectorAll('div[style*="width:100%"][style*="height:100px"]');
            divAdContainers.forEach(div => {
                let parent = div.parentElement;
                let depth = 0;
                
                // 최대 3단계 부모까지 확인하여 tr 찾기
                while (parent && depth < 3) {
                    if (parent.tagName === 'TR') {
                        parent.style.setProperty('display', 'none', 'important');
                        parent.style.setProperty('height', '0', 'important');
                        parent.style.setProperty('visibility', 'hidden', 'important');
                        try {
                            parent.parentNode.removeChild(parent);
                        } catch (e) {}
                        break;
                    }
                    parent = parent.parentElement;
                    depth++;
                }
            });
            
            // (4) 사용자가 제공한 특정 광고 구조 처리
            const divAdSpecific = document.querySelectorAll('div[style*="width:100%"][style*="height:100px"][style*="padding:20px 0"]');
            divAdSpecific.forEach(div => {
                let parent = div.parentElement;
                if (parent && parent.tagName === 'TD' && 
                    parent.getAttribute('style') && 
                    (parent.getAttribute('style').includes('padding:0') || 
                     parent.getAttribute('style').includes('line-height:0'))) {
                    let trParent = parent.parentElement;
                    if (trParent && trParent.tagName === 'TR') {
                        trParent.style.setProperty('display', 'none', 'important');
                        trParent.style.setProperty('height', '0', 'important');
                        trParent.style.setProperty('min-height', '0', 'important');
                        trParent.style.setProperty('visibility', 'hidden', 'important');
                        try {
                            trParent.parentNode.removeChild(trParent);
                        } catch (e) {}
                    }
                }
            });
            
            // (5) 광고 iframe 직접 찾아 제거
            const iframes = document.querySelectorAll('iframe[id^="aswift_"], iframe[id^="google_ads_iframe_"]');
            iframes.forEach(iframe => {
                let parent = iframe.parentElement;
                let depth = 0;
                
                // iframe에서 시작하여 tr까지 거슬러 올라가기
                while (parent && depth < 5) {
                    parent.style.setProperty('display', 'none', 'important');
                    parent.style.setProperty('height', '0', 'important');
                    parent.style.setProperty('min-height', '0', 'important');
                    parent.style.setProperty('padding', '0', 'important');
                    
                    if (parent.tagName === 'TR') {
                        try {
                            parent.parentNode.removeChild(parent);
                        } catch (e) {}
                        break;
                    }
                    parent = parent.parentElement;
                    depth++;
                }
            });
            
            // 5. 연관 메뉴 아래 버튼들 제거 (select 요소는 유지)
            const subcategoryButtons = document.querySelectorAll('.subcategory > span.button');
            subcategoryButtons.forEach(button => {
                button.style.setProperty('display', 'none', 'important');
                button.style.setProperty('visibility', 'hidden', 'important');
                try {
                    button.parentNode.removeChild(button);
                } catch (e) {}
            });
        } catch (e) {
            console.log('불필요한 콘텐츠 제거 중 오류 발생:', e.message);
        }
    }
    
    // 요소 추가를 감지하여 광고 요소 제거 (더보기 버튼 대응)
    function setupDOMObserver() {
        document.addEventListener('DOMNodeInserted', function(e) {
            // 새로운 노드가 추가될 때마다 확인
            if (e.target && e.target.nodeType === 1) { // Element 노드만 확인
                // 새로 추가된 요소가 광고인지 확인
                const addedElement = e.target;
                
                // 광고 관련 속성 체크
                if (addedElement.tagName === 'TD' &&
                    addedElement.getAttribute('style') &&
                    (addedElement.getAttribute('style').includes('padding:0') ||
                     addedElement.getAttribute('style').includes('line-height:0'))) {
                    
                    // TD 및 부모 TR 제거
                    let parentRow = addedElement.parentElement;
                    if (parentRow && parentRow.tagName === 'TR') {
                        parentRow.style.setProperty('display', 'none', 'important');
                        parentRow.style.setProperty('height', '0', 'important');
                        try {
                            parentRow.parentNode.removeChild(parentRow);
                        } catch (e) {}
                    }
                }
                
                // 새로 추가된 div 광고 확인
                if (addedElement.tagName === 'DIV' &&
                    addedElement.getAttribute('style') &&
                    addedElement.getAttribute('style').includes('height:100px')) {
                    
                    // 부모 요소 확인하여 제거
                    let parent = addedElement.parentElement;
                    let depth = 0;
                    
                    // 최대 5단계까지 부모 찾기
                    while (parent && depth < 5) {
                        if (parent.tagName === 'TR') {
                            parent.style.setProperty('display', 'none', 'important');
                            parent.style.setProperty('height', '0', 'important');
                            try {
                                parent.parentNode.removeChild(parent);
                            } catch (e) {}
                            break;
                        }
                        parent = parent.parentElement;
                        depth++;
                    }
                }
                
                // 새로 추가된 adsbygoogle 확인
                if (addedElement.classList && 
                    addedElement.classList.contains('adsbygoogle')) {
                    
                    // 최대 5단계까지 부모 찾기
                    let parent = addedElement.parentElement;
                    let depth = 0;
                    
                    while (parent && depth < 5) {
                        if (parent.tagName === 'TR') {
                            parent.style.setProperty('display', 'none', 'important');
                            parent.style.setProperty('height', '0', 'important');
                            try {
                                parent.parentNode.removeChild(parent);
                            } catch (e) {}
                            break;
                        }
                        parent = parent.parentElement;
                        depth++;
                    }
                }
                
                // 100ms 후에 한 번 더 광고 제거 실행 (지연 로드된 콘텐츠 대응)
                setTimeout(hideAds, 100);
            }
        });
    }
    
    // 스크립트 초기화 함수
    function init() {
        // 광고 숨기기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                hideAds();
                setupDOMObserver();
            });
        } else {
            hideAds();
            setupDOMObserver();
        }
        
        // 페이지가 완전히 로드된 후 한 번 더 실행 (지연 로드된 광고 대응)
        window.addEventListener('load', hideAds);
        
        // 더보기 누른 후 나타나는 광고 대응 (페이지 로드 후 추가 실행)
        setTimeout(hideAds, 1000);
        setTimeout(hideAds, 2000);
    }
    
    // 스크립트 즉시 실행
    init();
})(); 