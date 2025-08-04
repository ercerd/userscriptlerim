// ==UserScript==
// @name         Show Hidden Columns on GGB Son Bildirim
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Show hidden Gümrük Başvuru No and Gümrük Başvuru Tarihi columns on ggbsonbildirim.tarimorman.gov.tr
// @author       Grok
// @match        https://ggbsonbildirim.tarimorman.gov.tr/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// ==/UserScript==

(function() {
    'use strict';

    // CSS enjeksiyonu ile medya sorgularını geçersiz kıl
    const style = document.createElement('style');
    style.innerHTML = `
        @media only screen and (max-width: 1100px) {
            th:nth-child(7), th:nth-child(8) {
                display: table-cell !important;
                width: auto !important;
                min-width: 100px !important;
            }
            td:nth-child(7), td:nth-child(8) {
                display: table-cell !important;
                width: auto !important;
                min-width: 100px !important;
            }
        }
        th[style*="display: none"], td[style*="display: none"] {
            display: table-cell !important;
            width: auto !important;
            min-width: 100px !important;
        }
    `;
    document.head.appendChild(style);

    // Doğrudan stil özniteliklerini kaldır
    document.querySelectorAll('th[style*="display: none"], td[style*="display: none"]').forEach(element => {
        element.style.display = 'table-cell';
        element.style.width = '100px';
        element.style.minWidth = '100px';
    });
})();