# Userscrpt Tasarım Sistemi

## Tasarım Aileleri

Scriptler hedefledikleri platforma göre 3 tasarım ailesine ayrılır:

| Aile | Scriptler | Renk Paleti |
|------|-----------|-------------|
| **GGBS** | `combinedonbildirim`, `ggbsithalat1`, `mobilggbsonbildirim` | Açık zemin, yeşil/mavi aksan |
| **TPS/Karantina** | `tps`, `karantina` | Koyu zemin, yeşil aksan |
| **Modern** | `timosanalizsikliklarimoderntablo`, `konatfaturaislemleri`, `gorev`, `konatfaturabirlestirme` | Açık zemin, mor/mavi gradient aksan |

---

## 1. Renk Paletleri

### 1.1 GGBS Ailesi

```css
--gg-bg:           #ffffff;
--gg-bg-secondary: #f8f9fa;
--gg-text:         #333333;
--gg-text-muted:   #6c757d;
--gg-border:       #dee2e6;
--gg-primary:      #1e88e5;    /* Mavi - ana aksiyon */
--gg-success:      #28a745;    /* Yeşil - başarılı işlem */
--gg-danger:       #dc3545;    /* Kırmızı - hata/silinmiş */
--gg-warning:      #ffc107;    /* Sarı - uyarı */
--gg-info:         #17a2b8;    /* Turkuaz - bilgi */
--gg-accent:       #4CAF50;    /* Yeşil - vurgu */
```

### 1.2 TPS/Karantina Ailesi

```css
--tk-bg:           #333333;
--tk-bg-secondary: #222222;
--tk-text:         #FEFFFC;
--tk-text-muted:   #999999;
--tk-border:       #4CAF50;
--tk-primary:      #4CAF50;    /* Yeşil - ana aksiyon */
--tk-danger:       #f44336;    /* Kırmızı - hata */
--tk-warning:      #ff9800;    /* Turuncu - uyarı */
```

### 1.3 Modern Ailesi

```css
--md-bg:           #ffffff;
--md-bg-secondary: #f8f9fa;
--md-text:         #2d3436;
--md-text-muted:   #636e72;
--md-border:       #e0e0e0;
--md-primary:      #667eea;    /* Mor - gradient başlangıç */
--md-primary-alt:  #764ba2;    /* Mor - gradient bitiş */
--md-success:      #28a745;    /* Yeşil */
--md-danger:       #dc3545;    /* Kırmızı */
--md-warning:      #ffc107;    /* Sarı */
--md-info:         #2196F3;    /* Mavi */
--md-secondary:    #6c757d;    /* Gri */
```

---

## 2. Z-Index Yönetimi

Katmanlı yapı için standart z-index değerleri:

| Katman | Değer | Kullanım |
|--------|-------|----------|
| `--z-dropdown` | 1000 | Dropdown, popup menüler |
| `--z-sticky-bar` | 1000-9999 | Fixed header/toolbar |
| `--z-toast` | 10000 | Toast bildirimleri |
| `--z-modal-overlay` | 100000 | Modal arkaplan katmanı |
| `--z-modal` | 2147483647 | Modal içeriği (max safe) |

---

## 3. Ortak Componentler

### 3.1 Toast Bildirimi

Tüm scriptlerde kullanılacak ortak toast yapısı:

```css
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
}

.toast {
    padding: 10px 20px;
    border-radius: 8px;
    color: #fff;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: auto;
    animation: toast-in 0.3s ease;
}

@keyframes toast-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
}

.toast--success { background-color: var(--success-color); }
.toast--error   { background-color: var(--danger-color); }
.toast--warning { background-color: var(--warning-color); }
.toast--info    { background-color: var(--info-color); }
```

### 3.2 Butonlar

```css
/* Ana buton */
.us-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: system-ui, -apple-system, sans-serif;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}
.us-btn:hover {
    filter: brightness(0.92);
    transform: translateY(-1px);
}
.us-btn:active {
    filter: brightness(0.85);
    transform: translateY(0) scale(0.98);
}
.us-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    filter: none;
}

/* Varyantlar - renk aileye göre değişir */
.us-btn--primary  { background-color: var(--primary-color);   color: #fff; }
.us-btn--success  { background-color: var(--success-color);   color: #fff; }
.us-btn--danger   { background-color: var(--danger-color);    color: #fff; }
.us-btn--warning  { background-color: var(--warning-color);   color: #333; }
.us-btn--secondary { background-color: var(--secondary-color); color: #fff; }
```

### 3.3 Badge/Indicator

