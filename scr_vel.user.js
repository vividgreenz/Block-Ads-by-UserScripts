// ==UserScript==
// @name         테스트
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    alert('스크립트 실행됨!');
    console.log('viewfiledownload 개수:', document.querySelectorAll('.viewfiledownload').length);
    console.log('tags_1 존재:', !!document.querySelector('#tags_1'));
})();
