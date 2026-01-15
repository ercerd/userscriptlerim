# UserScript Koleksiyonum

Bu depo, tarayıcı deneyimini iyileştirmek ve çeşitli web tabanlı iş akışlarını otomatize etmek için geliştirdiğim UserScript'leri (kullanıcı betiklerini) içerir.

## 🛠️ Nasıl Kullanılır?

Bu betikleri kullanabilmek için tarayıcınızda bir UserScript yöneticisi eklentisi kurulu olmalıdır:
* **Chrome / Edge / Brave:** [Violentmonkey](https://violentmonkey.github.io/) veya [Tampermonkey](https://www.tampermonkey.net/)
* **Firefox:** [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) veya [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

Eklentiyi kurduktan sonra, aşağıdaki listeden istediğiniz betiğin adına tıklayıp "Raw" görünümüne geçerek veya doğrudan linke tıklayarak kurulumu başlatabilirsiniz.

## 📂 Betik Listesi

| Dosya Adı | Açıklama | Sürüm |
|-----------|----------|-------|
| **[karantina.user.js](karantina.user.js)** | Karantina BSS Uygunluk Sorgulama sayfasına sık kullanılan kapıların (Mersin, Edirne vb.) yıl bazlı sayı başlangıçlarını ekleyen hızlı seçim butonları. | 2.50 |
| **[tps.user.js](tps.user.js)** | Tek Pencere Sistemi (TPS) belge listesi sayfasında, arama kutusunun yanına yıl ve belge serisi seçimi için pratik bir dropdown menü ekler. | 1.2 |
| **[combinedonbildirim.user.js](combinedonbildirim.user.js)** | Captcha otomatik doldurma, form alanı güncellemeleri ve sertifika işlemleri gibi özellikleri tek bir çatı altında toplayan hepsi bir arada araç. | - |
| **[konatfaturaislemleri.user.js](konatfaturaislemleri.user.js)** | Konat için fatura ve menü işlemlerini birleştiren hepsi bir arada çözüm. Özellikler: PDF indirme/birleştirme, tarih/firma filtresi, satır gizleme/renklendirme, otomatik onay, menü kısayolları. | 1.6 |
| **[gorev.user.js](gorev.user.js)** | Multiselect (çoklu seçim) destekli gelişmiş form doldurma işlemleri yapar. | - |
| **[ggbsithalat.user.js](ggbsithalat.user.js)** | GGBS İthalat sayfalarında dropdownlardan hızlı değer seçimi yapmak için kenar çubuğu ve butonlar ekler. | - |
| **[mobilggbsonbildirim.user.js](mobilggbsonbildirim.user.js)** | Mobil görünümde gizlenen Gümrük Başvuru No ve Tarihi sütunlarını görünür hale getirir. | - |

## 🔄 Güncellemeler

* **15.01.2026:** `konatfaturaislemleri.user.js` ve `konatmenu.user.js` betikleri `konatfaturaislemleri.user.js` adı altında birleştirildi. Yeni özellikler eklendi:
    - Kompakt, iki satırlı filtre ve eylem barı.
    - Tüm filtreleri temizleme butonu.
    - PDF'i olan/olmayan faturaları gizleme seçeneği.
    - Otomatik güncelleme için `@updateURL` ve `@downloadURL` eklendi.
* **06.01.2026:** `karantina.user.js` ve `tps.user.js` betikleri 2026 yılına uyumlu hale getirildi. Modüler yapıya geçilerek yıl yönetimi kolaylaştırıldı.

## 🤝 Katkıda Bulunma

Hataları bildirmek veya özellik isteğinde bulunmak için [Issues](https://github.com/ercerd/userscriptlerim/issues) sekmesini kullanabilirsiniz.

---
*Bu proje kişisel gelişim ve otomasyon amaçlıdır.*