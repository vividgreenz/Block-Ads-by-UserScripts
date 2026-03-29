// ==UserScript==
// @name         ㄴㄷ광고 차단 스크립트 (단순 최적화)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  광고 공간 완전 제거 - 단순하고 가벼운 구현
// @author       AI Assistant
// @match        https://newduck.net/*
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 광고 공간 선택자
    const AD_SELECTORS = [
        // ID 선택자
        '#ad-container', 
        '#content_bottom_link',
        
        // 클래스 선택자
        '.custom-banner',
        '.custom-cul-banner',
        '.adsbygoogle',
        
        // 구글 광고 관련 컨테이너
        'div[id^="google_ads_"]',
        'div[id^="div-gpt-ad"]',
        'ins.adsbygoogle',
        'iframe[id^="google_ads_iframe_"]',
        'iframe[id^="aswift_"]'
    ];
    
    /**
     * 중요한 콘텐츠인지 확인
     */
    function isCriticalContent(element) {
        if (!element) return false;
        
        const id = (element.id || '').toLowerCase();
        const className = (element.className || '').toString().toLowerCase();
        
        // 차단 시 사이트 기능에 문제가 생길 수 있는 요소
        return (id.includes('content') && !id.includes('ad-container')) || 
               id.includes('board') || 
               className.includes('board_list') || 
               className.includes('sl-content');
    }
    
    /**
     * 요소의 광고 공간을 완전히 제거
     */
    function removeAdSpace(element) {
        if (!element || !element.style || isCriticalContent(element)) return;
        
        // 광고 공간 완전 제거
        element.style.display = 'none';
        element.style.height = '0';
        element.style.minHeight = '0';
        element.style.padding = '0';
        element.style.margin = '0';
        element.style.border = 'none';
        element.style.overflow = 'hidden';
    }
    
    /**
     * 광고 공간 제거
     */
    function removeAdSpaces() {
        // 모든 광고 선택자 처리
        AD_SELECTORS.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => removeAdSpace(el));
            } catch (e) {
                // 오류 무시
            }
        });
        
        // 푸드페스타 등 색상 광고 텍스트 주변 공간 제거
        try {
            document.querySelectorAll('span[style*="color:#ff6699"]').forEach(span => {
                const paragraph = span.closest('p');
                if (paragraph) removeAdSpace(paragraph);
            });
        } catch (e) {
            // 오류 무시
        }
    }
    
    /**
     * 메인 실행 함수
     */
    function init() {
        // DOM이 준비되면 광고 공간 제거 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeAdSpaces);
        } else {
            removeAdSpaces();
        }
    }
    
    // 스크립트 즉시 실행
    init();
})(); 
