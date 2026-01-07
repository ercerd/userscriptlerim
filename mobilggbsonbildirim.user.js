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
                th:nth-child(7), th:nth-child(8),
                td:nth-child(7), td:nth-child(8) {
                    display: table-cell !important;
                    width: auto !important;
                }
            }
            th[style*="display: none"], td[style*="display: none"] {
                display: table-cell !important;
                width: auto !important;
            }
            /* Tabloyu saran elemana yatay kaydırma ekle */
            .table-responsive, .dataTables_wrapper {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
            }
            /* Eğer tablo bir div içinde değilse veya wrapper yoksa tabloya stil ver */
            table {
                max-width: 100%;
            }
        `;
        document.head.appendChild(style);

        // Doğrudan stil özniteliklerini kaldır ancak genişlik zorlama
        document.querySelectorAll('th[style*="display: none"], td[style*="display: none"]').forEach(element => {
            element.style.display = 'table-cell';
            // Genişlik ayarlarını siliyoruz ki tablo patlamasın
            element.style.width = '';
            element.style.minWidth = '';
        });

        // Tablonun ebeveyn elementine scroll özelliği kazandır
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const parent = table.parentElement;
            if (parent) {
                parent.style.overflowX = 'auto';
                parent.style.width = '100%';
                parent.style.display = 'block'; // Block yaparak genişliği konteyner ile sınırlar
            }
        });
    })();