#!/usr/bin/fish

# Mevcut yazıcıları listele (sadece yazıcı adlarını göster)
echo "Mevcut yazıcılar:"
lpstat -p | awk '/printer/ {print NR". "$2}'

# Kullanıcıdan yazıcı seçmesini iste
echo ""
read -P "Yazıcı numarasını seçin: " secim

# Seçilen yazıcıyı al
set yazici (lpstat -p | awk -v sec="$secim" 'NR==sec && /printer/ {print $2}')

if test -z "$yazici"
    echo "Geçersiz seçim!"
    exit 1
end

echo "Seçilen yazıcı: $yazici"
echo ""

# Her dosyayı yazdır
for file in $argv
    lp -d "$yazici" -o sides=two-sided-short-edge -o number-up=2 -o collate=true "$file"
    echo "✓ "(basename "$file")" yazdırılıyor..."
end

echo ""
echo "Tüm dosyalar yazdırma kuyruğuna eklendi!"
read -P "Enter ile kapat..."
