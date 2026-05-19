# UserScript Koleksiyonum

Bu depo, tarayıcı deneyimini iyileştirmek ve çeşitli web tabanlı iş akışlarını otomatize etmek için geliştirdiğim UserScript'leri (kullanıcı betiklerini) içerir.

## 🛠️ Nasıl Kullanılır?

Bu betikleri kullanabilmek için tarayıcınızda bir UserScript yöneticisi eklentisi kurulu olmalıdır:
* **Chrome / Edge / Brave:** [Violentmonkey](https://violentmonkey.github.io/) veya [Tampermonkey](https://www.tampermonkey.net/)
* **Firefox:** [Violentmonkey](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/) veya [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
* **Safari (iPhone / iPad / Mac):** [Userscripts](https://apps.apple.com/us/app/userscripts/id1463298887) (Ücretsiz ve Açık Kaynak)

Eklentiyi kurduktan sonra, aşağıdaki listeden istediğiniz betiğin adına tıklayıp "Raw" görünümüne geçerek veya doğrudan linke tıklayarak kurulumu başlatabilirsiniz.

### 📱 iPhone / Safari Kullanımı
1. App Store'dan **Userscripts** eklentisini indirin.
2. Safari > Ayarlar (Aa simgesi) > Eklentileri Yönet kısmından **Userscripts**'i aktif edin.
3. Eklentiye istediğiniz bir klasör için izin verin.
4. Bu depodaki `.user.js` dosyasına tıklayın ve "Raw" butonuna basın. Eklenti otomatik olarak kurulumu algılayacaktır.

## 📂 Betik Listesi

| Dosya Adı | Açıklama | Sürüm |
|-----------|----------|-------|
| **[karantina.user.js](karantina.user.js)** | Karantina BSS Uygunluk Sorgulama sayfasına sık kullanılan kapıların (Mersin, Edirne vb.) yıl bazlı sayı başlangıçlarını ekleyen hızlı seçim butonları. | 2.51 |
| **[tps.user.js](tps.user.js)** | Tek Pencere Sistemi (TPS) belge listesi sayfasında, arama kutusunun yanına yıl ve belge serisi seçimi için pratik bir dropdown menü ekler. | 1.3 |
| **[combinedonbildirim.user.js](combinedonbildirim.user.js)** | Önbildirim GGBS sayfaları için hepsi bir arada araç. Captcha otomatik doldurma, form alanı güncellemeleri, sayfa tipine göre akıllı buton gösterimi (Ürün/Sevkiyat sorgulama, Sertifika/İçerik/Etiket indirme), ID kopyalama ve form sıfırlama özellikleri. | 2.198 |
| **[konatfaturaislemleri.user.js](konatfaturaislemleri.user.js)** | Konat için fatura ve menü işlemlerini birleştiren hepsi bir arada çözüm. Özellikler: PDF indirme/birleştirme, tarih/firma filtresi, satır gizleme/renklendirme, otomatik onay, menü kısayolları. | 4.2 |
| **[gorev.user.js](gorev.user.js)** | Görev ekleme formu için multiselect (çoklu seçim) destekli gelişmiş form doldurma ve temizleme betiği. Chosen.js uyumlu, loading animasyonlu. | 2.1 |
| **[ggbsithalat1.user.js](ggbsithalat1.user.js)** | GGBS İthalat sayfalarında (servlet tabanlı eski SPA) kenar çubuğu ile hızlı işlem yapma aracı. İthalat açma, onay, denetim, numune (KG/Adet/Litre) ve laboratuvar seçimi butonları. ⚠️ Quirks Mode uyarısı veren eski bir HTML uygulamasında çalışır. | 1.29 |
| **[mobilggbsonbildirim.user.js](mobilggbsonbildirim.user.js)** | Mobil görünümde gizlenen Gümrük Başvuru No ve Tarihi sütunlarını görünür hale getirir. Ön Bildirim No hücresinin yanına, tıklandığında sağdaki gizli Gümrük Başvuru No'yu (ID) kopyalayan şık bir "ID" butonu ekler. | 2.5 |
| **[timosanalizsikliklarimoderntablo.user.js](timosanalizsikliklarimoderntablo.user.js)** | TIMOS Analiz Sıklık, Ürün ve Antrepo sayfaları için modern tablo arayüzü, toplu silme, Excel aktarımı ve gelişmiş filtreleme özellikleri. | 2.4 |
| **[timosgecicialanartirma.user.js](timosgecicialanartirma.user.js)** | Timos analiz sıklık giriş sayfasında ana div'i tam genişliğe açar ve grid içindeki dikey scroll'u kaldırarak tabloyu tam görünür hale getirir. Angular SPA desteği (MutationObserver). | 1.4 |

## 🔄 Güncellemeler

* **20.05.2026:** `mobilggbsonbildirim.user.js` güncellendi (v2.5): Sütun sabitleme/yer değiştirme mantığı kaldırılarak orijinal sayfa görüntüsüne geri dönüldü. Ön Bildirim Numarası hücresinin yanına, tıklandığında ilgili satırın Gümrük Başvuru No (ID) bilgisini panoya kopyalayan ve toast bildirimi gösteren pratik bir "ID" butonu eklendi.
* **20.05.2026:** `mobilggbsonbildirim.user.js` güncellendi (v2.4): Sütun genişlikleri %30 daraltılarak 90px yapıldı, başlık ve hücrelerde kelimelerin serbestçe alt satıra kırılması sağlandı.
* **20.05.2026:** `mobilggbsonbildirim.user.js` güncellendi (v2.3): Sütun başlıkları "Bildirim No" ve "ID No" olarak kısaltıldı. ID No sütununun mobilde alt satıra serbestçe kırılabilmesi (word-break: break-all) sağlandı ve genişlikleri dengelendi (125px).
* **20.05.2026:** `mobilggbsonbildirim.user.js` güncellendi (v2.2): Logo ve üst başlık çakışmasını engellemek için mobil ekranda 180px üst boşluk (margin-top) eklendi. Gümrük Başvuru No sütununun tam sığması için genişlik 175px'e çıkarıldı ve font monospace yapılarak sığdırıldı. Ebeveyn div'indeki display:block kaldırılarak sayfa düzeni korundu.
* **20.05.2026:** `mobilggbsonbildirim.user.js` güncellendi (v2.1): Gereksiz Onay Durumu sütunu tamamen kaldırıldı, Ön Bildirim No ve Gümrük Başvuru No sütunları en başa taşınarak mobil cihazlar için yan yana kilitlendi (sticky).
* **14.05.2026:** `timosanalizsikliklarimoderntablo.user.js` (v2.4) koleksiyona eklendi. `mobilggbsonbildirim.user.js` baştan aşağı yenilendi (v2.0). Sticky header, sticky ilk sütun, modern tablo tasarımı ve iPhone/Safari kurulum talimatları eklendi.
* **20.03.2026:** README.md tüm betiklerin güncel sürüm ve açıklamalarıyla güncellendi. `timosgecicialanartirma.user.js` betik listesine eklendi. `ggbsithalat.user.js` → `ggbsithalat1.user.js` olarak düzeltildi.
* **19.03.2026:** `combinedonbildirim.user.js` güncellendi: Sayfa tipine göre akıllı buton gösterimi (Ön Bildirim Sorgulama sayfasına özel butonlar), çoklu tablo genişlik desteği ve koşullu buton mantığı eklendi.
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