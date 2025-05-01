// ==UserScript==
    // @name         Konat Fatura İşlemleri
    // @namespace    http://tampermonkey.net/
    // @version      1.2
    // @description  İşlemdeki belgeler sayfasındaki PDF'leri indirir ve faturaları onaylar
    // @author       Your Name
    // @match        https://konat.net.tr/dss33/v33/index.php?tpage=islemdeki-belgeler*
    // @grant        GM_addStyle
    // ==/UserScript==

    (function() {
        'use strict';

        // CSS Stilleri
        GM_addStyle(`
            .custom-top-bar {
                position: fixed;
                top: 50px;
                left: 0;
                right: 0;
                height: 30px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #ddd;
                display: flex;
                align-items: center;
                padding: 0 2px;
                gap: 10px;
                z-index: 999;
            }

            .action-button {
                padding: 8px 15px;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                height: 35px;
            }

            #downloadButton {
                background-color: #4CAF50;
            }

            #pauseButton {
                background-color: #f44336;
            }

            #autoApproveButton {
                background-color: #2196F3;
            }

            .status-text {
                padding: 8px 15px;
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 5px;
                font-size: 14px;
                border: 1px solid #ddd;
                margin-left: 10px;
            }

            body {
                padding-top: 30px;
            }
        `);

        // UI Elementleri
        const downloadButton = document.createElement('button');
        downloadButton.id = 'downloadButton';
        downloadButton.className = 'action-button';
        downloadButton.textContent = 'PDF İndirmeyi Başlat';

        const pauseButton = document.createElement('button');
        pauseButton.id = 'pauseButton';
        pauseButton.className = 'action-button';
        pauseButton.textContent = 'Durdur';
        pauseButton.disabled = true;

        const autoApproveButton = document.createElement('button');
        autoApproveButton.id = 'autoApproveButton';
        autoApproveButton.className = 'action-button';
        autoApproveButton.textContent = 'Otomatik Onayla';

        const downloadStatus = document.createElement('div');
        downloadStatus.id = 'downloadStatus';
        downloadStatus.className = 'status-text';

        const approveStatus = document.createElement('div');
        approveStatus.id = 'approveStatus';
        approveStatus.className = 'status-text';

        const customTopBar = document.createElement('div');
        customTopBar.className = 'custom-top-bar';
        customTopBar.appendChild(downloadButton);
        customTopBar.appendChild(pauseButton);
        customTopBar.appendChild(autoApproveButton);
        customTopBar.appendChild(downloadStatus);
        customTopBar.appendChild(approveStatus);

        document.body.insertBefore(customTopBar, document.body.firstChild);

        // Değişkenler
        let isDownloading = false;
        let isPaused = false;
        let pdfLinks = [];
        let currentIndex = 0;

        const setProcessing = (value) => localStorage.setItem('isProcessingApprovals', value ? 'true' : 'false');
        const isProcessing = () => localStorage.getItem('isProcessingApprovals') === 'true';

        function findPDFLinks() {
            const links = document.querySelectorAll('a[href*="../e-fatura/giden_pdf.php?fno="]');
            pdfLinks = Array.from(links).map(link => link.href);
            downloadStatus.textContent = `İndirilebilir PDF sayısı: ${pdfLinks.length}`;
            return pdfLinks;
        }

        function findApproveButtons() {
            return Array.from(document.querySelectorAll('a[onclick*="tDurum("]'))
                .filter(button => !button.disabled && getComputedStyle(button).display !== 'none');
        }

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

                const pdfUrl = pdfLinks[currentIndex];
                const fileName = `fatura_${currentIndex + 1}_${Date.now()}.pdf`;

                try {
                    console.log(`İndirme başlatılıyor: ${pdfUrl}`);
                    const response = await fetch(pdfUrl, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const blob = await response.blob();
                    console.log(`Blob alındı, boyut: ${blob.size} bayt`);

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    console.log(`PDF indirildi: ${fileName}`);
                    currentIndex++;
                    updateDownloadProgress(currentIndex, total);
                    setTimeout(downloadNext, 1000); // 1 saniye bekle, tarayıcıyı yormamak için
                } catch (e) {
                    console.error(`PDF ${currentIndex + 1} indirilemedi:`, e);
                    currentIndex++;
                    updateDownloadProgress(currentIndex, total);
                    setTimeout(downloadNext, 1000);
                }
            };

            await downloadNext();
        }

        async function processApproval() {
            try {
                const buttons = findApproveButtons();

                if (buttons.length === 0) {
                    approveStatus.textContent = 'Tüm onaylamalar tamamlandı!';
                    setProcessing(false);
                    autoApproveButton.disabled = false;
                    return;
                }

                approveStatus.textContent = `Onaylanıyor... (Kalan: ${buttons.length})`;
                const button = buttons[0];
                button.click();
            } catch (error) {
                console.error('Onaylama hatası:', error);
                approveStatus.textContent = 'Bir hata oluştu!';
                setProcessing(false);
                autoApproveButton.disabled = false;
            }
        }

        function updateDownloadProgress(completed, total) {
            const percent = ((completed / total) * 100).toFixed(2);
            downloadStatus.textContent = `İndiriliyor: ${percent}% (${completed}/${total})`;
        }

        downloadButton.addEventListener('click', async () => {
            if (!isDownloading) {
                pdfLinks = findPDFLinks();
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
            if (!isProcessing()) {
                const buttons = findApproveButtons();
                if (buttons.length === 0) {
                    approveStatus.textContent = 'Onaylanacak fatura bulunamadı!';
                    return;
                }
                setProcessing(true);
                autoApproveButton.disabled = true;
                processApproval();
            }
        });

        window.addEventListener('load', () => {
            findPDFLinks();
            const buttons = findApproveButtons();
            approveStatus.textContent = `Onaylanacak fatura sayısı: ${buttons.length}`;

            if (isProcessing()) {
                setTimeout(() => {
                    autoApproveButton.disabled = true;
                    processApproval();
                }, 1000);
            }
        });

        if (document.readyState === 'complete') {
            findPDFLinks();
            const buttons = findApproveButtons();
            approveStatus.textContent = `Onaylanacak fatura sayısı: ${buttons.length}`;

            if (isProcessing()) {
                autoApproveButton.disabled = true;
                processApproval();
            }
        }
    })();