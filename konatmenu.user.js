// ==UserScript==
// @name         konatmenu
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  İşlemdeki Belgeler menüsünü açılır kapanır hale getir ve altına linkler ekle. Ayrıca yeni bir row ekleyip ortasına Pernod butonu yerleştir.
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
    childNav.style.display = 'block'; // Başlangıçta gizli

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


    // Pernod butonunu oluştur
    const pernodButton = document.createElement('button');
    pernodButton.innerText = 'Pernod';
    pernodButton.style.padding = '10px';
    pernodButton.style.backgroundColor = '#007bff';
    pernodButton.style.color = '#fff';
    pernodButton.style.border = 'none';
    pernodButton.style.borderRadius = '5px';
    pernodButton.style.cursor = 'pointer';

    // Butonun onclick özelliğini ayarla
    pernodButton.setAttribute('onclick', 'firmasec({"cari":"732","cfiyat":null,"cunvan":"Pernod Ricard \\u0130stanbul \\u0130\\u00e7 ve D\\u0131\\u015f Tic. Ltd. \\u015eti.","cvn":"0550233279","cvd":"Bo\\u011fazi\\u00e7i Kurumlar","cadres":"Maslak Mah. B\\u00fcy\\u00fckdere Cad. Spine Tower Apt. 243\/168","ctelefon":"5497439861","cmobil":"05497439855","ceposta":"pernodim@dogruer.com","csehir":"\\u0130stanbul","cilce":"Sar\\u0131yer"})');

    // Yeni bir row ve col-md-12 elementi oluştur
    const newRow = document.createElement('div');
    newRow.className = 'row'; // Bootstrap row sınıfı
    newRow.style.marginTop = '10px'; // Üstten boşluk ekle

    const newCol = document.createElement('div');
    newCol.className = 'col-md-12 text-center'; // Bootstrap col-md-12 ve metni ortala

    // Butonu yeni sütuna ekle
    newCol.appendChild(pernodButton);

    // Sütunu row'a ekle
    newRow.appendChild(newCol);

    // .col-md-6 elementini bul
    const colMd6Element = document.querySelector('.col-md-6');

    // Eğer .col-md-6 elementi varsa, yeni row'u bu elementin üstüne ekle
    if (colMd6Element) {
        colMd6Element.parentNode.insertBefore(newRow, colMd6Element);
    } else {
        console.error('.col-md-6 elementi bulunamadı!');
    }


})();