// ==UserScript==
// @name         뉴덕 광고 차단 스크립트 (최소 버전)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  100% 안전한 광고 차단 - 명확한 구글 광고만 제거
// @author       AI Assistant
// @match        https://newduck.net/*
// @run-at       document-end
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 극히 단순화된 광고 차단 스크립트 - 구글 광고와 푸드페스타 텍스트만 제거
    
    // 절대적으로 확실한 광고만 처리
    const EXACT_AD_IDS = [
        'ad-container',                     // 뉴덕 메인 광고 컨테이너
        'content_bottom_link'               // 하단 링크 광고
    ];
    
    const EXACT_AD_CLASSES = [
        'custom-banner',                    // 배너 광고
        'custom-cul-banner'                 // 배너 광고 (2)
    ];
    
    // 구글 광고 패턴
    const GOOGLE_AD_PATTERNS = [
        'google_ads_iframe_',               // 구글 광고 iframe ID 패턴
        'aswift_'                           // 구글 애드센스 컨테이너 ID 패턴
    ];
    
    /**
     * 명확한 광고 요소만 숨기는 안전한 함수
     */
    function hideExactAds() {
        try {
            // 정확한 ID로 광고 제거
            EXACT_AD_IDS.forEach(id => {
                const element = document.getElementById(id);
                if (element) hideElement(element);
            });
            
            // 정확한 클래스로 광고 제거
            EXACT_AD_CLASSES.forEach(className => {
                const elements = document.getElementsByClassName(className);
                for (let i = 0; i < elements.length; i++) {
                    hideElement(elements[i]);
                }
            });
            
            // 구글 광고 iframes 제거
            const allElements = document.querySelectorAll('*[id]');
            for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i];
                const id = el.id || '';
                
                // ID가 구글 광고 패턴과 일치하는지 확인
                if (GOOGLE_AD_PATTERNS.some(pattern => id.includes(pattern))) {
                    hideElement(el);
                }
            }
            
            // 인라인 구글 광고 스크립트 제거
            document.querySelectorAll('ins.adsbygoogle').forEach(ad => {
                hideElement(ad);
            });
            
            // 푸드페스타 색상 광고 텍스트 제거
            document.querySelectorAll('span[style*="color:#ff6699"]').forEach(span => {
                const paragraph = span.closest('p');
                if (paragraph) hideElement(paragraph);
            });
        } catch (e) {
            // 오류 처리 - 콘솔에 기록하지 않음
        }
    }
    
    /**
     * 요소를 안전하게 숨기는 함수
     */
    function hideElement(element) {
        if (!element || !element.style) return;
        
        // 이미 처리되었는지 확인
        if (element.getAttribute('data-ad-hidden') === 'true') return;
        
        // 요소가 중요한 콘텐츠인지 확인 (매우 간단한 체크)
        const id = (element.id || '').toLowerCase();
        const className = (element.className || '').toString().toLowerCase();
        
        // 중요한 콘텐츠는 절대 숨기지 않음
        if (id.includes('content') || id.includes('board') || 
            className.includes('board_list') || className.includes('sl-content')) {
            return;
        }
        
        // 요소 숨기기
        element.style.display = 'none';
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.margin = '0';
        element.style.padding = '0';
        
        // 처리 표시
        element.setAttribute('data-ad-hidden', 'true');
    }
    
    /**
     * 지연된 실행 함수 (페이지가 완전히 로드된 후)
     */
    function init() {
        // 페이지가 완전히 로드된 후 실행
        window.addEventListener('load', function() {
            // 약간 지연시켜 실행 (구글 광고가 로드된 후)
            setTimeout(hideExactAds, 500);
        });
    }
    
    // 스크립트 실행
    init();
})(); 