// ==UserScript==
// @name         인스티즈 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  인스티즈 사이트의 광고를 차단하는 스크립트
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
        #sense14,
        .between_house.content,
        .fanarea_pagination,
        span.button > [href^="//www.instiz.net/name_enter"],
        .notice,
        #swiper-container-fantime-latest > .swiper-wrapper,
        div.content:nth-of-type(16) > .content_sub > .title,
        .howabout_wrap,
        div.content > .content_sub > .title,
        #mboard > tbody > tr > td > div,
        .swiper-slide-active.swiper-slide > .mboard2.green_mainboard > tbody > tr#greenv:nth-of-type(5),
        .greentop
    {
        display: none !important;
    }`;
    
    // 스타일 요소 생성 및 삽입
    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.documentElement.appendChild(style);
    }
    
    // DOM이 로드되기 전에 스타일 적용 (빠른 차단)
    addStyle(hideElements);
    
    // DOM이 로드된 후 추가 차단 작업 (필요한 경우)
    function removeAds() {
        const selectors = [
            '#sense14',
            '.between_house.content',
            '.fanarea_pagination',
            'span.button > [href^="//www.instiz.net/name_enter"]',
            '.notice',
            '#swiper-container-fantime-latest > .swiper-wrapper',
            'div.content:nth-of-type(16) > .content_sub > .title',
            '.howabout_wrap',
            'div.content > .content_sub > .title',
            '#mboard > tbody > tr > td > div',
            '.swiper-slide-active.swiper-slide > .mboard2.green_mainboard > tbody > tr#greenv:nth-of-type(5)',
            '.greentop'
        ];
        
        // 각 선택자에 해당하는 모든 요소 제거
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                });
            } catch (e) {
                // 오류 발생 시 무시하고 계속 진행
                console.log('광고 제거 중 오류 발생:', e.message);
            }
        });
    }
    
    // 스크립트 초기화 함수
    function init() {
        // DOM이 준비되면 광고 제거 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeAds);
        } else {
            removeAds();
        }
    }
    
    // 스크립트 즉시 실행
    init();
})(); 