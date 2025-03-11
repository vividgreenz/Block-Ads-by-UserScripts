// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  newduck.net 사이트의 모든 광고 영역 차단 (게시판 및 게시글 페이지)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        none
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 광고 영역을 제거하는 함수
    function removeAds() {
        // 사용자가 제공한 HTML 구조를 기반으로 선택자 목록 생성
        const adSelectors = [
            // 구글 광고 관련 (게시판 및 게시글 상단)
            '#ad-container',
            'ins.adsbygoogle',
            '[data-ad-client]',
            '[data-adsbygoogle-status]',
            
            // 파워링크 광고 관련
            '#powerLink', 
            '#powerLink1',
            '.powerlink',
            '.toplink',
            '.powerlink_list',
            
            // 하단 배너 광고 (상위 요소 포함)
            '.custom-banner',
            'aside.custom-cul-banner',
            '#content_bottom_link',
            '.custom-image-container',
            '#content_bottom',
            
            // 배너 관련 텍스트 메시지 (푸드페스타 등)
            'p[style*="text-align: center"] span[style*="color:#ff6699"]',
            'p:contains("푸드페스타")',
            'p:contains("뉴덕 10p")',
            
            // 구글 디스플레이 광고
            '.ns-hiaaa-l-towerA',
            'iframe[src*="googleads"]',
            'iframe[src*="doubleclick"]',
            
            // 일반적인 광고 관련 클래스/ID
            'div[id*="aswift_"]',
            'div[id*="google_ads_"]',
            '[id*="banner"]',
            '[class*="banner"]',
            '[id*="ads"]',
            '[class*="ads"]',
            '[id*="advertisement"]',
            '[class*="advertisement"]'
        ];
        
        // 각 선택자에 대해 요소를 찾아 제거
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // 요소 숨기기 및 공간 제거
                    element.style.display = 'none';
                    element.style.height = '0';
                    element.style.margin = '0';
                    element.style.padding = '0';
                    element.style.overflow = 'hidden';
                    element.style.visibility = 'hidden';
                    
                    // 부모 요소가 광고만을 위한 컨테이너인 경우 그것도 제거
                    if (element.parentElement) {
                        // 파워링크 관련 부모 요소도 처리
                        if (element.parentElement.classList.contains('lst_cont') || 
                            element.parentElement.id === 'contentsList') {
                            element.parentElement.style.display = 'none';
                            element.parentElement.style.height = '0';
                        }
                        
                        // 단일 자식을 가진 컨테이너 처리
                        if (element.parentElement.children.length === 1) {
                            element.parentElement.style.display = 'none';
                            element.parentElement.style.height = '0';
                            element.parentElement.style.margin = '0';
                            element.parentElement.style.padding = '0';
                        }
                    }
                });
            } catch (e) {
                // 오류 무시 (예: 복잡한 선택자 지원 안됨)
                console.debug('광고 제거 오류(무시됨):', e.message);
            }
        });
        
        // 네이버 파워링크 광고 컨테이너 특별 처리
        const powerLinkContainers = document.querySelectorAll('div[class*="powerlink"], div[id*="powerLink"]');
        powerLinkContainers.forEach(container => {
            // 컨테이너와 그 부모 요소 모두 숨김
            container.style.display = 'none';
            if (container.parentElement) {
                container.parentElement.style.display = 'none';
            }
        });
        
        // 구글 광고 iframe 컨테이너 특별 처리
        const adFrames = document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"]');
        adFrames.forEach(frame => {
            // iframe과 그 상위 컨테이너 모두 제거
            let currentElement = frame;
            for (let i = 0; i < 3; i++) {  // 최대 3단계 상위까지 확인
                if (currentElement) {
                    currentElement.style.display = 'none';
                    currentElement.style.height = '0';
                    currentElement = currentElement.parentElement;
                }
            }
        });
        
        // 텍스트 기반 검색으로 광고 관련 텍스트 차단
        const allParagraphs = document.querySelectorAll('p');
        allParagraphs.forEach(p => {
            const text = p.textContent.toLowerCase();
            if (text.includes('푸드페스타') || 
                text.includes('클릭하고') || 
                text.includes('뉴덕 10p') || 
                text.includes('포인트') && text.includes('받기')) {
                p.style.display = 'none';
                p.style.height = '0';
            }
        });
    }

    // 페이지 로드 시 실행
    window.addEventListener('load', removeAds);
    
    // DOMContentLoaded 시에도 실행 (더 빠른 차단을 위해)
    window.addEventListener('DOMContentLoaded', removeAds);
    
    // 동적으로 추가되는 요소 감시
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                removeAds();
            }
        });
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
    
    // 초기 실행
    removeAds();
    
    // 1초 후 다시 실행 (지연 로드되는 광고 처리)
    setTimeout(removeAds, 1000);
    
    // 3초 후 한번 더 실행 (늦게 로드되는 광고 처리)
    setTimeout(removeAds, 3000);
})(); 