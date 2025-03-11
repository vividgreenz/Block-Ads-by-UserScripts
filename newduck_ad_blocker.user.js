// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  newduck.net 사이트의 모든 광고 영역 차단 (게시판 및 게시글 페이지)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 중요 콘텐츠를 나타내는 선택자 목록 (보존할 요소들)
    const preserveSelectors = [
        '.board_list',
        '.board_read',
        '.board_content',
        '.board_header',
        '.document_list',
        '.document',
        '.articleList',
        '.article',
        '.board',
        '.sl-header',
        '.sl-footer',
        '.sl-body'
    ];
    
    // 광고 영역을 제거하는 함수
    function removeAds() {
        // 광고 컨테이너 구역 선택자 목록 (컨테이너 자체를 제거)
        const adContainerSelectors = [
            // 구글 광고 컨테이너 (게시판 및 게시글 상단)
            '#ad-container',
            'div[id^="aswift_"][id$="_host"]',
            'div.google-auto-placed',
            'ins.adsbygoogle',
            '[data-ad-client]',
            '[data-adsbygoogle-status]',
            
            // 파워링크 광고 관련 컨테이너
            '#powerLink', 
            '#powerLink1',
            '.powerlink',
            '.toplink',
            '.powerlink_list',
            
            // 하단 배너 광고 컨테이너 (사용자가 제공한 HTML 구조 기반)
            '.custom-banner',
            'aside.custom-cul-banner',
            '#content_bottom_link',
            '.custom-image-container',
            'p[style*="text-align: center"] span[style*="color:#ff6699"]',
            
            // 푸드페스타 관련 광고 텍스트를 포함하는 HTML 요소
            'p:has(span[style*="color:#ff6699"])',
            'p:has(strong:contains("푸드페스타"))',
            'p:has(strong:contains("뉴덕 10p"))',
            
            // 기타 광고 컨테이너
            '.ns-hiaaa-l-towerA',
            '.slsmvbn',
            '.adfit',
            'div[id^="div-gpt-ad"]'
        ];
        
        // 1. 일반 광고 컨테이너 제거
        adContainerSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 보존해야 할 중요 요소의 자식인지 확인
                    if (isPreservedElement(element)) {
                        return; // 중요 요소의 자식이면 건너뜀
                    }
                    
                    // 광고 컨테이너 제거 처리
                    removeAdContainer(element);
                });
            } catch (e) {
                // 오류 무시 (예: 복잡한 선택자 지원 안됨)
                console.debug('광고 제거 오류(무시됨):', e.message);
            }
        });
        
        // 2. 광고 iframe 부모 컨테이너 제거
        const adIframes = document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"]');
        adIframes.forEach(frame => {
            // 상위 컨테이너 찾아서 제거 (최대 3단계 상위까지)
            findAndRemoveAdContainer(frame, 3);
        });
        
        // 3. 특정 컨테이너 구조 기반 제거 (사용자가 제공한 HTML 구조)
        removeSpecificContainers();
    }
    
    // 광고 컨테이너를 완전히 제거하는 함수
    function removeAdContainer(element) {
        if (!element || !element.style) return;
        
        // 엘리먼트 자체를 완전히 숨김
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.style.height = '0px';
        element.style.minHeight = '0px';
        element.style.maxHeight = '0px';
        element.style.margin = '0px';
        element.style.padding = '0px';
        element.style.border = 'none';
        element.style.overflow = 'hidden';
        
        // 콘텐츠 비우기
        if (element.innerHTML) {
            element.innerHTML = '';
        }
        
        // 처리 표시
        element.dataset.adBlockerRemoved = 'true';
    }
    
    // 광고 관련 컨테이너를 찾아 제거하는 함수
    function findAndRemoveAdContainer(element, maxDepth) {
        if (!element || maxDepth <= 0) return;
        
        let currentElement = element;
        let depth = 0;
        
        // 부모 요소를 타고 올라가며 광고 컨테이너 찾기
        while (currentElement && depth < maxDepth) {
            // 이미 처리된 요소는 건너뜀
            if (currentElement.dataset.adBlockerRemoved === 'true') break;
            
            // 중요 요소는 보존
            if (isPreservedElement(currentElement)) break;
            
            // 광고 관련 특성이 있는지 확인
            const isAdContainer = checkIfAdContainer(currentElement);
            
            if (isAdContainer) {
                removeAdContainer(currentElement);
                break;
            }
            
            // 바로 부모만 제거하는 경우 (iframe의 직접 부모 등)
            if (depth === 0) {
                removeAdContainer(currentElement);
            }
            
            // 부모 요소로 이동
            currentElement = currentElement.parentElement;
            depth++;
        }
    }
    
    // 요소가 광고 컨테이너인지 확인하는 함수
    function checkIfAdContainer(element) {
        if (!element) return false;
        
        // ID 기반 확인
        if (element.id) {
            const id = element.id.toLowerCase();
            if (id.includes('ad') || id.includes('banner') || 
                id.includes('sponsor') || id.includes('promote') || 
                id.includes('google') || id.includes('aswift')) {
                return true;
            }
        }
        
        // 클래스 기반 확인
        if (element.className && typeof element.className === 'string') {
            const className = element.className.toLowerCase();
            if (className.includes('ad') || className.includes('banner') || 
                className.includes('sponsor') || className.includes('promote') || 
                className.includes('googleads')) {
                return true;
            }
        }
        
        // 데이터 속성 확인
        for (const attr of element.attributes) {
            if (attr.name.startsWith('data-') && 
                (attr.name.includes('ad') || attr.name.includes('google'))) {
                return true;
            }
        }
        
        return false;
    }
    
    // 사용자가 제공한 특정 HTML 구조를 기반으로 광고 컨테이너 제거
    function removeSpecificContainers() {
        // 1. 사용자가 제공한 HTML 구조 - 광고 컨테이너
        try {
            // 광고 컨테이너 #ad-container 제거
            const adContainers = document.querySelectorAll('#ad-container');
            adContainers.forEach(container => {
                if (!isPreservedElement(container)) {
                    removeAdContainer(container);
                    
                    // 부모 요소도 확인하여 제거
                    if (container.parentElement && !isPreservedElement(container.parentElement)) {
                        const parent = container.parentElement;
                        if (parent.children.length <= 2) {
                            removeAdContainer(parent);
                        }
                    }
                }
            });
            
            // 하단 배너 광고 - custom-banner와 관련 요소들
            const customBanners = document.querySelectorAll('aside.custom-cul-banner, .custom-banner');
            customBanners.forEach(banner => {
                if (!isPreservedElement(banner)) {
                    removeAdContainer(banner);
                    
                    // 관련된 다음 요소가 텍스트 컨테이너인 경우 그것도 제거
                    const nextElement = banner.nextElementSibling;
                    if (nextElement && nextElement.tagName === 'P' && 
                        !isPreservedElement(nextElement)) {
                        removeAdContainer(nextElement);
                    }
                }
            });
            
            // 파워링크 광고
            const powerLinks = document.querySelectorAll('#powerLink, #powerLink1, .powerlink');
            powerLinks.forEach(link => {
                if (!isPreservedElement(link)) {
                    removeAdContainer(link);
                }
            });
        } catch (e) {
            console.debug('특정 컨테이너 제거 오류(무시됨):', e.message);
        }
    }
    
    // 요소가 보존해야 할 중요 콘텐츠인지 확인하는 함수
    function isPreservedElement(element) {
        // 이미 처리된 요소라면 패스
        if (element.dataset.adBlockerChecked === 'true') {
            return element.dataset.isPreserved === 'true';
        }
        
        // 현재 요소나 부모 요소들 중 하나라도 보존 대상인지 확인
        let currentElement = element;
        let maxDepth = 5; // 최대 5단계 상위까지만 확인
        
        while (currentElement && maxDepth > 0) {
            // 요소가 보존 대상 선택자와 일치하는지 확인
            for (const selector of preserveSelectors) {
                try {
                    if (currentElement.matches && currentElement.matches(selector)) {
                        // 결과를 캐시하여 다음 호출 시 재사용
                        element.dataset.adBlockerChecked = 'true';
                        element.dataset.isPreserved = 'true';
                        return true;
                    }
                } catch (e) {
                    // 선택자 일치 오류 무시
                }
            }
            
            // 클래스나 ID로 중요 요소 판단
            if (currentElement.id) {
                const id = currentElement.id.toLowerCase();
                if (id.includes('content') || id.includes('board') || id.includes('article') || 
                    id.includes('post') || id.includes('list')) {
                    element.dataset.adBlockerChecked = 'true';
                    element.dataset.isPreserved = 'true';
                    return true;
                }
            }
            
            if (currentElement.className && typeof currentElement.className === 'string') {
                const className = currentElement.className.toLowerCase();
                if (className.includes('content') || className.includes('board') || 
                    className.includes('article') || className.includes('post') || 
                    className.includes('list')) {
                    element.dataset.adBlockerChecked = 'true';
                    element.dataset.isPreserved = 'true';
                    return true;
                }
            }
            
            // 부모 요소로 이동
            currentElement = currentElement.parentElement;
            maxDepth--;
        }
        
        // 결과를 캐시
        element.dataset.adBlockerChecked = 'true';
        element.dataset.isPreserved = 'false';
        return false;
    }
    
    // 초기 및 지연 실행 설정
    function initAdBlocker() {
        // 즉시 실행
        removeAds();
        
        // 페이지 로드 시 실행
        window.addEventListener('load', removeAds);
        
        // DOMContentLoaded 시에도 실행 (더 빠른 차단을 위해)
        window.addEventListener('DOMContentLoaded', removeAds);
        
        // 동적으로 추가되는 요소 감시
        const observer = new MutationObserver(function() {
            removeAds();
        });
        
        // 문서 전체 변화 감시 시작
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // body가 아직 로드되지 않은 경우 로드 후 감시 시작
            window.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }
        
        // 지연 로드되는 광고 처리를 위한 반복 실행
        const intervals = [1000, 2000, 3000, 5000];
        intervals.forEach(ms => {
            setTimeout(removeAds, ms);
        });
    }
    
    // 스크립트 실행
    initAdBlocker();
})(); 