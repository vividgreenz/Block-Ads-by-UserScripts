// ==UserScript==
// @name         셀렉터 진단
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        const result = [
            'viewfiledownload: ' + document.querySelectorAll('.viewfiledownload').length,
            'view_file_download: ' + document.querySelectorAll('.view_file_download').length,
            'tags_1: ' + (document.querySelector('#tags_1') ? '있음' : '없음'),
            'tags-item: ' + document.querySelectorAll('.tags-item').length,
        ].join('\n');

        const box = document.createElement('div');
        box.setAttribute('style',
            'position:fixed;top:0;left:0;width:100%;background:yellow;' +
            'color:black;font-size:14px;z-index:999999;padding:10px;white-space:pre;'
        );
        box.textContent = result;
        document.body.appendChild(box);
    }, 2000);
})();
