// ==UserScript==
// @name         Menü Düzenleme ve Kısayol Butonu
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  İşlemdeki Belgeler menüsünü açılır kapanır hale getir, altına linkler ekle, Pernod butonu ve manuel kısayol ekleme özelliği ekle.
// @author       You
// @match        https://konat.net.tr/dss33/v33/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/konatmenu.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/konatmenu.user.js
// ==/UserScript==

(function() {
    'use strict';

    // İşlemdeki Belgeler menüsünü bul
    const islemdekiBelgelerMenu = document.querySelector('a[href="?tpage=islemdeki-belgeler"]').parentElement;

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
        a.innerHTML = `<i class="fa fa-circle" style="color: ${link.color};"></i><span>${link.text}</span>`;
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

    // Yeni bir row ve col-md-12 elementi oluştur (Pernod ve dinamik butonlar için)
    const newRow = document.createElement('div');
    newRow.className = 'row';
    newRow.style.marginTop = '10px';

    const newCol = document.createElement('div');
    newCol.className = 'col-md-12 text-center';

    // Pernod butonunu oluştur
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
    pernodButton.setAttribute('onclick', 'firmasec({"cari":"732","cfiyat":null,"cunvan":"Pernod Ricard \\u0130stanbul \\u0130\\u00e7 ve D\\u0131\\u015f Tic. Ltd. \\u015eti.","cvn":"0550233279","cvd":"Bo\\u011fazi\\u00e7i Kurumlar","cadres":"Maslak Mah. B\\u00fcy\\u00fckdere Cad. Spine Tower Apt. 243/168","ctelefon":"5497439861","cmobil":"05497439855","ceposta":"pernodim@dogruer.com","csehir":"\\u0130stanbul","cilce":"Sar\\u0131yer"})');

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
})();