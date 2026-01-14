// ==UserScript==
// @name         Konat Unified (Fatura İşlemleri + Menü)
// @namespace    http://tampermonkey.net/ 
// @version      1.5
// @description  Konat fatura işlemleri (PDF indir, birleştir, filtrele) ve menü düzenlemelerini (kısayollar, genişletilmiş menü) tek çatı altında toplar.
// @match        https://konat.net.tr/dss33/v33/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
// ==/UserScript==

(function () {
    'use strict';

    // ==========================================
    // BÖLÜM 1: Fatura İşlemleri ve PDF Araçları
    // ==========================================

    // Sadece 'islemdeki-belgeler' sayfasında çalışması gereken fatura işlemleri
    const isIslemdekiBelgeler = window.location.href.includes('islemdeki-belgeler');

    if (isIslemdekiBelgeler) {
        const { PDFDocument } = PDFLib;

        // PDF.js worker'ı ayarla
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        // === CSS ===
        GM_addStyle(
            `.custom-top-bar {
                position: fixed;
                top: 50px;
                left: 0;
                right: 0;
                min-height: 40px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
                display: flex;
                align-items: center;
                padding: 5px;
                gap: 8px;
                z-index: 999;
                flex-wrap: wrap;
            }
            .action-button {
                padding: 6px 12px;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                height: 30px;
                white-space: nowrap;
            }
            #downloadButton { background-color: #4CAF50; }
            #pauseButton { background-color: #f44336; }
            #autoApproveButton { background-color: #2196F3; }
            #stopApproveButton { background-color: #FFC107; }
            #copyLinksButton { background-color: #9C27B0; }
            #mergeButton { background-color: #FF5722; }
            .status-text {
                padding: 4px 8px;
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 5px;
                font-size: 13px;
                border: 1px solid #ddd;
            }
            /* body padding arttırılıyor ki üst bar içeriği kapatmasın */
            body { padding-top: 90px !important; }

            /* Modal */
            .merge-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.7);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            .merge-modal-content {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .merge-modal h2 {
                margin-top: 0;
                color: #333;
            }
            .merge-progress {
                width: 100%;
                height: 30px;
                background-color: #f0f0f0;
                border-radius: 5px;
                overflow: hidden;
                margin: 15px 0;
            }
            .merge-progress-bar {
                height: 100%;
                background-color: #4CAF50;
                width: 0%;
                transition: width 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            .merge-log {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
                max-height: 300px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                margin: 15px 0;
            }
            .merge-log div {
                margin: 5px 0;
            }
            .log-success { color: #4CAF50; }
            .log-error { color: #f44336; }
            .log-info { color: #2196F3; }
            .log-warning { color: #FF9800; }
            .merge-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            .modal-button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            .modal-button.primary {
                background-color: #4CAF50;
                color: white;
            }
            .modal-button.secondary {
                background-color: #ddd;
                color: #333;
            }
        `
        );

        // === UI Elemanları ===
        const startDateInput = document.createElement('input');
        startDateInput.type = 'date';
        startDateInput.id = 'startDateInput';
        startDateInput.title = 'Başlangıç Tarihi';

        const endDateInput = document.createElement('input');
        endDateInput.type = 'date';
        endDateInput.id = 'endDateInput';
        endDateInput.title = 'Bitiş Tarihi';

        const companyInput = document.createElement('input');
        companyInput.type = 'text';
        companyInput.id = 'companyInput';
        companyInput.placeholder = 'Firma Adı...';
        companyInput.title = 'Firma Adı ile Filtrele';
        companyInput.style.padding = '4px';
        companyInput.style.borderRadius = '4px';
        companyInput.style.border = '1px solid #ccc';
        companyInput.style.height = '30px'; // Diğer butonlarla uyumlu yükseklik

        const hideNoPdfContainer = document.createElement('div');
        hideNoPdfContainer.style.display = 'flex';
        hideNoPdfContainer.style.alignItems = 'center';
        hideNoPdfContainer.style.gap = '5px';
        hideNoPdfContainer.title = 'PDF linki bulunmayan satırları gizle';

        const hideNoPdfCheckbox = document.createElement('input');
        hideNoPdfCheckbox.type = 'checkbox';
        hideNoPdfCheckbox.id = 'hideNoPdfCheckbox';
        hideNoPdfCheckbox.style.cursor = 'pointer';

        const hideNoPdfLabel = document.createElement('label');
        hideNoPdfLabel.htmlFor = 'hideNoPdfCheckbox';
        hideNoPdfLabel.textContent = 'PDF Olmayanları Gizle';
        hideNoPdfLabel.style.fontSize = '13px';
        hideNoPdfLabel.style.cursor = 'pointer';
        hideNoPdfLabel.style.userSelect = 'none';

        hideNoPdfContainer.append(hideNoPdfCheckbox, hideNoPdfLabel);

        const hideWithPdfContainer = document.createElement('div');
        hideWithPdfContainer.style.display = 'flex';
        hideWithPdfContainer.style.alignItems = 'center';
        hideWithPdfContainer.style.gap = '5px';
        hideWithPdfContainer.title = 'PDF linki bulunan satırları gizle';

        const hideWithPdfCheckbox = document.createElement('input');
        hideWithPdfCheckbox.type = 'checkbox';
        hideWithPdfCheckbox.id = 'hideWithPdfCheckbox';
        hideWithPdfCheckbox.style.cursor = 'pointer';

        const hideWithPdfLabel = document.createElement('label');
        hideWithPdfLabel.htmlFor = 'hideWithPdfCheckbox';
        hideWithPdfLabel.textContent = 'PDF Olanları Gizle';
        hideWithPdfLabel.style.fontSize = '13px';
        hideWithPdfLabel.style.cursor = 'pointer';
        hideWithPdfLabel.style.userSelect = 'none';

        hideWithPdfContainer.append(hideWithPdfCheckbox, hideWithPdfLabel);

        const downloadButton = document.createElement('button');
        downloadButton.id = 'downloadButton';
        downloadButton.className = 'action-button';
        downloadButton.textContent = "Tüm PDF'leri ayrı ayrı İndir";

        const pauseButton = document.createElement('button');
        pauseButton.id = 'pauseButton';
        pauseButton.className = 'action-button';
        pauseButton.textContent = 'Durdur';
        pauseButton.disabled = true;

        const autoApproveButton = document.createElement('button');
        autoApproveButton.id = 'autoApproveButton';
        autoApproveButton.className = 'action-button';
        autoApproveButton.textContent = 'Oto. Onayla';

        const stopApproveButton = document.createElement('button');
        stopApproveButton.id = 'stopApproveButton';
        stopApproveButton.className = 'action-button';
        stopApproveButton.textContent = 'Onay Durdur';
        stopApproveButton.disabled = true;

        const copyLinksButton = document.createElement('button');
        copyLinksButton.id = 'copyLinksButton';
        copyLinksButton.className = 'action-button';
        copyLinksButton.textContent = 'Linkleri Kopyala';

        const mergeButton = document.createElement('button');
        mergeButton.id = 'mergeButton';
        mergeButton.className = 'action-button';
        mergeButton.textContent = 'PDF Birleştir';

        const downloadStatus = document.createElement('div');
        downloadStatus.id = 'downloadStatus';
        downloadStatus.className = 'status-text';

        const approveStatus = document.createElement('div');
        approveStatus.id = 'approveStatus';
        approveStatus.className = 'status-text';

        const customTopBar = document.createElement('div');
        customTopBar.className = 'custom-top-bar';
        customTopBar.append(
            startDateInput, 
            endDateInput, 
            companyInput,
            hideNoPdfContainer,
            hideWithPdfContainer,
            downloadButton, 
            pauseButton, 
            autoApproveButton, 
            stopApproveButton, 
            copyLinksButton, 
            mergeButton, 
            downloadStatus, 
            approveStatus
        );
        document.body.insertBefore(customTopBar, document.body.firstChild);

        // Modal oluştur
        const modal = document.createElement('div');
        modal.className = 'merge-modal';
        modal.innerHTML = `
            <div class="merge-modal-content">
                <h2>PDF Birleştirme İşlemi</h2>
                <div class="merge-progress">
                    <div class="merge-progress-bar" id="mergeProgressBar">0%</div>
                </div>
                <div id="mergeStatus" style="margin: 10px 0; font-weight: bold;">Hazırlanıyor...</div>
                <div class="merge-log" id="mergeLog"></div>
                <div class="merge-buttons">
                    <button class="modal-button secondary" id="closeModalButton">Kapat</button>
                    <button class="modal-button primary" id="downloadMergedButton" style="display:none;">Birleştirilmiş PDF'yi İndir</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const mergeLog = modal.querySelector('#mergeLog');
        const mergeProgressBar = modal.querySelector('#mergeProgressBar');
        const mergeStatus = modal.querySelector('#mergeStatus');
        const closeModalButton = modal.querySelector('#closeModalButton');
        const downloadMergedButton = modal.querySelector('#downloadMergedButton');

        // === Değişkenler ===
        let isDownloading = false;
        let isPaused = false;
        let pdfLinks = [];
        let approveQueue = [];
        let currentIndex = 0;
        let mergedPdfBlob = null;

        const setProcessing = (value) => localStorage.setItem('isProcessingApprovals', value ? 'true' : 'false');
        const isProcessing = () => localStorage.getItem('isProcessingApprovals') === 'true';

        const setStopFlag = (value) => localStorage.setItem('stopApproval', value ? 'true' : 'false');
        const isStopped = () => localStorage.getItem('stopApproval') === 'true';

        const saveDateFilters = () => {
            localStorage.setItem('dateFilterStart', startDateInput.value);
            localStorage.setItem('dateFilterEnd', endDateInput.value);
            localStorage.setItem('companyFilter', companyInput.value);
            localStorage.setItem('hideNoPdf', hideNoPdfCheckbox.checked);
            localStorage.setItem('hideWithPdf', hideWithPdfCheckbox.checked);
        };

        const loadDateFilters = () => {
            const savedStart = localStorage.getItem('dateFilterStart');
            const savedEnd = localStorage.getItem('dateFilterEnd');
            const savedCompany = localStorage.getItem('companyFilter');
            const savedHideNoPdf = localStorage.getItem('hideNoPdf');
            const savedHideWithPdf = localStorage.getItem('hideWithPdf');
            if (savedStart) startDateInput.value = savedStart;
            if (savedEnd) endDateInput.value = savedEnd;
            if (savedCompany) companyInput.value = savedCompany;
            if (savedHideNoPdf === 'true') hideNoPdfCheckbox.checked = true;
            if (savedHideWithPdf === 'true') hideWithPdfCheckbox.checked = true;
        };

        // === Log Fonksiyonları ===
        function addLog(message, type = 'info') {
            const div = document.createElement('div');
            div.className = `log-${type}`;
            div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            mergeLog.appendChild(div);
            mergeLog.scrollTop = mergeLog.scrollHeight;
        }

        function updateProgress(current, total) {
            const percent = Math.round((current / total) * 100);
            mergeProgressBar.style.width = `${percent}%`;
            mergeProgressBar.textContent = `${percent}%`;
        }

        // === Tarih Aralığına Göre Filtre Kontrolü ===
        function dateInRange(dateStr, start, end) {
            if (!dateStr) return false;
            if ((start && dateStr < start) || (end && dateStr > end)) return false;
            return true;
        }

        // === PDF Linklerini Bul (Filtreli) ===
        function findPDFLinks() {
            const t1 = startDateInput.value || '';
            const t2 = endDateInput.value || '';
            const companyFilter = companyInput.value.trim().toLocaleLowerCase('tr-TR');
            const hideNoPdf = hideNoPdfCheckbox.checked;
            const hideWithPdf = hideWithPdfCheckbox.checked;
            const isFilterActive = t1 || t2 || companyFilter;

            const pdfLinkSelector = 'a[href*="../e-fatura/giden_pdf.php?fno="], a[href*="/e-document/PreviewInvoiceWithFileType.php?ettn="]';
            const allLinks = document.querySelectorAll(pdfLinkSelector);
            
            // 1. ÜNVAN Sütununun İndeksini Bul
            let unvanIndex = -1;
            if (allLinks.length > 0) {
                const table = allLinks[0].closest('table');
                if (table) {
                    let headers = table.querySelectorAll('thead th');
                    if (headers.length === 0) {
                        const firstRow = table.querySelector('tr');
                        if (firstRow) headers = firstRow.querySelectorAll('th, td');
                    }

                    if (headers && headers.length > 0) {
                        headers.forEach((h, i) => {
                            if (h.textContent.toLocaleUpperCase('tr-TR').includes('ÜNVAN')) {
                                unvanIndex = i;
                            }
                        });
                    }

                    // TÜM SATIRLARI KONTROL ET (PDF olan/olmayanları gizlemek için)
                    const allTableRows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
                    allTableRows.forEach(row => {
                        const hasPdf = row.querySelector(pdfLinkSelector);
                        let shouldHide = false;

                        if (hideNoPdf && !hasPdf) {
                            shouldHide = true;
                        }
                        if (hideWithPdf && hasPdf) {
                            shouldHide = true;
                        }
                        
                        if (shouldHide) {
                            row.style.display = 'none';
                        } else {
                            row.style.display = ''; 
                        }
                    });
                }
            }

            const processedRows = new Set();

            pdfLinks = Array.from(allLinks)
                .map(link => {
                    const row = link.closest('tr');
                    if (!row) return null;

                    // Eğer satır zaten yukarıdaki PDF gizleme filtreleri tarafından gizlenmişse, renklendirme vs. yapmaya gerek yok
                    if (row.style.display === 'none') {
                        return null; // Gizli satırlar, diğer filtrelemeye dahil edilmesin
                    }

                    const cell = row.querySelector('td');
                    if (!cell) return null;

                    const match = cell.textContent.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    let tarihISO = '';
                    if (match) {
                        const [_, gun, ay, yil] = match;
                        tarihISO = `${yil}-${ay}-${gun}`;
                    }
                    if (!tarihISO) return null;

                    let companyText = '';
                    if (unvanIndex !== -1) {
                        const cells = row.querySelectorAll('td');
                        if (cells[unvanIndex]) {
                            companyText = cells[unvanIndex].textContent;
                        }
                    } else {
                        companyText = row.textContent;
                    }
                    companyText = companyText.toLocaleLowerCase('tr-TR');

                    const isDateMatch = dateInRange(tarihISO, t1, t2);
                    const isCompanyMatch = !companyFilter || companyText.includes(companyFilter);
                    const isMatch = isDateMatch && isCompanyMatch;

                    if (!processedRows.has(row)) {
                        processedRows.add(row);
                        
                        // Renklendirme
                        if (isFilterActive && isMatch) {
                            row.style.backgroundColor = '#d1e7dd'; 
                            row.style.transition = 'background-color 0.3s';
                        } else {
                            row.style.backgroundColor = '';
                        }
                    }

                    return isMatch ? { href: link.href, row, tarihISO } : null;
                })
                .filter(item => item !== null);

            if (isFilterActive) {
                const filterText = companyFilter ? `Filtre: <b>"${companyInput.value}"</b>` : "Tarih filtresi aktif";
                downloadStatus.innerHTML = `${filterText}<br>Seçilen: ${pdfLinks.length} adet fatura`;
                downloadStatus.style.color = '#0f5132';
            } else {
                downloadStatus.textContent = `İndirilebilir PDF sayısı: ${pdfLinks.length}`;
                downloadStatus.style.color = '';
            }

            return pdfLinks;
        }

        function buildApproveQueue() {
            findPDFLinks();
            approveQueue = pdfLinks
                .map(item => item.row.querySelector('a[onclick*="tDurum("]'))
                .filter(btn => btn && !btn.disabled && getComputedStyle(btn).display !== 'none');
            approveStatus.textContent = `Onaylanacak fatura sayısı: ${approveQueue.length}`;
        }

        // === PDF İndirme ===
        async function downloadPDFs() {
            isDownloading = true;
            isPaused = false;
            downloadButton.disabled = true;
            pauseButton.disabled = false;
            const total = pdfLinks.length;

            const downloadNext = async () => {
                if (isPaused || currentIndex >= total) {
                    if (currentIndex >= total) {
                        downloadStatus.textContent = 'İndirme Tamamlandı!';
                        isDownloading = false;
                        downloadButton.disabled = false;
                        pauseButton.disabled = true;
                    }
                    return;
                }
                const { href } = pdfLinks[currentIndex];
                const fileName = `fatura_${currentIndex + 1}_${Date.now()}.pdf`;
                try {
                    const response = await fetch(href, { method: 'GET', credentials: 'include' });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    currentIndex++;
                    updateDownloadProgress(currentIndex, total);
                    setTimeout(downloadNext, 1000);
                } catch (e) {
                    console.error(`PDF ${currentIndex + 1} indirilemedi:`, e);
                    currentIndex++;
                    updateDownloadProgress(currentIndex, total);
                    setTimeout(downloadNext, 1000);
                }
            };
            await downloadNext();
        }

        function updateDownloadProgress(completed, total) {
            const percent = ((completed / total) * 100).toFixed(2);
            downloadStatus.textContent = `İndiriliyor: ${percent}% (${completed}/${total})`;
        }

        // === Onaylama ===
        async function processApproval() {
            if (isStopped()) {
                approveStatus.textContent = 'Onaylama Durduruldu!';
                setProcessing(false);
                autoApproveButton.disabled = false;
                stopApproveButton.disabled = true;
                return;
            }
            if (approveQueue.length === 0) {
                buildApproveQueue();
            }
            if (approveQueue.length === 0) {
                approveStatus.textContent = 'Tüm onaylamalar tamamlandı!';
                setProcessing(false);
                autoApproveButton.disabled = false;
                stopApproveButton.disabled = true;
                return;
            }
            approveStatus.textContent = `Onaylanıyor... (Kalan: ${approveQueue.length})`;
            const btn = approveQueue.shift();
            btn.click();
            setTimeout(() => {
                if (!isStopped() && isProcessing()) {
                    processApproval();
                }
            }, 2000);
        }

        // === Link Kopyalama ===
        function copyPDFLinks() {
            findPDFLinks();
            if (pdfLinks.length === 0) {
                alert('Kopyalanacak PDF linki bulunamadı!');
                return;
            }
            const cookies = document.cookie;
            const linksData = {
                cookies: cookies,
                links: pdfLinks.map(item => item.href)
            };
            const jsonText = JSON.stringify(linksData, null, 2);
            GM_setClipboard(jsonText);
            alert(`${pdfLinks.length} adet PDF linki ve cookie bilgileri panoya kopyalandı!`);
        }

        // === PDF'den Adet Sayısını Çıkar (PDF.js ile) ===
        async function extractQuantityFromPDF(pdfBytesForReading) {
            try {
                // PDF.js için ayrı bir kopya oluştur
                const copyForPdfJs = pdfBytesForReading.slice(0);

                const loadingTask = pdfjsLib.getDocument({ data: copyForPdfJs });
                const pdf = await loadingTask.promise;

                // Tüm sayfaları tara
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();

                    // Metni birleştir
                    const text = textContent.items.map(item => item.str).join(' ');

                    addLog(`Sayfa ${pageNum} metni kontrol ediliyor...`, 'info');

                    // Farklı formatları dene
                    const patterns = [
                        /(\d+)\s*[aA][dD][eE][tT]/,           // "5 adet", "5 Adet"
                        /Miktar[:\s]*(\d+)/i,                  // "Miktar: 5"
                        /Adet[:\s]*(\d+)/i,                    // "Adet: 5"
                        /Quantity[:\s]*(\d+)/i,                // "Quantity: 5"
                    ];

                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match && match[1]) {
                            const quantity = parseInt(match[1]);
                            if (quantity > 0 && quantity < 1000) { // Mantıklı bir aralık
                                addLog(`✓ Adet sayısı bulundu: ${quantity}`, 'success');
                                return quantity;
                            }
                        }
                    }
                }

                addLog('⚠ Adet bilgisi bulunamadı, varsayılan: 1', 'warning');
                return 1;

            } catch (error) {
                addLog(`⚠ Adet okuma hatası: ${error.message}, varsayılan: 1`, 'warning');
                console.error('Adet okuma hatası:', error);
                return 1;
            }
        }

        // === PDF Birleştirme ===
        async function mergePDFs() {
            findPDFLinks();
            if (pdfLinks.length === 0) {
                alert('Birleştirilecek PDF bulunamadı!');
                return;
            }

            modal.style.display = 'flex';
            mergeLog.innerHTML = '';
            mergeProgressBar.style.width = '0%';
            mergeProgressBar.textContent = '0%';
            mergeStatus.textContent = "PDF'ler indiriliyor...";
            downloadMergedButton.style.display = 'none';
            mergedPdfBlob = null;

            addLog(`Toplam ${pdfLinks.length} PDF işlenecek`, 'info');

            const mergedPdf = await PDFDocument.create();
            let totalProcessed = 0;
            let totalPages = 0;

            for (let i = 0; i < pdfLinks.length; i++) {
                try {
                    const { href } = pdfLinks[i];
                    addLog(`\n--- PDF ${i + 1}/${pdfLinks.length} ---`, 'info');
                    addLog(`İndiriliyor...`, 'info');

                    const response = await fetch(href, { method: 'GET', credentials: 'include' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    const pdfBytes = await response.arrayBuffer();
                    addLog(`✓ İndirildi (${(pdfBytes.byteLength / 1024).toFixed(2)} KB)`, 'success');

                    // Adet sayısını çıkar (orijinal ArrayBuffer'dan)
                    const quantity = await extractQuantityFromPDF(pdfBytes);

                    // PDFLib için yeni bir kopya oluştur
                    const pdfBytesForLib = pdfBytes.slice(0);
                    const pdf = await PDFDocument.load(pdfBytesForLib);
                    const pageCount = pdf.getPageCount();

                    addLog(`📄 ${pageCount} sayfa × ${quantity} adet = ${pageCount * quantity} sayfa eklenecek`, 'info');

                    // Adet sayısı kadar tekrarla
                    for (let q = 0; q < quantity; q++) {
                        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                        copiedPages.forEach(page => mergedPdf.addPage(page));
                        totalPages += pageCount;
                        if (quantity > 1) {
                            addLog(`  Kopya ${q + 1}/${quantity} eklendi`, 'info');
                        }
                    }

                    totalProcessed++;
                    updateProgress(totalProcessed, pdfLinks.length);
                    addLog(`✓ PDF ${i + 1} tamamlandı (Toplam sayfa: ${totalPages})`, 'success');

                } catch (error) {
                    addLog(`✗ PDF ${i + 1} hatası: ${error.message}`, 'error');
                    console.error('PDF işleme hatası:', error);
                }
            }

            mergeStatus.textContent = 'PDF kaydediliyor...';
            addLog('\n=== PDF Kaydediliyor ===', 'info');

            try {
                const mergedPdfBytes = await mergedPdf.save();
                mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                const sizeMB = (mergedPdfBytes.byteLength / (1024 * 1024)).toFixed(2);

                mergeStatus.textContent = `✓ Tamamlandı! Toplam ${totalPages} sayfa (${sizeMB} MB)`;
                addLog(`✓ Birleştirme tamamlandı!`, 'success');
                addLog(`  Toplam sayfa: ${totalPages}`, 'success');
                addLog(`  Dosya boyutu: ${sizeMB} MB`, 'success');
                downloadMergedButton.style.display = 'block';

            } catch (error) {
                mergeStatus.textContent = '✗ Kaydetme hatası!';
                addLog(`✗ Hata: ${error.message}`, 'error');
                console.error('PDF kaydetme hatası:', error);
            }
        }

        // === Event Listeners ===
        downloadButton.addEventListener('click', async () => {
            if (!isDownloading) {
                findPDFLinks();
                if (pdfLinks.length === 0) {
                    downloadStatus.textContent = 'PDF Bulunamadı!';
                    return;
                }
                downloadButton.textContent = 'İndirme Devam Ediyor...';
                await downloadPDFs();
            }
        });

        pauseButton.addEventListener('click', () => {
            if (isDownloading) {
                if (isPaused) {
                    isPaused = false;
                    pauseButton.textContent = 'Durdur';
                    downloadStatus.textContent = 'İndirme Devam Ediyor...';
                    downloadPDFs();
                } else {
                    isPaused = true;
                    pauseButton.textContent = 'Devam Et';
                    downloadStatus.textContent = 'İndirme Durduruldu...';
                }
            }
        });

        autoApproveButton.addEventListener('click', () => {
            setStopFlag(false);
            saveDateFilters();
            if (!isProcessing()) {
                findPDFLinks();
                buildApproveQueue();
                if (approveQueue.length === 0) {
                    approveStatus.textContent = 'Onaylanacak fatura bulunamadı!';
                    return;
                }
                setProcessing(true);
                autoApproveButton.disabled = true;
                stopApproveButton.disabled = false;
                processApproval();
            }
        });

        stopApproveButton.addEventListener('click', () => {
            setStopFlag(true);
            setProcessing(false);
            stopApproveButton.disabled = true;
            autoApproveButton.disabled = false;
            approveStatus.textContent = 'Onaylama Durduruldu!';
        });

        copyLinksButton.addEventListener('click', copyPDFLinks);
        mergeButton.addEventListener('click', mergePDFs);

        closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        downloadMergedButton.addEventListener('click', () => {
            if (mergedPdfBlob) {
                const url = URL.createObjectURL(mergedPdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `birlesmis_faturalar_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                addLog('✓ İndirme başlatıldı', 'success');
            }
        });

        startDateInput.addEventListener('change', () => {
            saveDateFilters();
            findPDFLinks();
            buildApproveQueue();
        });

        endDateInput.addEventListener('change', () => {
            saveDateFilters();
            findPDFLinks();
            buildApproveQueue();
        });

        companyInput.addEventListener('input', () => {
            saveDateFilters();
            findPDFLinks();
            buildApproveQueue();
        });

        hideNoPdfCheckbox.addEventListener('change', () => {
            saveDateFilters();
            findPDFLinks();
        });

        hideWithPdfCheckbox.addEventListener('change', () => {
            saveDateFilters();
            findPDFLinks();
        });

        // Sayfa Yüklendiğinde Başlat
        window.addEventListener('load', () => {
            loadDateFilters();
            findPDFLinks();
            buildApproveQueue();
            if (isProcessing() && !isStopped()) {
                setTimeout(() => {
                    autoApproveButton.disabled = true;
                    stopApproveButton.disabled = false;
                    processApproval();
                }, 1000);
            }
        });
    }

    // ==========================================
    // BÖLÜM 2: Menü Düzenleme ve Kısayollar
    // ==========================================

    function initMenuAndShortcuts() {
        // İşlemdeki Belgeler menüsünü bul
        const islemdekiBelgelerMenu = document.querySelector('a[href="?tpage=islemdeki-belgeler"]')?.parentElement;
        
        if (islemdekiBelgelerMenu) {
            // Menüyü açılır kapanır hale getir
            islemdekiBelgelerMenu.classList.add('has-children');
            const arrowIcon = document.createElement('i');
            arrowIcon.className = 'fa fa-angle-down arrow';
            islemdekiBelgelerMenu.querySelector('a').appendChild(arrowIcon);

            // Alt menüyü oluştur
            const childNav = document.createElement('ul');
            childNav.className = 'child-nav';
            childNav.style.display = 'block';

            // Linkleri oluştur ve alt menüye ekle
            const links = [
                { text: 'Tüm Belgeler', url: 'https://konat.net.tr/dss33/v33/index.php?tpage=islemdeki-belgeler', color: 'blue' },
                { text: 'Ödenmeyen', url: 'https://konat.net.tr/dss33/v33/index.php?tpage=islemdeki-belgeler&durum=2', color: 'red' },
                { text: 'Ödenen', url: 'https://konat.net.tr/dss33/v33/index.php?tpage=islemdeki-belgeler&durum=3', color: 'green' },
                { text: 'Beklemede', url: 'https://konat.net.tr/dss33/v33/index.php?tpage=islemdeki-belgeler&durum=1', color: 'yellow' }
            ];

            links.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.innerHTML = `<i class="fa fa-circle" style="color: ${link.color};"><\/i><span>${link.text}</span>`;
                li.appendChild(a);
                childNav.appendChild(li);
            });

            // Alt menüyü ana menüye ekle
            islemdekiBelgelerMenu.appendChild(childNav);

            // Menüye tıklandığında alt menüyü aç/kapa
            islemdekiBelgelerMenu.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                const isVisible = childNav.style.display === 'block';
                childNav.style.display = isVisible ? 'none' : 'block';
                arrowIcon.classList.toggle('fa-angle-down', !isVisible);
                arrowIcon.classList.toggle('fa-angle-right', isVisible);
            });
        }

        // Yeni bir row ve col-md-12 elementi oluştur (Pernod ve dinamik butonlar için)
        const newRow = document.createElement('div');
        newRow.className = 'row';
        newRow.style.marginTop = '10px';

        const newCol = document.createElement('div');
        newCol.className = 'col-md-12 text-center';

        // Pernod butonu oluştur
        const pernodButton = document.createElement('button');
        pernodButton.innerText = 'Pernod';
        pernodButton.setAttribute('type', 'button');
        pernodButton.style.padding = '10px';
        pernodButton.style.backgroundColor = '#007bff';
        pernodButton.style.color = '#fff';
        pernodButton.style.border = 'none';
        pernodButton.style.borderRadius = '5px';
        pernodButton.style.cursor = 'pointer';
        pernodButton.style.marginRight = '10px';
        pernodButton.setAttribute('onclick', 'firmasec({"cari":"732","cfiyat":null,"cunvan":"Pernod Ricard \u0130stanbul \u0130\u00e7 ve D\u0131\u015f Tic. Ltd. \u015eti.","cvn":"0550233279","cvd":"Bo\u011fazi\u00e7i Kurumlar","cadres":"Maslak Mah. B\u00fcy\u00fckdere Cad. Spine Tower Apt. 243/168","ctelefon":"5497439861","cmobil":"05497439855","ceposta":"pernodim@dogruer.com","csehir":"\u0130stanbul","cilce":"Sar\u0131yer"})');

        // Pernod butonunu sütuna ekle
        newCol.appendChild(pernodButton);

        // Sütunu row'a ekle
        newRow.appendChild(newCol);

        // .col-md-6 elementini bul
        const colMd6Element = document.querySelector('.col-md-6');
        if (colMd6Element) {
            colMd6Element.parentNode.insertBefore(newRow, colMd6Element);
        }

        // localStorage'dan kaydedilmiş firmaları yükle
        function loadSavedFirms() {
            const savedFirms = JSON.parse(localStorage.getItem('savedFirms') || '[]');
            savedFirms.forEach(firma => createDynamicButton(firma));
        }

        // Firma verilerini kaydet
        function saveFirm(firma) {
            const savedFirms = JSON.parse(localStorage.getItem('savedFirms') || '[]');
            if (!savedFirms.some(f => f.cari === firma.cari)) {
                savedFirms.push(firma);
                localStorage.setItem('savedFirms', JSON.stringify(savedFirms));
            }
        }

        // Firma verilerini kaldır
        function removeFirm(cari) {
            const savedFirms = JSON.parse(localStorage.getItem('savedFirms') || '[]');
            const updatedFirms = savedFirms.filter(f => f.cari !== cari);
            localStorage.setItem('savedFirms', JSON.stringify(updatedFirms));
        }

        // Dinamik buton ve çıkar butonu oluşturma
        function createDynamicButton(firma) {
            if (newCol.querySelector(`button[data-cari="${firma.cari}"]`)) {
                return;
            }

            // Dikey düzen için kapsayıcı div
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.flexDirection = 'column';
            buttonContainer.style.alignItems = 'center';
            buttonContainer.style.marginRight = '10px';
            buttonContainer.style.display = 'inline-flex'; // Yan yana dizilim için

            const dynamicButton = document.createElement('button');
            dynamicButton.innerText = firma.cunvan || 'Seçilen Firma';
            dynamicButton.setAttribute('type', 'button');
            dynamicButton.setAttribute('data-cari', firma.cari);
            dynamicButton.style.padding = '10px';
            dynamicButton.style.backgroundColor = '#28a745';
            dynamicButton.style.color = '#fff';
            dynamicButton.style.border = 'none';
            dynamicButton.style.borderRadius = '5px';
            dynamicButton.style.cursor = 'pointer';
            dynamicButton.style.width = '100%';

            dynamicButton.addEventListener('click', () => {
                window.firmasec(firma);
            });

            const removeButton = document.createElement('button');
            removeButton.innerText = 'Çıkar';
            removeButton.setAttribute('type', 'button');
            removeButton.style.padding = '5px'; // Küçük boyut
            removeButton.style.fontSize = '12px'; // Küçük yazı tipi
            removeButton.style.backgroundColor = '#dc3545';
            removeButton.style.color = '#fff';
            removeButton.style.border = 'none';
            removeButton.style.borderRadius = '3px'; // Hafif yuvarlak köşeler
            removeButton.style.cursor = 'pointer';
            removeButton.style.marginTop = '5px'; // Firma butonuyla aralık
            removeButton.style.width = '80px'; // Sabit genişlik

            removeButton.addEventListener('click', (e) => {
                e.preventDefault();
                buttonContainer.remove();
                removeFirm(firma.cari);
            });

            buttonContainer.appendChild(dynamicButton);
            buttonContainer.appendChild(removeButton);
            newCol.appendChild(buttonContainer);
        }

        // Son seçilen firma verisini tut
        let selectedFirmaData = null;

        // `firmasec` fonksiyonunu override
        // Dikkat: Bu override global kapsamda yapılmalı
        const originalFirmasec = window.firmasec;
        window.firmasec = function(firmaData) {
            if (originalFirmasec) {
                originalFirmasec(firmaData);
            }
            selectedFirmaData = firmaData;

            const unvanInput = document.querySelector('#unvan');
            if (unvanInput && firmaData.cunvan) {
                unvanInput.value = firmaData.cunvan;
            }
        };

        // Kısayollara Ekle butonu
        const addToShortcutsButton = document.createElement('button');
        addToShortcutsButton.innerText = 'Kısayollara Ekle';
        addToShortcutsButton.setAttribute('type', 'button');
        addToShortcutsButton.style.padding = '10px';
        addToShortcutsButton.style.backgroundColor = '#17a2b8';
        addToShortcutsButton.style.color = '#fff';
        addToShortcutsButton.style.border = 'none';
        addToShortcutsButton.style.borderRadius = '5px';
        addToShortcutsButton.style.cursor = 'pointer';
        addToShortcutsButton.style.marginLeft = '10px';
        addToShortcutsButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (selectedFirmaData) {
                saveFirm(selectedFirmaData);
                createDynamicButton(selectedFirmaData);
            } else {
                alert('Lütfen önce bir firma seçin.');
            }
        });

        // #unvan inputunu bul ve butonu yanına ekle
        const unvanInput = document.querySelector('#unvan');
        if (unvanInput) {
            const parentElement = unvanInput.parentElement;
            parentElement.style.display = 'flex';
            parentElement.style.alignItems = 'center';
            parentElement.appendChild(addToShortcutsButton);
        }

        // Sayfa yüklendiğinde kaydedilmiş firmaları yükle
        loadSavedFirms();
    }

    // Menü ve Kısayol kodlarını çalıştır (Sayfa yüklendikten sonra)
    window.addEventListener('load', initMenuAndShortcuts);

})();
