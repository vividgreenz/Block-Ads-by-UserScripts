// ==UserScript==
// @name         뉴덕 광고 차단 스크립트
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  newduck.net 사이트의 모든 광고 영역 차단 (게시판 및 게시글 페이지)
// @author       AI Assistant
// @match        https://newduck.net/*
// @grant        GM_addStyle
// @run-at       document-start
// @updateURL    https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// @downloadURL  https://github.com/vividgreenz/Block-Ads-by-UserScripts/raw/main/newduck_ad_blocker.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 디버그 모드 설정 (true로 설정하면 차단된 요소를 표시하고 로그를 출력합니다)
    const DEBUG_MODE = true;
    const FORCE_DEBUG_UI = true; // 항상 디버그 UI를 표시
    const SHOW_ALL_DIV_BORDERS = false; // 모든 div에 테두리 표시 (true이면 페이지의 모든 div 요소에 테두리 표시)
    
    // 디버그 모드 스타일 (차단된 요소를 시각적으로 표시)
    const DEBUG_STYLES = {
        border: '3px dashed red',
        opacity: '0.7',
        backgroundColor: 'rgba(255, 0, 0, 0.1)'
    };
    
    // 모든 div 요소에 테두리 표시 (디버깅 용도)
    if (SHOW_ALL_DIV_BORDERS) {
        const style = document.createElement('style');
        style.textContent = `
            div { 
                border: 1px solid rgba(0, 0, 255, 0.2) !important; 
            }
            div:hover {
                border: 1px solid rgba(255, 0, 0, 0.5) !important;
                background-color: rgba(255, 255, 0, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 디버그 패널 스타일
    const DEBUG_PANEL_STYLES = {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: '9999999',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        minWidth: '250px',
        maxWidth: '400px'
    };
    
    // 디버그 모드용 로그 함수
    function debugLog(...args) {
        if (DEBUG_MODE) {
            console.log('[AdBlocker Debug]', ...args);
        }
    }
    
    // 직접 콘솔에서 테스트할 수 있는 함수들
    window.adBlockerDebug = {
        scanForAds: function() {
            removeAds();
            return '광고 스캔 완료';
        },
        showAllElements: function(selector = 'div') {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                if (index < 100) { // 너무 많은 요소를 표시하지 않도록 제한
                    el.style.border = '1px solid red';
                    el.title = `Element: ${el.tagName} - Class: ${el.className}`;
                }
            });
            return `${Math.min(elements.length, 100)}개 요소에 테두리 추가 (총 ${elements.length}개)`;
        },
        forceMarkAds: function() {
            forceMarkPotentialAds();
            return '잠재적 광고 요소 표시 완료';
        }
    };
    
    // 디버그 정보 화면에 표시
    let totalBlocked = 0;
    let debugPanel = null;
    let markMode = false; // 광고 요소 표시 모드 (false: 숨김, true: 표시)
    let potentialAdElements = [];
    
    // 잠재적 광고 요소를 표시하는 함수
    function forceMarkPotentialAds() {
        // 광고 관련 키워드가 있는 요소 탐색
        const selectors = [
            '[id*="ad"]', '[class*="ad"]', 
            '[id*="banner"]', '[class*="banner"]',
            'ins', 'iframe', 'div[style*="height:"][style*="px"]'
        ];
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!el.dataset.adDebugChecked) {
                        el.dataset.adDebugChecked = 'true';
                        
                        // 이미 표시된 요소는 제외
                        if (el.dataset.adBlockerRemoved === 'true') return;
                        
                        // #adblock-debug-panel 자체는 제외
                        if (el.id === 'adblock-debug-panel') return;
                        
                        // 잠재적 광고 요소로 표시
                        el.dataset.potentialAd = 'true';
                        potentialAdElements.push(el);
                        
                        // 시각적으로 표시
                        el.style.border = '2px dotted blue';
                        el.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
                        el.title = `잠재적 광고: ${el.tagName} - ${el.className || 'no-class'} - ${el.id || 'no-id'}`;
                    }
                });
            } catch (e) {
                debugLog('잠재적 광고 요소 표시 오류:', e);
            }
        });
        
        updateStatus(`${potentialAdElements.length}개의 잠재적 광고 요소 발견`);
    }
    
    function createDebugPanel() {
        if (document.getElementById('adblock-debug-panel')) return;
        
        debugPanel = document.createElement('div');
        debugPanel.id = 'adblock-debug-panel';
        
        // 패널 스타일 적용
        Object.keys(DEBUG_PANEL_STYLES).forEach(key => {
            debugPanel.style[key] = DEBUG_PANEL_STYLES[key];
        });
        
        // 초기 내용 설정
        debugPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; font-size: 16px;">광고 차단 디버그 패널</div>
            <div id="adblock-status">스크립트 실행 확인됨</div>
            <div id="adblock-stats">차단된 요소: <span id="blocked-count">0</span></div>
            <div style="margin-top: 10px;">
                <button id="toggle-debug" style="padding: 5px; margin-right: 5px; background: #4CAF50; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    차단된 요소 표시
                </button>
                <button id="force-scan" style="padding: 5px; background: #2196F3; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    재스캔
                </button>
            </div>
            <div style="margin-top: 10px;">
                <button id="show-potential" style="padding: 5px; width: 100%; background: #FF9800; border: none; color: white; border-radius: 4px; cursor: pointer; margin-bottom: 5px;">
                    모든 잠재적 광고 요소 표시
                </button>
                <button id="show-divs" style="padding: 5px; width: 100%; background: #9C27B0; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    모든 DIV에 테두리 표시
                </button>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #aaa;">
                버전: 0.9 - 디버그 모드 강화
            </div>
        `;
        
        // body에 추가
        if (document.body) {
            document.body.appendChild(debugPanel);
            setupDebugControls();
        } else {
            // body가 아직 없으면 로드된 후 추가
            window.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(debugPanel);
                setupDebugControls();
            });
        }
    }
    
    // 디버그 패널 컨트롤 설정
    function setupDebugControls() {
        try {
            const toggleBtn = document.getElementById('toggle-debug');
            const forceBtn = document.getElementById('force-scan');
            const showPotentialBtn = document.getElementById('show-potential');
            const showDivsBtn = document.getElementById('show-divs');
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', function() {
                    debugLog('토글 버튼 클릭됨');
                    
                    const markedElements = document.querySelectorAll('[data-ad-blocker-removed="true"]');
                    markMode = !markMode; // 모드 토글
                    
                    debugLog(`토글 모드: ${markMode ? '표시' : '숨김'}, 요소 수: ${markedElements.length}`);
                    
                    markedElements.forEach(el => {
                        if (markMode) {
                            // 요소 표시하기
                            Object.keys(DEBUG_STYLES).forEach(prop => {
                                el.style[prop] = DEBUG_STYLES[prop];
                            });
                            el.style.display = 'block';
                            el.style.visibility = 'visible';
                            el.style.height = 'auto';
                            el.style.maxHeight = 'none';
                            el.style.minHeight = 'auto';
                            toggleBtn.textContent = '차단된 요소 숨기기';
                        } else {
                            // 요소 숨기기
                            el.style.display = 'none';
                            toggleBtn.textContent = '차단된 요소 표시';
                        }
                    });
                    
                    if (markedElements.length === 0) {
                        alert('차단된 광고 요소가 없습니다. 잠재적 광고 요소 표시 기능을 사용해보세요.');
                    }
                });
            }
            
            if (forceBtn) {
                forceBtn.addEventListener('click', function() {
                    updateStatus('수동 스캔 시작...');
                    removeAds();
                    setTimeout(() => {
                        updateStatus('준비 완료');
                    }, 1000);
                });
            }
            
            if (showPotentialBtn) {
                showPotentialBtn.addEventListener('click', function() {
                    forceMarkPotentialAds();
                });
            }
            
            if (showDivsBtn) {
                showDivsBtn.addEventListener('click', function() {
                    window.adBlockerDebug.showAllElements('div');
                    updateStatus('모든 DIV에 테두리 표시됨');
                });
            }
        } catch (e) {
            alert('디버그 컨트롤 설정 중 오류: ' + e.message);
            console.error('디버그 컨트롤 오류:', e);
        }
    }
    
    // 디버그 패널 상태 업데이트
    function updateStatus(message) {
        if (!debugPanel) return;
        
        const statusEl = document.getElementById('adblock-status');
        const countEl = document.getElementById('blocked-count');
        
        if (statusEl) statusEl.textContent = message;
        if (countEl) countEl.textContent = totalBlocked.toString();
    }
    
    // 중요 콘텐츠를 나타내는 선택자 목록 (보존할 요소들)
    const preserveSelectors = [
        // 게시판 및 게시글 관련 필수 요소
        '.board_list',
        '.board_read',
        '.board_content',
        '.board_header',
        '.document_list',
        '.document',
        '.articleList',
        '.article',
        '.board',
        
        // 사이트 레이아웃 필수 요소
        '.sl-header',
        '.sl-footer',
        '.sl-body',
        '.sl-footer-body',
        '.sl-footer-logo',
        '.footer-menu',
        '.sl-footer-1st',
        '.sl-footer-2nd',
        'nav[role="navigation"]',
        
        // 컨텐츠 요소
        '.board', 
        '.sl-card',
        '.sl-category',
        '.sl-content',
        
        // 테이블 요소
        'table', 'tr', 'td', '.board_table', '.list_table'
    ];
    
    // 광고 영역을 제거하는 함수
    function removeAds() {
        debugLog('광고 차단 시작');
        updateStatus('광고 스캔 중...');
        
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
            
            // 기타 광고 컨테이너
            '.ns-hiaaa-l-towerA',
            '.slsmvbn',
            '.adfit',
            'div[id^="div-gpt-ad"]',
            
            // 일반 광고 관련 클래스/ID
            '[id*="ad-"]:not(#adblock-debug-panel)', 
            '[class*="ad-"]:not(.adblock-debug)',
            '[id*="banner"]:not(.site-banner)',
            '[class*="banner"]:not(.site-banner)'
        ];
        
        // 1. 일반 광고 컨테이너 제거
        let removedCount = 0;
        adContainerSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    debugLog(`선택자 '${selector}'로 ${elements.length}개 요소 발견`);
                }
                
                elements.forEach(element => {
                    // 보존해야 할 중요 요소의 자식인지 확인
                    if (isPreservedElement(element)) {
                        debugLog(`보존 요소 발견: ${element.tagName} - 차단하지 않음`);
                        return; // 중요 요소의 자식이면 건너뜀
                    }
                    
                    // 광고 컨테이너 제거 처리
                    removeAdContainer(element);
                    removedCount++;
                    totalBlocked++;
                });
            } catch (e) {
                // 오류 무시 (예: 복잡한 선택자 지원 안됨)
                debugLog('광고 제거 오류(무시됨):', e.message);
            }
        });
        
        // 2. 광고 iframe 부모 컨테이너 제거
        const adIframes = document.querySelectorAll('iframe[src*="googleads"], iframe[src*="doubleclick"]');
        if (adIframes.length > 0) {
            debugLog(`광고 iframe ${adIframes.length}개 발견`);
        }
        
        adIframes.forEach(frame => {
            // 상위 컨테이너 찾아서 제거 (최대 3단계 상위까지)
            findAndRemoveAdContainer(frame, 3);
            removedCount++;
            totalBlocked++;
        });
        
        // 3. 특정 컨테이너 구조 기반 제거 (사용자가 제공한 HTML 구조)
        const specificCount = removeSpecificContainers();
        removedCount += specificCount;
        totalBlocked += specificCount;
        
        debugLog(`총 ${removedCount}개 광고 요소 처리 완료`);
        updateStatus(`준비 완료 (${removedCount}개 요소 처리됨)`);
        
        if (DEBUG_MODE && (removedCount === 0 || FORCE_DEBUG_UI)) {
            createDebugPanel();
        }
        
        // 테스트용: 첫 번째 div를 테스트 요소로 표시
        try {
            if (removedCount === 0) {
                const testElement = document.querySelector('div:not(#adblock-debug-panel)');
                if (testElement && !testElement.dataset.testElement) {
                    testElement.dataset.testElement = 'true';
                    testElement.dataset.adBlockerRemoved = 'true';
                    testElement.style.border = '3px dashed green';
                    debugLog('테스트 요소 표시:', testElement);
                }
            }
        } catch (e) {
            debugLog('테스트 요소 오류:', e);
        }
    }
    
    // 광고 컨테이너를 완전히 제거하는 함수
    function removeAdContainer(element) {
        if (!element || !element.style) return;
        
        // 요소가 이미 처리되었는지 확인
        if (element.dataset.adBlockerRemoved === 'true') return;
        
        // 디버그 모드일 때는 요소를 시각적으로 표시만 하고 제거하지 않음
        if (DEBUG_MODE) {
            Object.keys(DEBUG_STYLES).forEach(prop => {
                element.style[prop] = DEBUG_STYLES[prop];
            });
            element.title = '광고 차단 스크립트에 의해 감지된 요소';
            element.dataset.adBlockerRemoved = 'true';
            debugLog('차단된 요소:', element.tagName, element);
            
            // 초기 마크 모드에 따라 표시/숨김 설정
            if (!markMode) {
                element.style.display = 'none';
            }
            
            return;
        }
        
        // 실제 모드에서는 요소를 완전히 숨김
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
            if (isPreservedElement(currentElement)) {
                debugLog('보존 요소 발견(부모 탐색):', currentElement.tagName);
                break;
            }
            
            // 광고 관련 특성이 있는지 확인
            const isAdContainer = checkIfAdContainer(currentElement);
            
            if (isAdContainer) {
                debugLog('광고 컨테이너 발견:', currentElement.tagName, currentElement);
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
        let count = 0;
        // 1. 사용자가 제공한 HTML 구조 - 광고 컨테이너
        try {
            // 광고 컨테이너 #ad-container 제거
            const adContainers = document.querySelectorAll('#ad-container');
            if (adContainers.length > 0) {
                debugLog(`#ad-container ${adContainers.length}개 발견`);
            }
            
            adContainers.forEach(container => {
                if (!isPreservedElement(container)) {
                    removeAdContainer(container);
                    count++;
                    
                    // 부모 요소도 확인하여 제거
                    if (container.parentElement && !isPreservedElement(container.parentElement)) {
                        const parent = container.parentElement;
                        if (parent.children.length <= 2) {
                            removeAdContainer(parent);
                            count++;
                        }
                    }
                }
            });
            
            // 하단 배너 광고 - custom-banner와 관련 요소들
            const customBanners = document.querySelectorAll('aside.custom-cul-banner, .custom-banner');
            if (customBanners.length > 0) {
                debugLog(`배너 요소 ${customBanners.length}개 발견`);
            }
            
            customBanners.forEach(banner => {
                if (!isPreservedElement(banner)) {
                    removeAdContainer(banner);
                    count++;
                    
                    // 관련된 다음 요소가 텍스트 컨테이너인 경우 그것도 제거
                    const nextElement = banner.nextElementSibling;
                    if (nextElement && nextElement.tagName === 'P' && 
                        !isPreservedElement(nextElement)) {
                        removeAdContainer(nextElement);
                        count++;
                    }
                }
            });
            
            // 파워링크 광고
            const powerLinks = document.querySelectorAll('#powerLink, #powerLink1, .powerlink');
            if (powerLinks.length > 0) {
                debugLog(`파워링크 요소 ${powerLinks.length}개 발견`);
            }
            
            powerLinks.forEach(link => {
                if (!isPreservedElement(link)) {
                    removeAdContainer(link);
                    count++;
                }
            });
        } catch (e) {
            debugLog('특정 컨테이너 제거 오류(무시됨):', e.message);
        }
        
        return count;
    }
    
    // 요소가 보존해야 할 중요 콘텐츠인지 확인하는 함수
    function isPreservedElement(element) {
        if (!element) return false;
        
        // 중요 요소 판단 로직 강화: sl-footer 클래스가 있는 요소는 항상 보존
        if ((element.className && 
             typeof element.className === 'string' && 
             (element.className.includes('sl-footer') || 
              element.className.includes('board_list') ||
              element.className.includes('sl-header')))) {
            return true;
        }
        
        // ID 기반 중요 요소 판단 추가
        if (element.id) {
            const id = element.id.toLowerCase();
            if (id === 'content' || id === 'board' || id === 'list' ||
                id === 'wrapper' || id === 'container') {
                return true;
            }
        }
        
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
                    className.includes('list') || className.includes('footer')) {
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
        try {
            debugLog('광고 차단 스크립트 초기화 중...');
            
            // 디버그 패널 생성 (FORCE_DEBUG_UI가 true이면 항상 생성)
            if (DEBUG_MODE && FORCE_DEBUG_UI) {
                // 콘텐츠가 로드된 후 디버그 패널 생성
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', createDebugPanel);
                } else {
                    createDebugPanel();
                }
            }
            
            // 즉시 실행
            setTimeout(removeAds, 0);
            
            // 페이지 로드 시 실행
            window.addEventListener('load', function() {
                removeAds();
                updateStatus('페이지 로드 완료');
            });
            
            // DOMContentLoaded 시에도 실행 (더 빠른 차단을 위해)
            window.addEventListener('DOMContentLoaded', function() {
                removeAds();
                updateStatus('DOM 로드 완료');
            });
            
            // 동적으로 추가되는 요소 감시
            try {
                const observer = new MutationObserver(function(mutations) {
                    let needsUpdate = false;
                    
                    mutations.forEach(mutation => {
                        if (mutation.addedNodes.length > 0) {
                            needsUpdate = true;
                        }
                    });
                    
                    if (needsUpdate) {
                        removeAds();
                    }
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
            } catch (e) {
                debugLog('MutationObserver 오류:', e.message);
            }
            
            // 지연 로드되는 광고 처리를 위한 반복 실행
            const intervals = [500, 1000, 2000, 3000, 5000];
            intervals.forEach(ms => {
                setTimeout(function() {
                    removeAds();
                    updateStatus(`${ms/1000}초 후 재스캔 완료`);
                }, ms);
            });
            
            // 10초 후 강제로 잠재적 광고 요소 표시
            setTimeout(function() {
                if (totalBlocked === 0) {
                    debugLog('광고 요소가 발견되지 않아 잠재적 광고 요소 표시');
                    forceMarkPotentialAds();
                }
            }, 10000);
        } catch (e) {
            console.error('광고 차단 초기화 오류:', e);
            alert('광고 차단 스크립트 오류: ' + e.message);
        }
    }
    
    // 스크립트 실행
    initAdBlocker();
})(); 