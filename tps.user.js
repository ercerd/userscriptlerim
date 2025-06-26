// ==UserScript==
// @name        TPS BelgeListesi Dropdown Ekleme
// @namespace   violentmonkey
// @version     1
// @description search-fld input alanının soluna dropdown ekleme
// @match       https://uygulama.gtb.gov.tr/TekPencere/EBelge/BelgeListesi
// @grant       none
// ==/UserScript==

(function() {
  'use strict';

  // Dropdown için seçenekler
  const dropdownOptions = [
    { value: '2524308110090207', label: '2025' },
    { value: '2424308110090205', label: '2024' },
    { value: '2324308110090204', label: '2023' },


  ];

  function injectDropdown() {
  // Hedef input alanını bul
  const inputField = document.getElementById('search-fld');
  if (!inputField) {
    console.error('Hedef input alanı (search-fld) bulunamadı.');
    return;
  }

  // Dropdown'ı eklemek istediğimiz "btn-group" div'ini bul
  const targetDiv = document.querySelector('.btn-group');
  if (!targetDiv) {
    console.error('Hedef div (class="btn-group") bulunamadı.');
    return;
  }

  // Yeni bir dropdown oluştur
  const dropdown = document.createElement('select');
  dropdown.classList.add('custom-dropdown'); // Stil için class ekle

  // Dropdown stilini ayarla
  dropdown.style.backgroundColor = "#333"; // Arka plan rengi
  dropdown.style.border = "1px solid #4CAF50"; // Kenarlık rengi
  dropdown.style.borderRadius = "4px"; // Kenarlık yuvarlatma
  dropdown.style.color = "#FEFFFC"; // Yazı rengi
  dropdown.style.padding = "10px"; // İç boşluk
  dropdown.style.width = "100px"; // Genişlik
  dropdown.style.height = "40px"; // Yükseklik
  dropdown.style.fontFamily = "Arial, sans-serif"; // Font ailesi
  dropdown.style.fontSize = "16px"; // Font boyutu
  dropdown.style.textIndent = "0.01px"; // Metin hizalama
  dropdown.style.display = "block"; // Blok elemanı yap
  dropdown.style.marginLeft = "auto"; // Sağa dayalı yap

  // Placeholder seçeneği ekle
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Yıl Seç';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  dropdown.appendChild(placeholderOption);

  // Diğer seçenekleri ekle
  dropdownOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    dropdown.appendChild(optionElement);
  });

  // Dropdown'ı "col-sm-3" div'ine ekle
  targetDiv.appendChild(dropdown);

  // Dropdown değiştiğinde input alanını güncelle
  dropdown.addEventListener('change', function () {
    inputField.value = this.value; // Seçilen değeri input alanına yaz
    inputField.focus(); // Input alanına odaklan

    // Input alanına görsel efekt ekle
    inputField.style.border = "3px solid #4CAF50"; // Yeşil kenarlık
    setTimeout(() => {
      inputField.style.border = ""; // Kenarlığı varsayılana döndür
    }, 600);
  });
}

  // Sayfa yüklendiğinde dropdown'ı ekle
  window.addEventListener('load', injectDropdown);
})();