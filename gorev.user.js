// ==UserScript==
// @name         Advanced Form Filler for gorev_add.php
// @namespace    http://212.174.41.133/
// @version      1.6
// @description  Multiselect destekli form doldurma işlemi yapar
// @match        http://212.174.41.133/gorev/gorev_add.php
// @match        http://10.33.0.60/gorev/gorev_add.php
// @grant        GM_addStyle
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

        .custom-form-button i {
            font-size: 16px;
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
    `);

    // Buton oluşturma
    const button = document.createElement('button');
    button.className = 'custom-form-button';
    button.innerHTML = `
        <i class="fa fa-magic"></i>
        <span>Formu Doldur</span>
    `;
    document.body.appendChild(button);

    // Temizle butonu oluşturma
    const clearButton = document.createElement('button');
    clearButton.className = 'custom-clear-button';
    clearButton.innerHTML = `
        <i class="fa fa-trash"></i>
        <span>Temizle</span>
    `;
    document.body.appendChild(clearButton);

    // Font Awesome ekleme
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Butona tıklanınca işlemleri gerçekleştirecek
    button.addEventListener('click', async () => {
        try {
            // Yükleniyor animasyonu
            const originalContent = button.innerHTML;
            button.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Dolduruluyor...</span>
            `;
            button.disabled = true;

            // 1. "value_subesi_1" -> "GIDA VE YEM" seçimi
            const subeSelect = document.getElementById('value_subesi_1');
            if (subeSelect) {
                subeSelect.value = 'GIDA VE YEM';
                console.log('Seçildi: GIDA VE YEM');
            }

            // 2. "value_gorev_yeri_ilce_1" -> "Akdeniz" seçimi
            const ilceSelect = document.getElementById('value_gorev_yeri_ilce_1');
            if (ilceSelect) {
                setChosenOption(ilceSelect, 'Akdeniz');
                console.log('Seçildi: Akdeniz');
                // İlçe değişikliğini tetikle ve köy/mahalle listesinin yüklenmesini bekle
                $(ilceSelect).trigger('change');
                await new Promise(resolve => setTimeout(resolve, 100)); // İlçe değişikliği sonrası bekleme süresi
            }

            // 3. "value_gorev_yeri_koy_mah_1" çoklu seçim
            const koyMahSelect = document.getElementById('value_gorev_yeri_koy_mah_1');
            if (koyMahSelect) {
                // Köy/mahalle seçeneklerinin yüklenmesini bekle
                await waitForOptions(koyMahSelect);

                // Seçenekleri ayarla
                const valuesToSelect = ['Yeni', 'Bekirde', 'Homurlu'];
                for (const value of valuesToSelect) {
                    const option = Array.from(koyMahSelect.options).find(opt => opt.text.includes(value));
                    if (option) {
                        option.selected = true;
                    }
                }

                // Chosen.js güncellemesini tetikle
                $(koyMahSelect).trigger('chosen:updated');
                console.log('Köy/Mahalle seçimleri yapıldı');
            }

            // 4. "value_tarih_1" -> Günün tarihini ayarlama
            const tarihInput = document.getElementById('value_tarih_1');
            if (tarihInput) {
                const today = new Date();
                const formattedDate = today.toLocaleDateString('tr-TR').replace(/\./g, '.');
                tarihInput.value = formattedDate;
            }

            // 5. "value_konusu_1" -> "GIDA İTHALAT-İHRACAT" seçimi
            const konusuSelect = document.getElementById('value_konusu_1');
            if (konusuSelect) {
                setChosenOption(konusuSelect, 'GIDA İTHALAT-İHRACAT');
            }

            // 6. "value_gorev_durumu_1" çoklu seçim
            const gorevDurumuSelect = document.getElementById('value_gorev_durumu_1');
            if (gorevDurumuSelect) {
                setChosenOptions(gorevDurumuSelect, ['arazi', 'kontrol', 'özel']);
            }

            // 7. "type_goreve_giden_1" -> "Ercan ERDEN-Mühendis" seçimi
            const goreveGidenSelect = document.getElementById('value_goreve_giden_1');
            if (goreveGidenSelect) {
                setChosenOption(goreveGidenSelect, 'Ercan ERDEN-Mühendis');
            }

            // 8. "value_oncelik_1" -> "Tam Gün" seçimi
            const oncelikSelect = document.getElementById('value_oncelik_1');
            if (oncelikSelect) {
                oncelikSelect.value = 'Tam Gün';
            }

            // 9. "value_arac_tipi_1" -> "Otomobil" seçimi
            const aracTipiSelect = document.getElementById('value_arac_tipi_1');
            if (aracTipiSelect) {
                aracTipiSelect.value = 'Otomobil';
            }

             // İşlem başarılı animasyonu
            await new Promise(resolve => setTimeout(resolve, 1000)); // Minimum görünme süresi
            button.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Tamamlandı!</span>
            `;
            button.style.background = 'linear-gradient(45deg, #4CAF50, #388E3C)';
            button.classList.add('success-animation');

            // 3 saniye sonra butonu eski haline döndür
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
                button.disabled = false;
                button.classList.remove('success-animation');
            }, 3000);

        } catch (error) {
            console.error('Bir hata oluştu:', error);
            button.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Hata Oluştu!</span>
            `;
            button.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';

            // 3 saniye sonra butonu eski haline döndür
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    });

    // Temizle butonuna tıklanınca işlemleri gerçekleştirecek
    clearButton.addEventListener('click', async () => {
        const originalContent = clearButton.innerHTML;
        clearButton.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Temizleniyor...</span>
        `;
        clearButton.disabled = true;

        try {
            const formElements = document.querySelectorAll('select, input:not([type="button"]):not([type="submit"]), textarea, input[type="checkbox"], input[type="radio"]');

            for (const element of formElements) {
                if (element.tagName === 'SELECT') {
                    element.selectedIndex = -1;
                    if ($(element).data('chosen')) {
                        $(element).trigger('chosen:updated');
                    }
                } else if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
            }

            clearButton.innerHTML = `
                <i class="fas fa-check"></i>
                <span>Temizlendi!</span>
            `;
            clearButton.style.background = 'linear-gradient(45deg, #4CAF50, #388E3C)';
            clearButton.classList.add('success-animation');

        } catch (error) {
            console.error('Form temizleme hatası:', error);
            clearButton.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>Hata!</span>
            `;
            clearButton.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
        }

        setTimeout(() => {
            clearButton.innerHTML = originalContent;
            clearButton.style.background = '';
            clearButton.disabled = false;
            clearButton.classList.remove('success-animation');
        }, 3000);
    });

    // Chosen.js destekli tekli seçim için yardımcı fonksiyon
    function setChosenOption(selectElement, value) {
        if (selectElement.options) {
            const option = Array.from(selectElement.options).find(opt =>
                opt.value === value || opt.text.includes(value)
            );
            if (option) {
                option.selected = true;
                $(selectElement).trigger('chosen:updated');
            }
        }
    }

    // Chosen.js destekli çoklu seçim için yardımcı fonksiyon
    function setChosenOptions(selectElement, values) {
        if (selectElement.options) {
            Array.from(selectElement.options).forEach(option => {
                option.selected = values.some(value =>
                    option.value === value || option.text.includes(value)
                );
            });
            $(selectElement).trigger('chosen:updated');
        }
    }

    // Seçeneklerin yüklenmesini bekleyen yardımcı fonksiyon
    function waitForOptions(selectElement) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
                if (selectElement.options.length > 0) {
                    clearInterval(interval);
                    resolve();
                } else if (++attempts >= maxAttempts) {
                    clearInterval(interval);
                    reject(new Error('Seçenekler yüklenemedi'));
                }
            }, 300);
        });
    }
})();
