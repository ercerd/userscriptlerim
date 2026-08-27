// ==UserScript==
// @name         GGBS Ön Bildirim - Sütun/Captcha Araçları + A4 Yazdırma Düzeni
// @namespace    http://tampermonkey.net/
// @version      4
// @description  Gizli sütunları gösterir, ID kopyalama butonu ekler, captcha'yı otomatik doldurur; ayrıca Ön Bildirim yazdırma sayfasını A4'e sığacak şekilde otomatik ölçekler.
// @author       Grok (sütun/captcha bölümü) + Ercan (A4 düzenleme bölümü)
// @match        https://ggbsonbildirim.tarimorman.gov.tr/*
// @match        https://ggbsonbildirimtest.tarimorman.gov.tr/*
// @match        https://172.20.50.104/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/mobilggbsonbildirim.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ================================================================
    // BÖLÜM 1: Gizli sütunlar / ID kopyalama / captcha otomatik doldurma
    // Tüm eşleşen GGBS sayfalarında çalışır (liste, arama vb.)
    // ================================================================

    function fillCaptcha() {
        const hiddenInput = document.getElementById('generatedGuvenlikKodu');
        if (hiddenInput) {
            const captchaValue = hiddenInput.value;
            const captchaInput = document.getElementById('guvenlikKodu');
            if (captchaInput && captchaInput.value !== captchaValue) {
                captchaInput.value = captchaValue;
            }
        }
    }

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

    const injectTableStyles = () => {
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
        fillCaptcha();

        document.querySelectorAll('table').forEach(table => {
            const parent = table.parentElement;
            if (parent && !parent.classList.contains('table-responsive')) {
                parent.style.overflowX = 'auto';
                parent.style.width = '100%';
            }

            table.querySelectorAll('[style*="display: none"]').forEach(el => {
                el.style.setProperty('display', 'table-cell', 'important');
            });

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

            rows.forEach((row) => {
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

    function initTableTools() {
        injectTableStyles();
        applyFixes();

        window.addEventListener('load', applyFixes);

        const observer = new MutationObserver((mutations) => {
            let shouldRun = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    shouldRun = true;
                }
            });
            if (shouldRun) {
                applyFixes();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    // @run-at document-start ile çalıştığımız için document.body henüz
    // hazır olmayabilir; hazır değilse DOMContentLoaded'ı bekle.
    if (document.body) {
        initTableTools();
    } else {
        document.addEventListener('DOMContentLoaded', initTableTools);
    }

    // ================================================================
    // BÖLÜM 2: A4 Yazdırma Düzeni
    // SADECE Ön Bildirim yazdırma sayfasında çalışır — bu bölümdeki CSS
    // body'nin font/arka plan gibi genel stillerini de değiştirdiği için
    // diğer GGBS sayfalarına (listeler, formlar vb.) SIZMAMASI için
    // URL kontrolü ile sınırlandırıldı.
    // ================================================================

    const ONBILDIRIM_YAZDIR_SAYFASI = location.pathname.indexOf('OnBildirimDosyaIndir') !== -1;

    if (ONBILDIRIM_YAZDIR_SAYFASI) {

        const a4Css = `
            @page {
                size: A4 portrait;
                margin: 15mm 12mm 5mm 12mm;
            }

            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }

            body {
                font-family: Arial, sans-serif !important;
                font-size: 13px !important;
                background: white !important;
            }

            /* Belgenin tamamını A4 içinde ortala */
            #yazdir,
            .base-container {
                box-sizing: border-box !important;
                width: 186mm !important;
                max-width: 186mm !important;
                margin: 0 auto !important;
                padding: 4mm !important;
                border: 1px solid #000 !important;
            }

            /* Ana tablo */
            #yazdir > table {
                width: 100% !important;
                table-layout: fixed !important;
                margin: 0 auto !important;
            }

            /* SOL ve SAĞ sütunlar eşit */
            #yazdir > table > tbody > tr > td {
                width: 50% !important;
                box-sizing: border-box !important;
                vertical-align: top !important;
            }

            /* İç tablolar */
            .nested-table {
                width: 100% !important;
                table-layout: fixed !important;
                margin: 0 !important;
            }

            /* İç tablolardaki etiket/değer sütunları */
            .nested-table td {
                box-sizing: border-box !important;
                padding: 3px 4px !important;
                vertical-align: top !important;
                overflow-wrap: anywhere !important;
                word-break: normal !important;
            }

            .nested-table tr td:first-child:not([colspan]) {
                width: 52% !important;
            }

            .nested-table tr td:nth-child(2) {
                width: 48% !important;
            }

            /* Başlık */
            .header {
                width: 100% !important;
                box-sizing: border-box !important;
            }

            .logo {
                width: 150px !important;
                height: auto !important;
            }

            .title {
                font-size: 16px !important;
                text-align: center !important;
            }

            /* Yazdırma (zoom JS ile dinamik uygulanıyor, burada sabit değer YOK) */
            @media print {

                #yazdir,
                .base-container {
                    width: 186mm !important;
                    max-width: 186mm !important;
                    margin-left: auto !important;
                    margin-right: auto !important;
                    box-shadow: none !important;
                }

                table {
                    page-break-inside: auto;
                }

                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }

                .nested-table {
                    page-break-inside: avoid;
                }
            }
        `;

        function injectA4CSS() {
            if (document.getElementById('ggbs-a4-duzenleme')) return;

            const style = document.createElement('style');
            style.id = 'ggbs-a4-duzenleme';
            style.textContent = a4Css;

            (document.head || document.documentElement).appendChild(style);
        }

        injectA4CSS();

        new MutationObserver(injectA4CSS).observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // ---- OTOMATİK ÖLÇEKLEME (dinamik zoom) ----
        // İçerik miktarı belgeden belgeye değiştiği için sabit bir zoom
        // yerine, yazdırmadan hemen önce gerçek içerik yüksekliği ölçülüp
        // A4 sayfasına tam sığacak zoom oranı hesaplanır.

        const MM_TO_PX           = 96 / 25.4; // CSS mm -> px dönüşümü (96dpi)
        const SAYFA_YUKSEKLIK_MM = 297;        // A4 yüksekliği
        const SAYFA_UST_MM       = 15;         // yukarıdaki @page üst margin ile AYNI olmalı
        const SAYFA_ALT_MM       = 5;          // yukarıdaki @page alt margin ile AYNI olmalı
        const GUVENLIK_PAYI      = 0.965;      // yuvarlama/tarayıcı farklarına karşı ~%3.5 pay
        const MIN_ZOOM           = 0.5;        // çok uzun belgelerde okunabilirlik alt sınırı
        const MAX_ZOOM           = 1.15;       // çok kısa belgelerde aşırı büyümeyi engelle

        function hesaplaZoom() {
            const container = document.querySelector('#yazdir, .base-container');
            if (!container) return 1;

            const oncekiZoom = document.body.style.zoom;
            document.body.style.zoom = '1';

            const dogalYukseklikPx = container.getBoundingClientRect().height;

            document.body.style.zoom = oncekiZoom;

            if (!dogalYukseklikPx) return 1;

            const kullanilabilirYukseklikPx =
                (SAYFA_YUKSEKLIK_MM - SAYFA_UST_MM - SAYFA_ALT_MM) * MM_TO_PX * GUVENLIK_PAYI;

            let zoom = kullanilabilirYukseklikPx / dogalYukseklikPx;
            zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
            return zoom;
        }

        window.addEventListener('beforeprint', function () {
            const zoom = hesaplaZoom();
            document.body.style.zoom = String(zoom);
        });

        window.addEventListener('afterprint', function () {
            document.body.style.zoom = '';
        });
    }

})();