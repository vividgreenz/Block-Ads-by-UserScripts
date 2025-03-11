// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  newduck.net 사이트의 모든 광고 영역 차단 (AdGuard 없이도 독립적으로 작동)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 독립형 광고 차단 스크립트 (AdGuard 없이도 작동)
    
    // 절대 보존해야 하는 필수 요소 (사이트 작동에 필요)
    const mustPreserveSelectors = [
        // 헤더/푸터
        '.sl-header',
        '.sl-footer',
        
        // 메인 콘텐츠 (절대 건드리면 안됨)
        '#sl-content',
        '.sl-content',
        '.sl-content-body',
        '.sl-content-container',
        '.sl-body',
        '.sl-category',
        '.sl-board'
    ];
    
    // 중요 콘텐츠를 나타내는 선택자 목록 (보존할 요소들)
    const preserveSelectors = [
        // 게시판 및 게시글 관련 필수 요소
        '#board', '.board',
        '.board_list', '.board_read', '.board_content', '.board_header',
        '.document_list', '.document', '.articleList', '.article',
        'form[name="fboardlist"]', '.boardhead',
        
        // 내비게이션 및 카테고리
        'nav', '.nav', '.navigation', 
        '.sl-category-items',
        
        // 테이블 요소 (게시판 목록)
        'table', 'tr', 'td', '.list-table', '.board_table', '.list_table',
        'th', 'thead', 'tbody', 'tfoot',
        
        // 버튼 및 페이지네이션
        '.btn', '.button', '.pagination', '.paging', '.search-wrap',
        
        // 일반 콘텐츠 요소
        '.content', '#content', 
        '.post', '.comment', '.reply',
    ];
    
    // 광고 컨테이너 선택자 목록 (정확한 광고 대상)
    const adSelectors = [
        // 구글 광고 컨테이너
        '#ad-container', 
        'div[id^="aswift_"][id$="_host"]',
        'div[id^="google_ads_iframe_"]',
        'ins.adsbygoogle',
        '[data-ad-client]', 
        '[data-adsbygoogle-status]',
        '[id*="google_ads"]',
        'div.google-auto-placed',
        
        // 파워링크 및 배너 광고
        '#powerLink', '.powerlink', '.toplink', 
        '.custom-banner', 'aside.custom-cul-banner', 
        '#content_bottom_link', '.custom-image-container',
        
        // 스팸 컨테이너
        'div[class*="gpt-ad"]', 'div[id^="div-gpt-ad"]',
        '.adfit', '.ad-fit', '.adunit', '.ad-unit',
        
        // 정확한 광고 텍스트 패턴이 있는 요소
        'p:has(span[style*="color:#ff6699"])',
        'p[style*="text-align: center"]:has(span[style*="color:#ff6699"])',
        'p:has(a[href*="foodfesta"])',
        'p:has(a[href*="coupang"])',
        'p:has(a[href*="11st"])'
    ];
    
    // 명확히 광고로 인식되는 구체적인 패턴 (IDCLS: ID 또는 CLASS에 포함된 텍스트)
    const adKeywords = ['advertisement', 'sponsor', 'promotion', 'banner', 'ad_', '_ad', 'adContainer'];
    
    // 사이트에 따라 선택적으로 적용할 광고 패턴
    const siteSpecificAdSelectors = {
        'newduck.net': [
            // 뉴덕 사이트 특화 광고 선택자
            'div.slsmvbn',  // 배너 클래스
            'div[style*="padding-top:"][style*="margin-bottom:"]' // 광고 스타일 패턴
        ]
    };
    
    // 요소에 적용할 스타일 (완전히 숨김)
    const hideStyles = {
        display: 'none',
        visibility: 'hidden',
        height: '0px',
        margin: '0px',
        padding: '0px',
        border: 'none',
        overflow: 'hidden'
    };
    
    // 안전한 방식으로 광고 요소 제거
    function removeAds() {
        // 현재 호스트에 따른 사이트별 광고 선택자 가져오기
        const hostname = window.location.hostname;
        const siteSpecificSelectors = siteSpecificAdSelectors[hostname] || [];
        
        // 기본 광고 선택자에 사이트별 선택자 추가
        const allAdSelectors = [...adSelectors, ...siteSpecificSelectors];
        
        // 1. 광고 컨테이너 제거 (명확한 선택자)
        allAdSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 필수 요소는 절대 건드리지 않음
                    if (isMustPreserveElement(element)) return;
                    
                    // 일반 보존 요소는 추가 확인 후 건드리지 않음
                    if (isPreservedElement(element)) return;
                    
                    // 광고 컨테이너 제거 처리
                    hideElement(element);
                });
            } catch (e) {
                // 오류 무시 (복잡한 선택자 지원 문제)
            }
        });
        
        // 2. 광고 iframe 처리
        try {
            const adIframes = document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"], iframe[id*="google"]');
            adIframes.forEach(frame => {
                // 1단계만 부모로 올라가서 확인
                if (frame.parentElement && !isPreservedElement(frame.parentElement)) {
                    hideElement(frame.parentElement);
                } else {
                    hideElement(frame);
                }
            });
        } catch (e) {
            // 오류 무시
        }
        
        // 3. 광고 키워드 기반 추가 검사 (ID와 클래스 검사)
        try {
            // ID에 광고 키워드가 포함된 요소
            adKeywords.forEach(keyword => {
                // ID 검사
                document.querySelectorAll(`[id*="${keyword}"]`).forEach(el => {
                    if (!isMustPreserveElement(el) && !isPreservedElement(el)) {
                        hideElement(el);
                    }
                });
                
                // 클래스 검사 
                document.querySelectorAll(`[class*="${keyword}"]`).forEach(el => {
                    if (!isMustPreserveElement(el) && !isPreservedElement(el)) {
                        hideElement(el);
                    }
                });
            });
        } catch (e) {
            // 오류 무시
        }
    }
    
    // 요소를 숨기는 함수
    function hideElement(element) {
        if (!element || !element.style) return;
        if (element.dataset.adBlockerRemoved === 'true') return;
        
        // 스타일 적용
        Object.keys(hideStyles).forEach(key => {
            element.style[key] = hideStyles[key];
        });
        
        // 처리 표시
        element.dataset.adBlockerRemoved = 'true';
    }
    
    // 요소가 절대 보존해야 할 필수 콘텐츠인지 확인
    function isMustPreserveElement(element) {
        if (!element) return false;
        
        // 요소 자체가 필수 선택자와 일치하는지 확인
        for (const selector of mustPreserveSelectors) {
            try {
                if (element.matches && element.matches(selector)) {
                    return true;
                }
            } catch (e) {
                // 선택자 일치 오류 무시
            }
        }
        
        // 부모 요소가 필수 선택자와 일치하는지 확인 (1단계만)
        if (element.parentElement) {
            for (const selector of mustPreserveSelectors) {
                try {
                    if (element.parentElement.matches && 
                        element.parentElement.matches(selector)) {
                        return true;
                    }
                } catch (e) {
                    // 선택자 일치 오류 무시
                }
            }
        }
        
        return false;
    }
    
    // 요소가 보존해야 할 중요 콘텐츠인지 확인
    function isPreservedElement(element) {
        if (!element) return false;
        
        // 이미 절대 보존 요소로 확인됐는지 체크
        if (isMustPreserveElement(element)) return true;
        
        // 캐싱된 결과 재사용
        if (element.dataset.adBlockerChecked === 'true') {
            return element.dataset.isPreserved === 'true';
        }
        
        // 필수 속성 확인
        if (element.id) {
            const id = element.id.toLowerCase();
            if (id === 'content' || id === 'board' || id === 'list' || 
                id.includes('content') || id.includes('board')) {
                element.dataset.adBlockerChecked = 'true';
                element.dataset.isPreserved = 'true';
                return true;
            }
        }
        
        // 클래스 확인
        if (element.className && typeof element.className === 'string') {
            const className = element.className.toLowerCase();
            if (className.includes('content') || className.includes('board') || 
                className.includes('list') || className.includes('sl-') ||
                className.includes('article') || className.includes('post')) {
                element.dataset.adBlockerChecked = 'true';
                element.dataset.isPreserved = 'true';
                return true;
            }
        }
        
        // 태그 확인 (테이블, 헤더 등)
        const preserveTags = ['table', 'th', 'tr', 'td', 'tbody', 'thead', 'h1', 'h2', 'h3', 'nav'];
        if (preserveTags.includes(element.tagName.toLowerCase())) {
            element.dataset.adBlockerChecked = 'true';
            element.dataset.isPreserved = 'true';
            return true;
        }
        
        // 보존해야 할 선택자와 일치하는지 확인
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
        
        // 부모 요소가 보존 대상인지 1단계만 확인 (성능 최적화)
        if (element.parentElement) {
            if (isPreservedElement(element.parentElement)) {
                element.dataset.adBlockerChecked = 'true';
                element.dataset.isPreserved = 'true';
                return true;
            }
        }
        
        element.dataset.adBlockerChecked = 'true';
        element.dataset.isPreserved = 'false';
        return false;
    }
    
    // 초기화 및 실행
    function init() {
        // 즉시 실행
        setTimeout(removeAds, 0);
        
        // 페이지 로드 시 실행
        window.addEventListener('load', function() {
            setTimeout(removeAds, 500);
        });
        
        // DOMContentLoaded 시에도 실행
        window.addEventListener('DOMContentLoaded', function() {
            setTimeout(removeAds, 100);
        });
        
        // 지연 실행 (늦게 로드되는 광고 처리)
        setTimeout(removeAds, 1000);
        setTimeout(removeAds, 2000);
    }
    
    // 스크립트 실행
    init();
})(); 