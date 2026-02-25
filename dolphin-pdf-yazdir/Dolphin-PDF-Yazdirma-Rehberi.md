# Dolphin PDF Yazdırma Kısayolu Kurulum Rehberi

Bu rehber, KDE Dolphin dosya yöneticisinde PDF dosyalarına sağ tıklayarak, seçili PDF'leri tek tek, çift taraflı (kısa kenardan çevirmeli) ve her yaprağa 2 sayfa sığacak şekilde yazdıran bir menü öğesinin nasıl ekleneceğini açıklar.

## Gereksinimler

Sisteminize bu eklentiyi kurmadan önce aşağıdaki paketlerin yüklü olduğundan emin olun:
- **CUPS (`lp` ve `lpstat` komutları)**: Yazdırma işlemlerini gerçekleştirmek için.
- **Fish Shell (`fish`)**: Yazdırma scripti fish diliyle yazıldığı için.
- **Ghostty Terminal (`ghostty`)**: İşlemin bir terminal penceresinde kullanıcıya gösterilmesi için (Farklı bir terminal kullanıyorsanız `.desktop` dosyasında `Exec` satırını ona göre düzenlemelisiniz; örneğin `konsole -e`, `alacritty -e` vb.).

## Dosyalar ve Görevleri

1. **`yazdir.fish`**: Sisteme ekli yazıcıları listeleyip size soran ve seçtiğiniz yazıcıya belirtilen formatta yazdırma komutunu gönderen betiktir.
2. **`pdf-yazdir.desktop`**: Dolphin'in sağ tık menüsüne (Service Menu) "PDF Yazdır (2 sayfa/yaprak)" seçeneğini ekleyen yapılandırma dosyasıdır.

## Kurulum Adımları

### Adım 1: Script Dosyasını Yerleştirme
`yazdir.fish` dosyasını ana dizininize (`~/` yani `/home/kullanici_adiniz/`) kopyalayın.

Terminali açın ve dosyaya çalışma izni verin:
```bash
chmod +x ~/yazdir.fish
```
*(Not: Eğer dosyayı farklı bir dizine koymak isterseniz, 2. adımda yer alan `.desktop` dosyası içerisindeki `~/yazdir.fish` yolunu kendi dizininize göre güncellemelisiniz.)*

### Adım 2: Sağ Tık Menüsünü (Service Menu) Ekleme
Dolphin'in bu özelliği tanıması için `pdf-yazdir.desktop` dosyasını KDE'nin ilgili servis menüleri klasörüne kopyalamanız gerekir.

Kullandığınız KDE Plasma sürümüne göre hedef klasör değişebilir:

**KDE Plasma 6 Kullanıyorsanız:**
```bash
mkdir -p ~/.local/share/kio/servicemenus/
cp pdf-yazdir.desktop ~/.local/share/kio/servicemenus/
```

**KDE Plasma 5 Kullanıyorsanız:**
```bash
mkdir -p ~/.local/share/kservices5/ServiceMenus/
cp pdf-yazdir.desktop ~/.local/share/kservices5/ServiceMenus/
```

### Adım 3: Değişiklikleri Uygulama
Dolphin'in yeni sağ tık menüsünü görmesi için açık olan tüm Dolphin pencerelerini kapatıp yeniden açın. Eğer değişiklik hemen yansımazsa terminalde şu komutu çalıştırarak Dolphin'i tamamen yeniden başlatabilirsiniz:
```bash
killall dolphin
```

## Kullanımı

1. Dolphin'i açın ve bir veya birden fazla PDF dosyası seçin.
2. Sağ tıklayın, **Eylemler (Actions)** altından (veya doğrudan menüden) **"PDF Yazdır (2 sayfa/yaprak)"** seçeneğine tıklayın.
3. Ekranda bir Ghostty terminal penceresi açılacak ve size sistemdeki yazıcıları listeleyecektir.
4. Yazdırmak istediğiniz yazıcının numarasını girip `Enter`'a basın.
5. Seçtiğiniz dosyalar, çift taraflı (kısa kenar) ve sayfa başına 2 yaprak olacak şekilde sırasıyla yazdırılacaktır.
6. İşlem bitince enter'a basarak pencereyi kapatabilirsiniz.

## Sorun Giderme
- **Pencere açılmıyorsa:** `ghostty` terminalinin sisteminizde kurulu olduğundan veya `.desktop` dosyasındaki `Exec` komutunun doğru olduğundan emin olun.
- **Yazdırma başlamıyorsa:** Seçtiğiniz dosyaların PDF olduğundan ve CUPS servisinin çalıştığından emin olun. Terminalden el ile `fish ~/yazdir.fish dosya.pdf` komutunu çalıştırarak olası hataları gözlemleyebilirsiniz.