```css
.us-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    font-family: system-ui, -apple-system, sans-serif;
    white-space: nowrap;
}

.us-badge--exists {
    background-color: rgba(40, 167, 69, 0.12);
    color: #2e7d32;
    border: 1px solid rgba(40, 167, 69, 0.25);
}
.us-badge--missing {
    background-color: rgba(220, 53, 69, 0.08);
    color: #c62828;
    border: 1px solid rgba(220, 53, 69, 0.2);
}
```

### 3.4 Input

```css
.us-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    font-size: 13px;
    font-family: system-ui, -apple-system, sans-serif;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    outline: none;
    box-sizing: border-box;
}
.us-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
}
```

### 3.5 Modal

```css
.us-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.us-modal-content {
    background: #fff;
    padding: 24px;
    border-radius: 10px;
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
```

### 3.6 Loading Spinner

```css
.us-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-top-color: transparent;
    animation: us-spin 0.6s linear infinite;
}

@keyframes us-spin {
    to { transform: rotate(360deg); }
}
```

---

## 4. Tasarım Kuralları

### 4.1 Genel

- **Font**: `system-ui, -apple-system, sans-serif` (tüm scriptlerde ortak)
- **Border-radius**: Buton/input `5px`, badge `20px`, modal `10px`, kart `8px`
- **Transition süresi**: `0.15s ease` (hover/active/focus), `0.3s ease` (modal/panel açılış)
- **Gölge**: Buton hover `0 2px 4px rgba(0,0,0,0.1)`, modal `0 20px 60px rgba(0,0,0,0.3)`
- **Padding**: Butonlar `8px 16px`, inputlar `8px 12px`, badge `3px 10px`

### 4.2 Yöntem

- **`GM_addStyle()`** kullan (`<style>` injection yerine) — Violentmonkey/Tampermonkey uyumluluğu için
- Sınıf tabanlı CSS kullan, inline stillerden kaçın
- `#id` selector yerine `.class` selector tercih et
- Tüm CSS sınıflarına `us-` prefix'i ekle (çakışma önlemi)
- Renk değişkenlerini CSS custom properties olarak tanımla

### 4.3 Kırmızı Renk Standardizasyonu

| Anlam | GGBS | TPS/Karantina | Modern |
|-------|------|---------------|--------|
| Hata/Silme | `#dc3545` | `#f44336` | `#dc3545` |
| Uyarı | `#ffc107` | `#ff9800` | `#ffc107` |
| Başarı | `#28a745` | `#4CAF50` | `#28a745` |

---

## 5. Script-Aile Eşlemesi ve Renk Tokenları

Her script kendi ailesine ait renk tokenlarını `GM_addStyle` ile :root'da tanımlar:

**GGBS:**
```css
:root {
    --primary-color: #1e88e5;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #17a2b8;
    --secondary-color: #6c757d;
    --border-color: #dee2e6;
    --bg-color: #ffffff;
    --text-color: #333333;
    --primary-rgb: 30, 136, 229;
}
```

**TPS/Karantina:**
```css
:root {
    --primary-color: #4CAF50;
    --success-color: #4CAF50;
    --danger-color: #f44336;
    --warning-color: #ff9800;
    --info-color: #4CAF50;
    --secondary-color: #555555;
    --border-color: #4CAF50;
    --bg-color: #333333;
    --text-color: #FEFFFC;
    --primary-rgb: 76, 175, 80;
}
```

**Modern:**
```css
:root {
    --primary-color: #667eea;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #2196F3;
    --secondary-color: #6c757d;
    --border-color: #e0e0e0;
    --bg-color: #ffffff;
    --text-color: #2d3436;
    --primary-rgb: 102, 126, 234;
}
```

---

## 6. Component-Durum Matrisi

| Component | Normal | Hover | Active/Focus | Disabled |
|-----------|--------|-------|-------------|----------|
| `.us-btn` | Renkli zemin | brightness(0.92) + translateY(-1px) | brightness(0.85) + scale(0.98) | opacity(0.5) |
| `.us-input` | 1px border | - | primary-color border + box-shadow | opacity(0.5) |
| `.us-badge` | Hafif arkaplan | - | - | - |
| `.toast` | Renkli zemin | - | - | - |
| `.us-modal-overlay` | rgba(0,0,0,0.6) | - | - | - |

---

## 7. Migrasyon Yolu

1. Her script'e `us-` prefixed CSS sınıflarını `GM_addStyle` ile ekle
2. Inline stilleri kademeli olarak class-based stillerle değiştir
3. Toast bildirimlerini ortak `toast-container` + `.toast` yapısına dönüştür
4. Z-index değerlerini yukarıdaki tabloya göre normalize et
5. Kırmızı renkleri aile paletine göre standardize et
