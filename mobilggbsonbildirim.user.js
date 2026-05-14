    // ==UserScript==
    // @name         Show Hidden Columns on GGB Son Bildirim
    // @namespace    http://tampermonkey.net/
    // @version      2.0
    // @description  Show hidden Gümrük Başvuru No and Gümrük Başvuru Tarihi columns on ggbsonbildirim.tarimorman.gov.tr
    // @author       Grok
    // @match        https://ggbsonbildirim.tarimorman.gov.tr/*
    // @grant        none
    // @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
    // @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
    // ==/UserScript==

    (function() {
        'use strict';

        const injectStyles = () => {
            const styleId = 'premium-ggb-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* Ana Konteyner İyileştirmeleri */
                .table-responsive, .dataTables_wrapper {
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch;
                    border-radius: 12px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
                    border: 1px solid #e2e8f0 !important;
                    background: #ffffff !important;
                    padding: 8px !important;
                    margin-top: 15px !important;
                }

                /* Gizli Sütunları Zorla Göster */
                th:nth-child(7), th:nth-child(8),
                td:nth-child(7), td:nth-child(8),
                [style*="display: none"] {
                    display: table-cell !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }

                /* Başlık ve Hücre Tasarımı */
                table.table thead th {
                    background-color: #f8fafc !important;
                    color: #475569 !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    font-size: 11px !important;
                    letter-spacing: 0.05em !important;
                    padding: 14px 10px !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    white-space: nowrap !important;
                    position: sticky !important;
                    top: 0;
                    z-index: 20;
                }

                table.table tbody td {
                    padding: 12px 10px !important;
                    font-size: 13px !important;
                    color: #1e293b !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                /* Yeni Eklenen Sütunlara Hafif Vurgu */
                td:nth-child(7), td:nth-child(8) {
                    background-color: #f0f9ff66 !important;
                    font-weight: 500;
                }

                /* Hover/Focus Durumunda Hücreyi Genişlet */
                table.table tbody td:hover, table.table tbody td:active {
                    white-space: normal !important;
                    overflow: visible !important;
                    background-color: #fff !important;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                /* İlk Sütunu Sabitle (Navigasyon Kolaylığı) */
                table.table td:first-child, 
                table.table th:first-child {
                    position: sticky !important;
                    left: 0;
                    background: #fff !important;
                    z-index: 15;
                    border-right: 2px solid #f1f5f9 !important;
                }
                table.table th:first-child { z-index: 25; background: #f8fafc !important; }

                /* Premium Scrollbar */
                .table-responsive::-webkit-scrollbar { height: 6px; }
                .table-responsive::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
                .table-responsive::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .table-responsive::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `;
            document.head.appendChild(style);
        };

        const applyFixes = () => {
            document.querySelectorAll('table').forEach(table => {
                const parent = table.parentElement;
                if (parent && !parent.classList.contains('table-responsive')) {
                    parent.style.overflowX = 'auto';
                    parent.style.display = 'block';
                    parent.style.width = '100%';
                }
                
                table.querySelectorAll('[style*="display: none"]').forEach(el => {
                    el.style.setProperty('display', 'table-cell', 'important');
                });
            });
        };

        injectStyles();
        applyFixes();

        const observer = new MutationObserver(() => {
            applyFixes();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    })();