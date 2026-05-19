// ==UserScript==
    // @name         Show Hidden Columns on GGB Son Bildirim
    // @namespace    http://tampermonkey.net/
    // @version      2.4
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
                    clear: both !important;
                }

                @media only screen and (max-width: 768px) {
                    .table-responsive, .dataTables_wrapper {
                        margin-top: 180px !important; /* Logoların ve başlığın tablonun üstüne binmesini önler */
                    }
                }

                @media only screen and (min-width: 769px) {
                    .table-responsive, .dataTables_wrapper {
                        margin-top: 15px !important;
                    }
                }

                /* Gizli Sütunları Zorla Göster (Bizim gizlediklerimiz hariç) */
                th:not(.hidden-onay), td:not(.hidden-onay) {
                    display: table-cell;
                }
                
                th:nth-child(7), th:nth-child(8),
                td:nth-child(7), td:nth-child(8),
                [style*="display: none"]:not(.hidden-onay) {
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

                /* Ön Bildirim Numarası Sütununu Sabitle (Sol) */
                table.table td.sticky-onbildirim, 
                table.table th.sticky-onbildirim {
                    position: sticky !important;
                    left: 0 !important;
                    background-color: #ffffff !important;
                    z-index: 15 !important;
                    border-right: 1px solid #e2e8f0 !important;
                    width: 90px !important;
                    min-width: 90px !important;
                    max-width: 90px !important;
                }
                table.table td.sticky-onbildirim {
                    font-family: monospace !important;
                    font-size: 11px !important;
                    letter-spacing: -0.5px !important;
                    white-space: normal !important;
                    word-break: break-all !important;
                }
                table.table th.sticky-onbildirim {
                    background-color: #f8fafc !important;
                    z-index: 16 !important;
                    white-space: normal !important;
                }

                /* Gümrük Başvuru No Sütununu Sabitle (Ön Bildirimin Yanında) */
                table.table td.sticky-gumrukno, 
                table.table th.sticky-gumrukno {
                    position: sticky !important;
                    left: 90px !important;
                    background-color: #f0f9ff !important;
                    z-index: 15 !important;
                    border-right: 2px solid #e2e8f0 !important;
                    width: 90px !important;
                    min-width: 90px !important;
                    max-width: 90px !important;
                }
                table.table td.sticky-gumrukno {
                    font-family: monospace !important;
                    font-size: 11px !important;
                    letter-spacing: -0.5px !important;
                    white-space: normal !important;
                    word-break: break-all !important;
                }
                table.table th.sticky-gumrukno {
                    background-color: #e0f2fe !important;
                    z-index: 16 !important;
                    white-space: normal !important;
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
                    parent.style.width = '100%';
                }
                
                table.querySelectorAll('[style*="display: none"]').forEach(el => {
                    if (!el.classList.contains('hidden-onay')) {
                        el.style.setProperty('display', 'table-cell', 'important');
                    }
                });

                // Tablo sütun yerleşimlerini dinamik olarak düzenleyelim
                const rows = table.querySelectorAll('tr');
                if (rows.length === 0) return;

                const headerRow = table.querySelector('thead tr') || rows[0];
                if (!headerRow) return;

                // Eğer zaten düzenleme yapılmışsa tekrar yapma
                if (headerRow.querySelector('[data-orig-idx]')) return;

                const headers = Array.from(headerRow.children);
                let onayIdx = -1;
                let onbildirimIdx = -1;
                let gumrukNoIdx = -1;

                headers.forEach((th, idx) => {
                    const text = th.textContent.toLowerCase().trim();
                    if (text.includes('onay') || text.includes('durum') || text.includes('seç') || text === '') {
                        if (onayIdx === -1) onayIdx = idx;
                    } else if (text.includes('ön bildirim') || text.includes('on bıldırım') || text.includes('onbildirim')) {
                        if (onbildirimIdx === -1) {
                            onbildirimIdx = idx;
                            th.textContent = 'Bildirim No';
                        }
                    } else if (text.includes('gümrük başvuru no') || text.includes('gumruk basvuru no') || text.includes('gümrük başvuru numara')) {
                        if (gumrukNoIdx === -1) {
                            gumrukNoIdx = idx;
                            th.textContent = 'ID No';
                        }
                    }
                });

                // Bulunamazsa tahmin et
                if (onayIdx === -1) onayIdx = 0;
                if (onbildirimIdx === -1) onbildirimIdx = headers.length > 4 ? 4 : -1;
                if (gumrukNoIdx === -1) gumrukNoIdx = headers.length > 6 ? 6 : -1;

                if (onbildirimIdx === -1 || gumrukNoIdx === -1) return;

                rows.forEach(row => {
                    const cells = Array.from(row.children);
                    if (cells.length < Math.max(onayIdx, onbildirimIdx, gumrukNoIdx) + 1) return;

                    const onayCell = cells[onayIdx];
                    const onbildirimCell = cells[onbildirimIdx];
                    const gumrukNoCell = cells[gumrukNoIdx];

                    if (onayCell) {
                        onayCell.style.setProperty('display', 'none', 'important');
                        onayCell.classList.add('hidden-onay');
                    }

                    if (onbildirimCell) {
                        onbildirimCell.setAttribute('data-orig-idx', onbildirimIdx);
                        onbildirimCell.classList.add('sticky-onbildirim');
                        row.insertBefore(onbildirimCell, row.firstChild);
                    }

                    if (gumrukNoCell) {
                        gumrukNoCell.setAttribute('data-orig-idx', gumrukNoIdx);
                        gumrukNoCell.classList.add('sticky-gumrukno');
                        if (onbildirimCell) {
                            row.insertBefore(gumrukNoCell, onbildirimCell.nextSibling);
                        } else {
                            row.insertBefore(gumrukNoCell, row.firstChild);
                        }
                    }
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