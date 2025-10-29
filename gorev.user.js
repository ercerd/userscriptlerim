// ==UserScript==
// @name         Advanced Form Filler for gorev_add.php
// @namespace    http://212.174.41.133/
// @version      2.1
// @description  Multiselect destekli form doldurma işlemi yapar (Tam Eşleşme)
// @match        http://212.174.41.133/gorev/gorev_add.php
// @match        http://10.33.0.60/gorev/gorev_add.php
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/gorev.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/gorev.user.js
// ==/UserScript==

(function() {
    'use strict';

    // CSS Stil ekleme
    GM_addStyle(`
        .custom-form-button {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            padding: 10px 20px;
            background: linear-gradient(45deg, #2196F3, #1976D2);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .custom-form-button:hover {
            background: linear-gradient(45deg, #1976D2, #1565C0);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transform: translateY(-1px);
        }

        .custom-form-button:active {
            transform: translateY(1px);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .success-animation {
            animation: success-pulse 0.5s ease;
        }

        @keyframes success-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .custom-clear-button {
            position: fixed;
            top: 60px;
            right: 10px;
            z-index: 1000;
            padding: 10px 20px;
            background: linear-gradient(45deg, #f44336, #d32f2f);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .custom-clear-button:hover {
            background: linear-gradient(45deg, #d32f2f, #b71c1c);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transform: translateY(-1px);
        }

        .custom-clear-button:active {
            transform: translateY(1px);
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .status-message {
            position: fixed;
            top: 110px;
            right: 10px;
            z-index: 999;
            padding: 8px 15px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 4px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            max-width: 250px;
            word-wrap: break-word;
        }
    `);

    // Butonları oluştur
    const button = document.createElement('button');
    button.className = 'custom-form-button';
    button.innerHTML = `<i class="fa fa-magic"></i><span>Formu Doldur</span>`;
    document.body.appendChild(button);

    const clearButton = document.createElement('button');
    clearButton.className = 'custom-clear-button';
    clearButton.innerHTML = `<i class="fa fa-trash"></i><span>Temizle</span>`;
    document.body.appendChild(clearButton);

    // Font Awesome ekleme
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Durum mesajı gösterme fonksiyonu
    function showStatusMessage(message) {
        let statusDiv = document.querySelector('.status-message');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.className = 'status-message';
            document.body.appendChild(statusDiv);
        }
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        console.log('Status:', message);
    }

    function hideStatusMessage() {
        const statusDiv = document.querySelector('.status-message');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }

    // Seçeneklerin yüklenmesini bekleyen fonksiyon
    async function waitForOptions(selectElement, minOptions = 1, timeout = 5000) {
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const optionCount = selectElement.options.length;
                
                // Seçenekler yüklendiyse
                if (optionCount >= minOptions) {
                    clearInterval(checkInterval);
                    console.log(`✓ Seçenekler yüklendi: ${optionCount} adet`);
                    resolve(true);
                }
                
                // Zaman aşımı kontrolü
                if (elapsed >= timeout) {
                    clearInterval(checkInterval);
                    console.warn(`⚠ Zaman aşımı: ${selectElement.id} için seçenekler yüklenemedi`);
                    reject(new Error(`Seçenekler yüklenemedi: ${selectElement.id}`));
                }
            }, 200);
        });
    }

    // Change event'i tetikle ve işlemin tamamlanmasını bekle
    async function triggerChangeAndWait(element, waitTime = 500) {
        // Farklı event türlerini tetikle
        const events = ['change', 'input', 'blur'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true });
            element.dispatchEvent(event);
        });
        
        // jQuery event'i varsa onu da tetikle
        if (typeof $ !== 'undefined' && $(element).length) {
            $(element).trigger('change');
        }
        
        // Belirtilen süre kadar bekle
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Chosen.js destekli tekli seçim için geliştirilmiş fonksiyon
    async function setChosenOption(selectElement, value, description = '') {
        if (!selectElement || !selectElement.options) {
            throw new Error(`Seçim alanı bulunamadı: ${description}`);
        }

        // TAM EŞLEŞME için düzeltilmiş arama
        const option = Array.from(selectElement.options).find(opt => {
            const optionText = opt.text.trim();
            const optionValue = opt.value.trim();
            return optionText === value || optionValue === value;
        });
        
        if (!option) {
            console.warn(`⚠ Seçenek bulunamadı: "${value}" in ${description || selectElement.id}`);
            throw new Error(`Seçenek bulunamadı: ${value}`);
        }

        option.selected = true;
        
        // Chosen.js güncellemesi
        if (typeof $ !== 'undefined' && $(selectElement).data('chosen')) {
            $(selectElement).trigger('chosen:updated');
        }
        
        console.log(`✓ Seçildi: ${value} - ${description}`);
        return true;
    }

    // Chosen.js destekli çoklu seçim için geliştirilmiş fonksiyon - TAM EŞLEŞME
    async function setChosenOptions(selectElement, values, description = '') {
        if (!selectElement || !selectElement.options) {
            throw new Error(`Seçim alanı bulunamadı: ${description}`);
        }

        let selectedCount = 0;
        Array.from(selectElement.options).forEach(option => {
            const optionText = option.text.trim();
            const optionValue = option.value.trim();
            
            // TAM EŞLEŞME kontrolü (includes yerine === kullan)
            const shouldSelect = values.some(value => 
                optionText === value || optionValue === value
            );
            
            if (shouldSelect) {
                option.selected = true;
                selectedCount++;
                console.log(`✓ Seçildi: ${option.text}`);
            } else {
                option.selected = false; // Diğerlerini temizle
            }
        });

        if (selectedCount === 0) {
            console.warn(`⚠ Hiçbir seçenek bulunamadı: ${values.join(', ')} in ${description || selectElement.id}`);
        }

        // Chosen.js güncellemesi
        if (typeof $ !== 'undefined' && $(selectElement).data('chosen')) {
            $(selectElement).trigger('chosen:updated');
        }

        console.log(`✓ ${selectedCount} seçenek işaretlendi - ${description}`);
        return selectedCount > 0;
    }

    // ANA DOLDURMA FONKSİYONU
    button.addEventListener('click', async () => {
        const originalContent = button.innerHTML;
        button.innerHTML = `<div class="loading-spinner"></div><span>Dolduruluyor...</span>`;
        button.disabled = true;

        try {
            // ADIM 1: Şube seçimi
            showStatusMessage('1/9: Şube seçiliyor...');
            const subeSelect = document.getElementById('value_subesi_1');
            if (subeSelect) {
                subeSelect.value = 'GIDA VE YEM';
                await triggerChangeAndWait(subeSelect, 300);
            }

            // ADIM 2: İlçe seçimi (ÖNEMLİ: Köy/Mahalle için bağımlı alan)
            showStatusMessage('2/9: İlçe seçiliyor...');
            const ilceSelect = document.getElementById('value_gorev_yeri_ilce_1');
            if (!ilceSelect) throw new Error('İlçe seçim alanı bulunamadı');
            
            await setChosenOption(ilceSelect, 'Akdeniz', 'İlçe');
            await triggerChangeAndWait(ilceSelect, 800); // Daha uzun bekleme süresi

            // ADIM 3: Köy/Mahalle seçimi (İlçeye bağımlı)
            showStatusMessage('3/9: Köy/Mahalle seçiliyor...');
            const koyMahSelect = document.getElementById('value_gorev_yeri_koy_mah_1');
            if (koyMahSelect) {
                try {
                    await waitForOptions(koyMahSelect, 3, 5000); // En az 3 seçenek, 5 saniye timeout
                    await new Promise(resolve => setTimeout(resolve, 300)); // Ekstra stabilizasyon
                    
                    const valuesToSelect = ['Yeni', 'Bekirde', 'Homurlu'];
                    await setChosenOptions(koyMahSelect, valuesToSelect, 'Köy/Mahalle');
                } catch (error) {
                    console.error('Köy/Mahalle seçimi başarısız:', error);
                    showStatusMessage('⚠ Köy/Mahalle yüklenemedi, devam ediliyor...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // ADIM 4: Tarih
            showStatusMessage('4/9: Tarih ayarlanıyor...');
            const tarihInput = document.getElementById('value_tarih_1');
            if (tarihInput) {
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                tarihInput.value = `${day}.${month}.${year}`;
            }

            // ADIM 5: Konu
            showStatusMessage('5/9: Konu seçiliyor...');
            const konusuSelect = document.getElementById('value_konusu_1');
            if (konusuSelect) {
                await setChosenOption(konusuSelect, 'GIDA İTHALAT-İHRACAT', 'Konu');
                await triggerChangeAndWait(konusuSelect, 300);
            }

            // ADIM 6: Görev Durumu
            showStatusMessage('6/9: Görev durumu seçiliyor...');
            const gorevDurumuSelect = document.getElementById('value_gorev_durumu_1');
            if (gorevDurumuSelect) {
                await setChosenOptions(gorevDurumuSelect, ['arazi', 'kontrol', 'özel'], 'Görev Durumu');
            }

            // ADIM 7: Göreve Giden
            showStatusMessage('7/9: Personel seçiliyor...');
            const goreveGidenSelect = document.getElementById('value_goreve_giden_1');
            if (goreveGidenSelect) {
                await setChosenOption(goreveGidenSelect, 'Ercan ERDEN-Mühendis', 'Göreve Giden');
            }

            // ADIM 8: Öncelik
            showStatusMessage('8/9: Öncelik ayarlanıyor...');
            const oncelikSelect = document.getElementById('value_oncelik_1');
            if (oncelikSelect) {
                oncelikSelect.value = 'Tam Gün';
                await triggerChangeAndWait(oncelikSelect, 200);
            }

            // ADIM 9: Araç Tipi
            showStatusMessage('9/9: Araç tipi seçiliyor...');
            const aracTipiSelect = document.getElementById('value_arac_tipi_1');
            if (aracTipiSelect) {
                aracTipiSelect.value = 'Otomobil';
            }

            // Başarı mesajı
            hideStatusMessage();
            button.innerHTML = `<i class="fas fa-check"></i><span>Tamamlandı!</span>`;
            button.style.background = 'linear-gradient(45deg, #4CAF50, #388E3C)';
            button.classList.add('success-animation');

            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
                button.disabled = false;
                button.classList.remove('success-animation');
            }, 3000);

        } catch (error) {
            console.error('Form doldurma hatası:', error);
            hideStatusMessage();
            button.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Hata: ${error.message}</span>`;
            button.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';

            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
                button.disabled = false;
            }, 5000);
        }
    });

    // Temizle butonu
    clearButton.addEventListener('click', async () => {
        const originalContent = clearButton.innerHTML;
        clearButton.innerHTML = `<div class="loading-spinner"></div><span>Temizleniyor...</span>`;
        clearButton.disabled = true;

        try {
            const formElements = document.querySelectorAll('select, input:not([type="button"]):not([type="submit"]), textarea, input[type="checkbox"], input[type="radio"]');

            for (const element of formElements) {
                if (element.tagName === 'SELECT') {
                    element.selectedIndex = -1;
                    if (typeof $ !== 'undefined' && $(element).data('chosen')) {
                        $(element).trigger('chosen:updated');
                    }
                } else if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
            }

            clearButton.innerHTML = `<i class="fas fa-check"></i><span>Temizlendi!</span>`;
            clearButton.style.background = 'linear-gradient(45deg, #4CAF50, #388E3C)';
            clearButton.classList.add('success-animation');

        } catch (error) {
            console.error('Form temizleme hatası:', error);
            clearButton.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Hata!</span>`;
        }

        setTimeout(() => {
            clearButton.innerHTML = originalContent;
            clearButton.style.background = '';
            clearButton.disabled = false;
            clearButton.classList.remove('success-animation');
        }, 3000);
    });
})();