// ==UserScript==
// @name         Önbildirim GGBS için kullanıcı betiğim
// @version      2.14
// @description  All-in-one functionality: captcha autofill, form field updates, buttons for different operations, and sertifika handling
// @author       Ercan Erden (Modified)
// @grant        none
// @match        http://*/ONBILDIRIM/*
// @match        https://*/ONBILDIRIM/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/combinedonbildirim.user.js  
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/combinedonbildirim.user.js  
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

(function() {
    'use strict';

    // Function to get the previous workday
    function getPreviousWorkday(date) {
        var day = date.getDay();
        if (day === 1) { // If it's Monday
            date.setDate(date.getDate() - 3); // Go back to Friday
        } else if (day === 0) { // If it's Sunday
            date.setDate(date.getDate() - 2); // Go back to Friday
        } else { // Any other day
            date.setDate(date.getDate() - 1); // Go back one day
        }
        return date;
    }

    // Function to pad zero to numbers (from the working script)
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    // Function to get formatted date (from the working script)
    function getFormattedDate() {
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes() + 20);

        const day = padZero(currentDate.getDate());
        const month = padZero(currentDate.getMonth() + 1);
        const year = currentDate.getFullYear();
        const hours = padZero(currentDate.getHours() + 3);
        const minutes = padZero(currentDate.getMinutes());
        const seconds = padZero(currentDate.getSeconds());

        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}.0`;
    }

    // Function to reset form fields
    function resetFormFields() {
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(element => {
            if (element.offsetParent !== null) { // Check if element is visible
                if (element.tagName === 'INPUT') {
                    if (element.type === 'text' || element.type === 'number' || element.type === 'date' || element.type === 'time') {
                        element.value = '';
                    } else if (element.type === 'checkbox' || element.type === 'radio') {
                        element.checked = false;
                    }
                } else if (element.tagName === 'SELECT') {
                    element.selectedIndex = 0;
                } else if (element.tagName === 'TEXTAREA') {
                    element.value = '';
                }
            }
        });
        console.log('Tüm görünür form alanları sıfırlandı.');
    }

    // Toast bildirimleri için yardımcı fonksiyon
    function showToast(message, type = 'success') {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.position = 'fixed';
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '10000';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.color = '#fff';
        toast.style.marginBottom = '10px';
        toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        toast.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545'; // Yeşil veya kırmızı arka plan

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Function to create and position buttons
    function createButtons() {
        const anchorElement = document.querySelector('table[width="1051"]');
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '30px';
        buttonContainer.style.zIndex = 1000;
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '10px';

        if (anchorElement) {
            const rect = anchorElement.getBoundingClientRect();
            buttonContainer.style.left = (rect.right + 15) + 'px';
        } else {
            console.log("Ana içerik kolonu (width=1051) bulunamadı, butonlar varsayılan konuma yerleştiriliyor.");
            buttonContainer.style.right = '10px';
        }

        document.body.appendChild(buttonContainer);

        // Create button for Ürün_Ham
        const urunHamButton = document.createElement('button');
        urunHamButton.innerText = 'Ürün_Ham';
        urunHamButton.style.padding = '10px 20px';
        urunHamButton.style.backgroundColor = '#4CAF50';
        urunHamButton.style.color = 'white';
        urunHamButton.style.border = 'none';
        urunHamButton.style.borderRadius = '5px';
        urunHamButton.style.cursor = 'pointer';
        buttonContainer.appendChild(urunHamButton);

        urunHamButton.addEventListener('click', function() {
            try {
                resetFormFields();

                const onayDurum = document.getElementById('ONAYDURUM');
                const organizasyonRef = document.getElementById('ORGANIZASYONREF');

                if (onayDurum && organizasyonRef) {
                    onayDurum.value = '4';
                    organizasyonRef.value = '24';
                    showToast('Ürün_Ham veri girişi yapıldı.', 'success');
                } else {
                    throw new Error('Gerekli alanlar bulunamadı.');
                }
            } catch (error) {
                showToast('Ürün_Ham işlemi başarısız: Alanlar bulunamadı.', 'error');
            }
        });

        // Create button for Sevkiyat_Ham
        const sevkiyatHamButton = document.createElement('button');
        sevkiyatHamButton.innerText = 'Sevkiyat_Ham';
        sevkiyatHamButton.style.padding = '10px 20px';
        sevkiyatHamButton.style.backgroundColor = '#008CBA';
        sevkiyatHamButton.style.color = 'white';
        sevkiyatHamButton.style.border = 'none';
        sevkiyatHamButton.style.borderRadius = '5px';
        sevkiyatHamButton.style.cursor = 'pointer';
        buttonContainer.appendChild(sevkiyatHamButton);

        sevkiyatHamButton.addEventListener('click', function() {
            try {
                resetFormFields();

                const onayDurum = document.getElementById('ONAYDURUM');
                const altGrupGumruk = document.getElementById('ALTGRUP_GUMRUK');
                const gumrukAdi = document.getElementById('GUMRUKADI');
                const gumrukTarihSecenek = document.getElementById('GUMRUKTARIHBSECENEK');
                const gumrukTarihB1 = document.getElementById('GUMRUKTARIHB1');

                if (
                    onayDurum &&
                    altGrupGumruk &&
                    gumrukAdi &&
                    gumrukTarihSecenek &&
                    gumrukTarihB1
                ) {
                    onayDurum.value = '1';

                    if (!altGrupGumruk.checked) {
                        altGrupGumruk.click();
                    }

                    gumrukAdi.value = '24';
                    gumrukAdi.dispatchEvent(new Event('change', { bubbles: true }));

                    gumrukTarihSecenek.value = '3';
                    gumrukTarihSecenek.dispatchEvent(new Event('change', { bubbles: true }));

                    const date = getPreviousWorkday(new Date());
                    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} 00:00:00.0`;
                    gumrukTarihB1.value = formattedDate;
                    gumrukTarihB1.dispatchEvent(new Event('change', { bubbles: true }));

                    showToast('Sevkiyat_Ham veri girişi yapıldı.', 'success');
                } else {
                    throw new Error('Gerekli alanlar bulunamadı.');
                }
            } catch (error) {
                showToast('Sevkiyat_Ham işlemi başarısız: Alanlar bulunamadı.', 'error');
            }
        });
        // Create button for Sertifika İndir
        const sertifikaButton = document.createElement('button');
        sertifikaButton.innerText = 'Sertifika İndir';
        sertifikaButton.style.padding = '10px 20px';
        sertifikaButton.style.backgroundColor = '#f44336';
        sertifikaButton.style.color = 'white';
        sertifikaButton.style.border = 'none';
        sertifikaButton.style.borderRadius = '5px';
        sertifikaButton.style.cursor = 'pointer';
        buttonContainer.appendChild(sertifikaButton);

        sertifikaButton.addEventListener('click', function() {
            try {
                const sertifikaButtonElement = document.querySelector('img[name="Button_Sertifika_gost"]');
                if (sertifikaButtonElement) {
                    sertifikaButtonElement.click();
                    showToast('Sertifika indirme işlemi başlatıldı.', 'success');
                } else {
                    throw new Error('Sertifika butonu bulunamadı.');
                }
            } catch (error) {
                showToast('Sertifika indirme işlemi başarısız: ' + error.message, 'error');
            }
        });

        // Create button for İçerik İndir
        const icerikButton = document.createElement('button');
        icerikButton.innerText = 'İçerik İndir';
        icerikButton.style.padding = '10px 20px';
        icerikButton.style.backgroundColor = 'green';
        icerikButton.style.color = 'white';
        icerikButton.style.border = 'none';
        icerikButton.style.borderRadius = '5px';
        icerikButton.style.cursor = 'pointer';
        buttonContainer.appendChild(icerikButton);

        icerikButton.addEventListener('click', function() {
            try {
                // İçerik kontrolü: "Yüklü Içerik Yok." yazısı var mı?
                const icerikDosyaElement = document.querySelector('td#ICERIKBELGESIDOSYA');
                if (icerikDosyaElement && icerikDosyaElement.textContent.trim() === 'Yüklü Içerik Yok.') {
                    showToast('İçerik bulunmuyor.', 'error');
                    return; // İşlemi durdur
                }

                // Eğer içerik varsa, indirme işlemini gerçekleştir
                const icerikButtonElement = document.querySelector('img[name="Button_icerik_gost"]');
                if (icerikButtonElement) {
                    icerikButtonElement.click();
                    showToast('İçerik indirme işlemi başlatıldı.', 'success');
                } else {
                    throw new Error('İçerik butonu bulunamadı.');
                }
            } catch (error) {
                showToast('İçerik indirme işlemi başarısız: ' + error.message, 'error');
            }
        });
        
        // Create button for Formu Sıfırla
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Formu Sıfırla';
        resetButton.style.padding = '10px 20px';
        resetButton.style.backgroundColor = '#555';
        resetButton.style.color = 'white';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '5px';
        resetButton.style.cursor = 'pointer';
        buttonContainer.appendChild(resetButton);

        resetButton.addEventListener('click', function() {
            try {
                resetFormFields();
                showToast('Form sıfırlandı.', 'success');
            } catch (error) {
                showToast('Form sıfırlama işlemi başarısız: ' + error.message, 'error');
            }
        });

        // --- ID Kopyala Butonları (Dinamik) ---
        const copyContainer = document.createElement('div');
        copyContainer.style.marginTop = '15px';
        copyContainer.style.border = '1px solid #ccc';
        copyContainer.style.padding = '5px';
        copyContainer.style.borderRadius = '5px';
        buttonContainer.appendChild(copyContainer);

        const mainCopyButton = document.createElement('button');
        mainCopyButton.innerText = 'ID Kopyala';
        mainCopyButton.style.padding = '10px 20px';
        mainCopyButton.style.backgroundColor = '#ffc107';
        mainCopyButton.style.color = 'black';
        mainCopyButton.style.border = 'none';
        mainCopyButton.style.borderRadius = '5px';
        mainCopyButton.style.width = '100%';
        copyContainer.appendChild(mainCopyButton);

        const numberContainer = document.createElement('div');
        numberContainer.style.display = 'grid';
        numberContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        numberContainer.style.gap = '5px';
        numberContainer.style.marginTop = '5px';
        copyContainer.appendChild(numberContainer);

        // Function to create ID copy buttons dynamically
        function createIdCopyButtons() {
            // Clear existing buttons
            numberContainer.innerHTML = '';

            // Get visible rows and create buttons for each row
            const visibleRows = getVisibleRows();
            visibleRows.forEach((row, index) => {
                const firstCell = row.querySelector('tr > td[class*="Link1"]');
                if (firstCell) {
                    const rowNum = parseInt(firstCell.innerText, 10);
                    if (!isNaN(rowNum)) {
                        const numButton = document.createElement('button');
                        numButton.innerText = rowNum;
                        numButton.style.padding = '5px 10px';
                        numButton.style.backgroundColor = '#6c757d';
                        numButton.style.color = 'white';
                        numButton.style.border = 'none';
                        numButton.style.borderRadius = '3px';
                        numButton.style.cursor = 'pointer';
                        numButton.style.minWidth = '30px';
                        numberContainer.appendChild(numButton);

                        numButton.addEventListener('click', function() {
                            copyRowData(index); // Görünür satırın index'ini gönder
                        });
                    }
                }
            });
        }

        // Initial creation of ID copy buttons
        createIdCopyButtons();

        // Use MutationObserver to detect changes in the table and update buttons
        const observerTarget = document.querySelector('table[mo\\:type="ProcessRecord"]');
        if (observerTarget) {
            const observer = new MutationObserver(() => {
                console.log("Tablo içeriği değişti. ID kopyala butonları yeniden oluşturuluyor...");
                createIdCopyButtons();
            });

            // Observe changes in child nodes or attributes
            observer.observe(observerTarget, {
                childList: true,
                subtree: true,
                attributes: true
            });
        } else {
            console.warn("Hedef tablo bulunamadı. ID kopyala butonları oluşturulamıyor.");
        }
        
    // Wait for the page to fully load
    window.addEventListener('load', function() {
        console.log("Page fully loaded.");
        createButtons();
    });
})();
