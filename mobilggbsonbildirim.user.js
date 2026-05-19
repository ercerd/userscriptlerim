// ==UserScript==
// @name         Show Hidden Columns on GGB Son Bildirim
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Show hidden Gümrük Başvuru No and Gümrük Başvuru Tarihi columns on ggbsonbildirim.tarimorman.gov.tr
// @author       Grok
// @match        https://ggbsonbildirim.tarimorman.gov.tr/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Toast notification helper
    const showToast = (message, type = 'success') => {
        let toastContainer = document.getElementById('ggb-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'ggb-toast-container';
            toastContainer.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:10000;';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            padding: 10px 20px;
            border-radius: 8px;
            color: #fff;
            margin-top: 10px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
            transition: all 0.3s ease;
            opacity: 1;
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    };

    // Clipboard copy helper
    const copyToClipboard = (text) => {
        if (!text) {
            showToast('Kopyalanacak ID bulunamadı!', 'error');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('ID Kopyalandı: ' + text, 'success');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                showToast('ID Kopyalandı: ' + text, 'success');
            } else {
                showToast('Kopyalanamadı!', 'error');
            }
        } catch (err) {
            showToast('Kopyalanamadı!', 'error');
        }
    };

    const injectStyles = () => {
        const styleId = 'premium-ggb-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            /* Ana Konteyner Taşma İyileştirmesi */
            .table-responsive, .dataTables_wrapper {
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch;
                border-radius: 8px !important;
                border: 1px solid #e2e8f0 !important;
                margin-top: 15px !important;
            }

            /* Gizli Sütunları Zorla Göster (Gümrük Başvuru No vb.) */
            th:nth-child(7), th:nth-child(8),
            td:nth-child(7), td:nth-child(8),
            [style*="display: none"] {
                display: table-cell !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            /* Premium ID Kopyalama Butonu */
            .ggb-id-btn {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                color: white !important;
                border: none !important;
                border-radius: 4px !important;
                padding: 2px 8px !important;
                font-size: 10px !important;
                font-weight: 700 !important;
                letter-spacing: 0.5px !important;
                cursor: pointer !important;
                margin-left: 6px !important;
                display: inline-block !important;
                vertical-align: middle !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                transition: all 0.2s ease !important;
            }
            .ggb-id-btn:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
            }
            .ggb-id-btn:active {
                transform: translateY(0) !important;
            }
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
                el.style.setProperty('display', 'table-cell', 'important');
            });

            // Tablo satırlarını düzenle
            const rows = Array.from(table.querySelectorAll('tr'));
            if (rows.length === 0) return;

            const headerRow = table.querySelector('thead tr') || rows[0];
            if (!headerRow) return;

            const headers = Array.from(headerRow.children);
            let onbildirimIdx = -1;
            let gumrukNoIdx = -1;

            headers.forEach((th, idx) => {
                const text = th.textContent.toLowerCase().trim();
                if (text.includes('ön bildirim') || text.includes('on bıldırım') || text.includes('onbildirim') || text.includes('bildirim no')) {
                    if (onbildirimIdx === -1) onbildirimIdx = idx;
                } else if (text.includes('gümrük başvuru') || text.includes('gumruk basvuru') || text.includes('id no') || text.includes('başvuru no')) {
                    if (gumrukNoIdx === -1) gumrukNoIdx = idx;
                }
            });

            if (onbildirimIdx === -1 || gumrukNoIdx === -1) return;

            rows.forEach((row, rIdx) => {
                if (row === headerRow) return;

                const cells = Array.from(row.children);
                if (cells.length < Math.max(onbildirimIdx, gumrukNoIdx) + 1) return;

                const onbildirimCell = cells[onbildirimIdx];
                const gumrukNoCell = cells[gumrukNoIdx];

                if (onbildirimCell && gumrukNoCell) {
                    if (!onbildirimCell.querySelector('.ggb-id-btn')) {
                        const btn = document.createElement('button');
                        btn.className = 'ggb-id-btn';
                        btn.textContent = 'ID';
                        btn.title = 'Gümrük Başvuru No Kopyala';
                        
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const idText = gumrukNoCell.textContent.replace(/\s+/g, '').trim();
                            copyToClipboard(idText);
                        });

                        onbildirimCell.appendChild(btn);
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