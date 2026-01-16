// ==UserScript==
// @name        karantina
// @namespace   violentmonkey
// @version     2.50
// @description Karantina BSS Uygunluk Sorgulama Sayfasına Sık Kullanılan Kapıların Sayı Başlangıçlarını Ekleme
// @match       https://tbsapp.tarbil.gov.tr/Reports/ReportViewDynamic.aspx?report=*
// @grant       none
// @updateURL   https://raw.githubusercontent.com/ercerd/userscriptlerim/master/karantina.user.js
// @downloadURL https://raw.githubusercontent.com/ercerd/userscriptlerim/master/karantina.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Konfigürasyon: Varsayılan yıl ve gösterilecek yıllar
    const config = {
        defaultYear: 2026,
        visibleYears: [2024, 2025, 2026] // En fazla 5 yıl olacak şekilde ayarlayınız
    };

    // Kapı tanımları (Sabitler)
    const gates = [
        { prefix: '33-ITH1', name: 'Mersin          :' },
        { prefix: '22-ITH1', name: 'Edirne          :' },
        { prefix: '04-ITH1', name: 'Gürbulak-Ağrı   :' },
        { prefix: '08-ITH1', name: 'Sarp-Artvin     :' },
        { prefix: '30-ITH2', name: 'Esendere-Hakkari:' },
        { prefix: '36-ITH2', name: 'Kars            :' },
        { prefix: '54-ITH1', name: 'Sakarya         :' },
        { prefix: '75-ITH1', name: 'Aktaş-Türkgözü-Ardahan:' },
        { prefix: '76-ITH2', name: 'Dilucu-Iğdır    :' },
        { prefix: '31-ITH1', name: 'Hatay           :' },
        { prefix: '73-ITH1', name: 'Habur            :' },
        { prefix: '65-ITH2', name: 'Kapıköy          :' },
        { prefix: '33-IADE1', name: 'İhraç İadesi    :' },
    ];

    // Belirtilen yıl için seçenekleri oluşturur
    function getOptionsForYear(year) {
        return gates.map(gate => ({
            value: `${gate.prefix}-${year}-`,
            explanation: gate.name
        }));
    }

    // Scrollbar stilini ekle
    const style = document.createElement('style');
    style.textContent = `
        .dropdown-list::-webkit-scrollbar {
            width: 8px;
        }
        .dropdown-list::-webkit-scrollbar-track {
            background: #333;
        }
        .dropdown-list::-webkit-scrollbar-thumb {
            background-color: #4CAF50;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    function injectDropdown() {
        const tableElement = document.querySelector('.auto-style1');
        if (!tableElement) {
            console.error('Table element with class "auto-style1" not found');
            return;
        }

        const newTable = document.createElement('table');
        newTable.classList.add('custom-table');
        const newRow = newTable.insertRow();
        const cell = newRow.insertCell();

        const dropdownContainer = document.createElement('div');
        dropdownContainer.style.position = 'relative';
        dropdownContainer.style.width = '350px';

        // Create search input (dropdown button yerine)
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Kapı Seçiniz veya Arayın...';
        searchInput.style.width = '100%';
        searchInput.style.backgroundColor = "#333";
        searchInput.style.border = "1px solid #4CAF50";
        searchInput.style.borderRadius = "4px";
        searchInput.style.color = "#FEFFFC";
        searchInput.style.padding = "10px";
        searchInput.style.height = "40px";
        searchInput.style.fontFamily = "Arial, sans-serif";
        searchInput.style.fontSize = "16px";

        // Create dropdown list
        const dropdownList = document.createElement('ul');
        dropdownList.classList.add('dropdown-list');
        dropdownList.style.display = 'none';
        dropdownList.style.position = 'absolute';
        dropdownList.style.top = '100%';
        dropdownList.style.left = '0';
        dropdownList.style.right = '0';
        dropdownList.style.backgroundColor = '#333';
        dropdownList.style.border = '1px solid #4CAF50';
        dropdownList.style.borderRadius = '1px';
        dropdownList.style.marginTop = '0px';
        dropdownList.style.maxHeight = '450px';
        dropdownList.style.overflowY = 'auto';
        dropdownList.style.zIndex = '1000';
        dropdownList.style.listStyle = 'none';
        dropdownList.style.padding = '0';
        dropdownList.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
        dropdownList.style.scrollbarColor = '#4CAF50 #333';

        // Yılları ve o anki seçenekleri tutmak için değişkenler
        let currentOptions = getOptionsForYear(config.defaultYear);

        function populateDropdownList(filterText = '') {
            dropdownList.innerHTML = '';
            const filteredOptions = currentOptions.filter(option =>
                option.value.toLowerCase().includes(filterText.toLowerCase()) ||
                option.explanation.toLowerCase().includes(filterText.toLowerCase())
            );

            filteredOptions.forEach(option => {
                const li = document.createElement('li');
                li.textContent = `${option.explanation} ${option.value}`;

                // Liste elemanı stilleri
                li.style.padding = '4px 8px';
                li.style.cursor = 'pointer';
                li.style.color = '#FEFFFC';
                li.style.fontFamily = "Arial, sans-serif";
                li.style.fontSize = "14px";
                li.style.lineHeight = "18px";
                li.style.whiteSpace = "nowrap";
                li.style.borderBottom = "1px solid #4CAF50";

                // Son eleman için border kaldır
                if (filteredOptions[filteredOptions.length - 1] === option) {
                    li.style.borderBottom = "none";
                }

                li.addEventListener('mouseover', () => {
                    li.style.backgroundColor = '#4CAF50';
                });

                li.addEventListener('mouseout', () => {
                    li.style.backgroundColor = 'transparent';
                });

                li.addEventListener('click', () => {
                    setDefaultInputValue(option.value);
                    dropdownList.style.display = 'none';
                    searchInput.value = ''; // Seçim sonrası input'u temizle
                });

                dropdownList.appendChild(li);
            });
        }

        searchInput.addEventListener('focus', () => {
            dropdownList.style.display = 'block';
            populateDropdownList(searchInput.value);
        });

        searchInput.addEventListener('input', () => {
            dropdownList.style.display = 'block';
            populateDropdownList(searchInput.value);
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });

        function getCurrentInputValue() {
            const inputField = document.getElementById('ctl00_ctl00_bodyCPH_ContentPlaceHolder1_ReportViewerMain_ctl04_ctl03_txtValue');
            return inputField ? inputField.value : '';
        }

        function isValueInList(value, list) {
            return list.some(option => option.value === value);
        }

        // Seçilen yılın seçeneklerine göre input değerini günceller
        function updateInputValueForYear(yearOptions) {
            const currentValue = getCurrentInputValue();
            
            // Mevcut değer herhangi bir yılın listesinde var mı diye kontrol etmek biraz zor olabilir
            // çünkü elimizde tüm yılların listesi yok, sadece seçili olan var.
            // Ancak mantık şu: Mevcut input değerinin "Mersin" kısmını bulup, yeni yılın "Mersin" koduyla değiştireceğiz.
            
            // Önce mevcut değerin hangi kapıya ait olduğunu bulmaya çalışalım.
            // Bunu yapmak için `gates` listesini kullanabiliriz.
            
            const matchedGate = gates.find(gate => currentValue.includes(gate.prefix));
            
            if (matchedGate) {
                // Eğer mevcut değer bilinen bir kapıya aitse, yeni yıl için o kapının değerini bul
                const newOption = yearOptions.find(option => option.explanation === matchedGate.name);
                if (newOption) {
                     setDefaultInputValue(newOption.value);
                     return;
                }
            }
            
            // Eğer eşleşme yoksa veya input boşsa, o yılın ilk seçeneğini varsayılan yap
            setDefaultInputValue(yearOptions[0].value);
        }

        // Create container for buttons and dropdown
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        
        // Yıl butonlarını oluştur
        config.visibleYears.forEach(year => {
            const btn = document.createElement('button');
            btn.textContent = year.toString();
            btn.style.marginRight = '10px';
            btn.style.backgroundColor = "#333";
            btn.style.border = "1px solid #4CAF50";
            btn.style.borderRadius = "4px";
            btn.style.color = "#FEFFFC";
            btn.style.padding = "10px";
            btn.style.fontFamily = "Arial, sans-serif";
            btn.style.fontSize = "16px";
            btn.style.cursor = "pointer";
            btn.type = 'button';

            btn.addEventListener('click', (event) => {
                event.preventDefault();
                const newOptions = getOptionsForYear(year);
                currentOptions = newOptions;
                updateInputValueForYear(newOptions);
                populateDropdownList();
                dropdownList.style.display = 'none';
            });

            container.appendChild(btn);
        });

        document.addEventListener('click', (e) => {
            if (!dropdownContainer.contains(e.target)) {
                dropdownList.style.display = 'none';
            }
        });

        dropdownContainer.appendChild(searchInput);
        dropdownContainer.appendChild(dropdownList);

        container.appendChild(dropdownContainer);

        cell.appendChild(container);
        tableElement.parentNode.insertBefore(newTable, tableElement.nextSibling);

        // İlk yüklemede varsayılan yılın ilk değerini set et
        const defaultOptions = getOptionsForYear(config.defaultYear);
        setDefaultInputValue(defaultOptions[0].value);
    }
 
    function setDefaultInputValue(value) {
        const inputField = document.getElementById('ctl00_ctl00_bodyCPH_ContentPlaceHolder1_ReportViewerMain_ctl04_ctl03_txtValue');
        if (inputField) {
            inputField.value = value;
            const simulatedEvent = new Event('change', { bubbles: true });
            inputField.dispatchEvent(simulatedEvent);
            setTimeout(function() {
                inputField.focus();
                inputField.selectionStart = inputField.selectionEnd = inputField.value.length;
            }, 100);
        } else {
            console.error('Target input field not found');
        }
    }
 
    // Initial injection
    injectDropdown();
 })();
 