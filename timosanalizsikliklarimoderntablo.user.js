// ==UserScript==
// @name         TIMOS - Analiz Sıklık Modern Tablo + Toplu Silme
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Analiz Sıklık, Analiz Tanımlama, Ürün Tanımlama, Antrepo ve Ürün Sınıfı Tanımlama sayfaları için modern tablo, filtreleme, sayfalandırma, toplu silme, Excel Export ve gelişmiş filtreleme
// @author       You
// @match        https://timos.tasar.com.tr/*
// @match        https://timos.tasar.com.tr/main2/analizSiklikGiris*
// @match        https://timos.tasar.com.tr/main2/analizTanimlama*
// @match        https://timos.tasar.com.tr/main2/urunTanimlama*
// @match        https://timos.tasar.com.tr/main2/antrepo*
// @match        https://timos.tasar.com.tr/main2/urunSinifiTanimlama*
// @match        https://timos.tasar.com.tr/main2/gorevatama*
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Stilleri ekle
    const style = document.createElement('style');
    style.textContent = `
        html.modal-open, html.modal-open body {
            overflow: hidden !important;
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            position: fixed !important;
        }

        .stats-badge {
            background: #ff7675;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 10px;
        }

        .header-title {
            display: flex;
            align-items: center;
            font-size: 24px;
            font-weight: bold;
            color: #2d3436;
        }

        #customSiklikTableContainer {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.98);
            z-index: 1000000; /* Modallardan daha düşük olmalı */
            overflow-y: scroll; /* Scroll barı zorla göster */
            padding: 20px;
            box-sizing: border-box;
        }

        .table-header {
            background: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            color: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
        }

        .table-header h2 {
            margin: 0;
            font-size: 24px;
        }

        .close-btn {
            background: #f1f2f6;
            border: none;
            color: #2d3436;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
            font-weight: 600;
        }

        .close-btn:hover {
            background: #dfe4ea;
            transform: scale(1.02);
        }

        .filter-section {
            background: white;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            border-bottom: 2px solid #e0e0e0;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .filter-label {
            font-size: 12px;
            font-weight: 600;
            color: #555;
        }

        .filter-input {
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
            transition: all 0.3s;
        }

        .filter-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .filter-select {
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 14px;
            background: white;
            cursor: pointer;
        }

        .filter-mode-select {
            padding: 2px 5px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 11px;
            background: #f8f9fa;
            cursor: pointer;
            margin-bottom: 3px;
            color: #666;
            width: fit-content;
            align-self: flex-end;
        }

        .filter-group-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stats-bar {
            background: #f5f5f5;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #666;
            flex-wrap: wrap;
            gap: 10px;
        }

        .stats-left {
            display: flex;
            gap: 20px;
        }

        .stats-right {
            display: flex;
            gap: 10px;
        }

        .action-btn-group {
            display: flex;
            gap: 10px;
        }

        .table-wrapper {
            background: white;
            overflow-x: auto;
        }

        .custom-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1000px;
        }

        .custom-table thead {
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .custom-table th {
            padding: 15px 10px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #dee2e6;
            cursor: pointer;
            user-select: none;
            transition: background 0.2s;
            font-size: 13px;
        }

        .custom-table th:hover {
            background: #e9ecef;
        }

        .custom-table th.sortable::after {
            content: ' ⇅';
            opacity: 0.3;
        }

        .custom-table th.sort-asc::after {
            content: ' ↑';
            opacity: 1;
            color: #667eea;
        }

        .custom-table th.sort-desc::after {
            content: ' ↓';
            opacity: 1;
            color: #667eea;
        }

        .custom-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }

        .custom-table tbody tr {
            transition: all 0.2s;
        }

        .custom-table tbody tr:hover {
            background: #f8f9ff;
            transform: scale(1.001);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .custom-table tbody tr.selected {
            background: #e3f2fd;
        }

        .checkbox-cell {
            text-align: center;
            width: 40px;
        }

        .row-checkbox {
            cursor: pointer;
            width: 18px;
            height: 18px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(102,126,234,0.3);
        }

        .btn-danger {
            background: #dc3545;
            color: white;
        }

        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(220,53,69,0.3);
        }

        .btn-warning {
            background: #ffc107;
            color: #333;
        }

        .btn-warning:hover {
            background: #e0a800;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .btn-secondary:hover {
            background: #5a6268;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-success:hover {
            background: #218838;
        }

        .btn-excel {
            background: #1d6f42 !important;
            color: white !important;
            font-weight: 600 !important;
        }

        .btn-excel:hover {
            background: #155231 !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(29,111,66,0.3);
        }

        .btn-edit-row {
            background: #28a745 !important;
            color: white !important;
            padding: 5px 10px;
            font-size: 14px;
            border-radius: 4px;
        }

        .btn-edit-row:hover {
            background: #218838 !important;
        }

        .btn-delete-row {
            background: #dc3545 !important;
            color: white !important;
            padding: 5px 10px;
            font-size: 14px;
            border-radius: 4px;
        }

        .btn-delete-row:hover {
            background: #c82333 !important;
        }

        .analiz-badge {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            margin: 2px;
            font-weight: 500;
            border: 1px solid #bbdefb;
        }

        .action-buttons-row {
            display: flex;
            gap: 8px;
            justify-content: center;
        }

        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pagination {
            background: white;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            border-radius: 0 0 10px 10px;
        }

        .page-btn {
            padding: 8px 12px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }

        .page-btn:hover:not(:disabled) {
            border-color: #667eea;
            color: #667eea;
        }

        .page-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }

        .page-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .page-info {
            padding: 8px 15px;
            font-size: 14px;
            color: #666;
        }

        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: #667eea;
        }

        .error {
            text-align: center;
            padding: 40px;
            color: #dc3545;
            font-size: 16px;
        }

        .trigger-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102,126,234,0.4);
            z-index: 999998;
            transition: all 0.3s;
        }

        .trigger-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102,126,234,0.5);
        }

        .bulk-actions {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 12px 20px;
            border-radius: 5px;
            display: none;
            align-items: center;
            gap: 15px;
        }

        .bulk-actions.active {
            display: flex;
        }

        .bulk-info {
            font-weight: 600;
            color: #856404;
        }
    `;
    document.head.appendChild(style);

    let allData = [];
    let filteredData = [];
    let selectedRows = new Set();
    let sortColumn = null;
    let sortDirection = 'asc';
    let expandedView = false; // false = compact (virgülle), true = expanded (her analiz ayrı satır)
    let urunSinifMap = {}; // Ürün sınıf kodu -> adı eşleştirmesi
    let antrepoBolgeMap = {}; // Bölge ID -> Ad eşleştirmesi
    let currentPageType = 'siklik'; // 'siklik', 'tanimlama', 'urunTanimlama', 'antrepo' or 'urunSinifi'

    // Global değişkenler
    window.currentPage = 1;
    window.rowsPerPage = 25;

    // Ürün sınıflarını çek
    async function fetchUrunSiniflari() {
        try {
            const token = getAuthToken();
            if (!token) {
                console.warn('⚠️ Token bulunamadı, ürün sınıfları yüklenemedi');
                return;
            }

            console.log('🔄 Ürün sınıfları yükleniyor...');
            console.log('🔑 Token:', token.substring(0, 20) + '...');

            const response = await fetch("https://timosapi.tasar.com.tr/api/urunsinifi/GetAllUrunSinifi", {
                credentials: "include",
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Authorization": token,
                },
                method: "GET",
                mode: "cors"
            });

            console.log('📡 API Response Status:', response.status, response.statusText);

            if (!response.ok) {
                console.error('❌ Ürün sınıfları API hatası:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('📄 Hata detayı:', errorText);
                return;
            }

            const data = await response.json();
            console.log('📦 Ürün Sınıfı API HAM Yanıtı:', data);
            console.log('📦 Yanıt tipi:', typeof data);
            console.log('📦 Array mi?', Array.isArray(data));

            // Farklı olası yapıları kontrol et
            let siniflar = [];
            if (Array.isArray(data)) {
                siniflar = data;
                console.log('✓ Veri direkt array');
            } else if (data && Array.isArray(data.data)) {
                siniflar = data.data;
                console.log('✓ Veri data.data içinde');
            } else if (data && Array.isArray(data.result)) {
                siniflar = data.result;
                console.log('✓ Veri data.result içinde');
            } else if (data && Array.isArray(data.items)) {
                siniflar = data.items;
                console.log('✓ Veri data.items içinde');
            } else if (data && typeof data === 'object') {
                // Object ise, içindeki array'i bulmaya çalış
                const keys = Object.keys(data);
                console.log('📦 Object anahtarları:', keys);

                for (const key of keys) {
                    if (Array.isArray(data[key])) {
                        siniflar = data[key];
                        console.log(`✓ Veri data.${key} içinde array bulundu`);
                        break;
                    }
                }
            }

            console.log('📊 İşlenecek veri:', siniflar.length, 'adet');

            if (siniflar.length > 0) {
                console.log('🔍 İlk ürün sınıfı örneği:', siniflar[0]);
                console.log('🔍 Mevcut alanlar:', Object.keys(siniflar[0]));
            } else {
                console.warn('⚠️ Hiç ürün sınıfı bulunamadı! API yapısı beklenenden farklı olabilir.');
            }

            // Map oluştur: kod -> ad
            urunSinifMap = {};
            siniflar.forEach((sinif, index) => {
                // Farklı olası alan isimlerini kontrol et
                const kod = sinif.urunSinifKodu || sinif.kod || sinif.code || sinif.urunSinifiKodu || sinif.sinifKodu;
                const ad = sinif.urunSinifAdi || sinif.ad || sinif.adi || sinif.name || sinif.tanim || sinif.aciklama || sinif.sinifAdi;

                if (index < 3) {
                    console.log(`  [${index}] Kod: ${kod}, Ad: ${ad}`);
                }

                if (kod && ad) {
                    urunSinifMap[kod] = ad;
                }
            });

            console.log(`✅ ${Object.keys(urunSinifMap).length} ürün sınıfı map'e eklendi`);
            if (Object.keys(urunSinifMap).length > 0) {
                console.log('🔍 Map örneği (ilk 3):', Object.entries(urunSinifMap).slice(0, 3));
            }
        } catch (error) {
            console.error('❌ Ürün sınıfları yükleme hatası:', error);
            console.error('📄 Hata stack:', error.stack);
        }
    }

    // Verileri düzleştir (her analiz için ayrı satır)
    function flattenData(data) {
        const flattened = [];
        data.forEach(item => {
            const urunSinifAdi = urunSinifMap[item.urunSinifKodu] || '-';

            if (item.analizler && item.analizler.length > 0) {
                item.analizler.forEach(analiz => {
                    flattened.push({
                        ...item,
                        analizId: analiz.analizId,
                        analizAdi: analiz.analizAdi,
                        urunSinifAdi: urunSinifAdi,
                        _originalId: item.id,
                        _uniqueId: `${item.id}-${analiz.analizId}`
                    });
                });
            } else {
                // Analizi olmayan kayıtlar
                flattened.push({
                    ...item,
                    analizId: null,
                    analizAdi: '-',
                    urunSinifAdi: urunSinifAdi,
                    _originalId: item.id,
                    _uniqueId: `${item.id}-0`
                });
            }
        });

        // İlk birkaç kayıtta urunSinifAdi'yi kontrol et
        if (flattened.length > 0) {
            console.log('🔍 Düzleştirilmiş veri örneği (urunSinifAdi kontrolü):');
            console.log('  Kod:', flattened[0].urunSinifKodu);
            console.log('  Ad:', flattened[0].urunSinifAdi);
        }

        return flattened;
    }

    // Kompakt veri (analizler virgülle ayrılmış)
    function compactData(data) {
        const compacted = data.map(item => {
            const urunSinifAdi = urunSinifMap[item.urunSinifKodu] || '-';

            return {
                ...item,
                analizlerStr: item.analizler && item.analizler.length > 0
                    ? item.analizler.map(a => a.analizAdi).join(', ')
                    : '-',
                analizCount: item.analizler ? item.analizler.length : 0,
                urunSinifAdi: urunSinifAdi,
                _uniqueId: `${item.id}`
            };
        });

        // İlk kayıtta urunSinifAdi'yi kontrol et
        if (compacted.length > 0) {
            console.log('🔍 Kompakt veri örneği (urunSinifAdi kontrolü):');
            console.log('  Kod:', compacted[0].urunSinifKodu);
            console.log('  Ad:', compacted[0].urunSinifAdi);
            console.log('  Map\'te var mı?', urunSinifMap[compacted[0].urunSinifKodu]);
        }

        return compacted;
    }

    // Token'ı localStorage'dan al
    function getAuthToken() {
        const possibleKeys = ['token', 'auth_token', 'access_token', 'authToken', 'accessToken', 'jwt', 'bearer'];

        for (const key of possibleKeys) {
            const token = localStorage.getItem(key);
            if (token) {
                return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            }
        }

        for (const key of possibleKeys) {
            const token = sessionStorage.getItem(key);
            if (token) {
                return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            }
        }

        return null;
    }

    // Verileri çek
    async function fetchData() {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('Token bulunamadı. Lütfen giriş yapın.');
            }

            const currentUrl = window.location.href;
            if (currentUrl.includes('analizTanimlama')) {
                currentPageType = 'tanimlama';
                return await fetchAnalizTanimlamaData(token);
            } else if (currentUrl.includes('urunSinifiTanimlama')) {
                currentPageType = 'urunSinifi';
                return await fetchUrunSinifiData(token);
            } else if (currentUrl.includes('urunTanimlama')) {
                currentPageType = 'urunTanimlama';
                return await fetchUrunTanimlamaData(token);
            } else if (currentUrl.includes('/main2/antrepo')) {
                currentPageType = 'antrepo';
                return await fetchAntrepoData(token);
            } else {
                currentPageType = 'siklik';
                return await fetchAnalizSiklikData(token);
            }
        } catch (error) {
            console.error('Veri çekme hatası:', error);
            throw error;
        }
    }

    // Analiz Sıklık verilerini çek
    async function fetchAnalizSiklikData(token) {
        // Önce ürün sınıflarını yükle (eğer henüz yüklenmediyse)
        if (Object.keys(urunSinifMap).length === 0) {
            await fetchUrunSiniflari();
        }

        const response = await fetch("https://timosapi.tasar.com.tr/api/as/GetAllAsDTO", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || []);

        // Veriyi görünüm moduna göre işle
        allData = expandedView ? flattenData(rawData) : compactData(rawData);
        filteredData = [...allData];

        console.log(`✅ Toplam ${rawData.length} kayıt, ${allData.length} satır yüklendi (Sıklık)`);
        return true;
    }

    // Analiz Tanımlama verilerini çek
    async function fetchAnalizTanimlamaData(token) {
        const response = await fetch("https://timosapi.tasar.com.tr/api/analiz/GetAllAnaliz", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || []);

        allData = rawData.map(item => ({
            ...item,
            _uniqueId: `${item.id}`
        }));
        filteredData = [...allData];

        console.log(`✅ Toplam ${allData.length} kayıt yüklendi (Tanımlama)`);
        return true;
    }

    // Ürün Tanımlama verilerini çek
    async function fetchUrunTanimlamaData(token) {
        // Önce ürün sınıflarını yükle (eğer henüz yüklenmediyse)
        if (Object.keys(urunSinifMap).length === 0) {
            await fetchUrunSiniflari();
        }

        const response = await fetch("https://timosapi.tasar.com.tr/api/urun/GetAllUrun", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || []);

        allData = rawData.map(item => ({
            ...item,
            urunSinifAdi: urunSinifMap[item.urunSinifi] || '-',
            _uniqueId: `${item.id}`
        }));
        filteredData = [...allData];

        console.log(`✅ Toplam ${allData.length} kayıt yüklendi (Ürün Tanımlama)`);
        return true;
    }

    // Antrepo Bölgelerini çek
    async function fetchAntrepoBolgeData(token) {
        try {
            const response = await fetch("https://timosapi.tasar.com.tr/api/antrepo/GetAllAntrepoBolge", {
                credentials: "include",
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Authorization": token,
                },
                method: "GET",
                mode: "cors"
            });

            if (!response.ok) throw new Error(`Bölge hatası: ${response.status}`);

            const data = await response.json();
            const regions = Array.isArray(data) ? data : (data.data || []);

            antrepoBolgeMap = {};
            regions.forEach(r => {
                if (r.id) antrepoBolgeMap[r.id] = r.ad;
            });
            console.log(`✅ ${Object.keys(antrepoBolgeMap).length} antrepo bölgesi yüklendi`);
        } catch (error) {
            console.error('Antrepo bölge yükleme hatası:', error);
        }
    }

    // Antrepo verilerini çek
    async function fetchAntrepoData(token) {
        // Önce bölgeleri yükle
        await fetchAntrepoBolgeData(token);

        const response = await fetch("https://timosapi.tasar.com.tr/api/antrepo/GetAllAntrepo", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || []);

        allData = rawData.map(item => ({
            ...item,
            bolgeAd: item.bolgeAd || antrepoBolgeMap[item.bolgeId] || '-',
            _uniqueId: `${item.id}`
        }));
        filteredData = [...allData];

        console.log(`✅ Toplam ${allData.length} kayıt yüklendi (Antrepo)`);
        return true;
    }

    // Ürün Sınıfı verilerini çek
    async function fetchUrunSinifiData(token) {
        const response = await fetch("https://timosapi.tasar.com.tr/api/urunsinifi/GetAllUrunSinifi", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
            },
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || []);

        allData = rawData.map(item => ({
            ...item,
            _uniqueId: `${item.id}`
        }));
        filteredData = [...allData];

        console.log(`✅ Toplam ${allData.length} kayıt yüklendi (Ürün Sınıfı)`);
        return true;
    }

    // Silme işlemi (Sıklık)
    async function deleteSiklikItems(items, progressCallback) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        let deleted = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (progressCallback) progressCallback(i + 1, items.length);

            try {
                const response = await fetch('https://timosapi.tasar.com.tr/api/as/DeleteAS', {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item),
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    deleted++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return { deleted, failed };
    }

    // Silme işlemi (Analiz Tanımlama)
    async function deleteAnalizItems(items, progressCallback) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        let deleted = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item._originalId || item.id;
            if (progressCallback) progressCallback(i + 1, items.length);

            try {
                const response = await fetch(`https://timosapi.tasar.com.tr/api/analiz/DeleteAnaliz/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    deleted++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return { deleted, failed };
    }

    // Silme işlemi (Ürün Tanımlama)
    async function deleteUrunItems(items, progressCallback) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        let deleted = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item._originalId || item.id;
            if (progressCallback) progressCallback(i + 1, items.length);

            try {
                const response = await fetch(`https://timosapi.tasar.com.tr/api/urun/DeleteUrun/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    deleted++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return { deleted, failed };
    }

    async function deleteAntrepoItems(items, progressCallback) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        let deleted = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item._originalId || item.id;
            if (progressCallback) progressCallback(i + 1, items.length);

            try {
                const response = await fetch(`https://timosapi.tasar.com.tr/api/antrepo/DeleteAntrepo/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    deleted++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return { deleted, failed };
    }

    async function updateAntrepo(data) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        const response = await fetch("https://timosapi.tasar.com.tr/api/antrepo/UpdateAntrepo", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            method: "PUT",
            mode: "cors"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Güncelleme hatası: ${response.status} - ${errorText}`);
        }

        return await response.json();
    }

    // Silme işlemi (Ürün Sınıfı)
    async function deleteUrunSinifiItems(items, progressCallback) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        let deleted = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const id = item._originalId || item.id;
            if (progressCallback) progressCallback(i + 1, items.length);

            try {
                const response = await fetch(`https://timosapi.tasar.com.tr/api/urunsinifi/DeleteUrunSinifi/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    deleted++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }

            if (i < items.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        return { deleted, failed };
    }

    async function updateUrunSinifi(data) {
        const token = getAuthToken();
        if (!token) throw new Error('Token bulunamadı');

        const response = await fetch("https://timosapi.tasar.com.tr/api/urunsinifi/UpdateUrunSinifi", {
            credentials: "include",
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            method: "PUT",
            mode: "cors"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Güncelleme hatası: ${response.status} - ${errorText}`);
        }

        return await response.json();
    }

    // Görünüm değiştir
    window.toggleView = async function () {
        const btn = document.getElementById('viewToggleBtn');
        const header = document.getElementById('analizHeader');

        btn.disabled = true;
        btn.textContent = '⏳ Değiştiriliyor...';

        expandedView = !expandedView;

        // Verileri yeniden yükle
        await fetchData();
        applyFilters();

        // Header metnini güncelle
        if (header) {
            header.textContent = expandedView ? 'Analiz Adı' : 'Analizler';
        }

        btn.disabled = false;
        btn.textContent = expandedView ? '📋 Kompakt Görünüm' : '📊 Detaylı Görünüm';
    };

    // Filtreleme
    function applyFilters() {
        const getFilterValue = (id) => document.getElementById(id)?.value.toLowerCase() || '';
        const getFilterMode = (id) => document.getElementById(id + 'Mode')?.value || 'contains';

        const filterConfigs = {
            ulke: { val: getFilterValue('filterUlke'), mode: getFilterMode('filterUlke') },
            urunSinif: { val: getFilterValue('filterUrunSinif'), mode: getFilterMode('filterUrunSinif') },
            urunSinifAdi: { val: getFilterValue('filterUrunSinifAdi'), mode: getFilterMode('filterUrunSinifAdi') },
            urunAdi: { val: getFilterValue('filterUrunAdi'), mode: getFilterMode('filterUrunAdi') },
            gtip: { val: getFilterValue('filterGtip'), mode: getFilterMode('filterGtip') },
            analizAdi: { val: getFilterValue('filterAnalizAdi'), mode: getFilterMode('filterAnalizAdi') },
            siklik: { val: getFilterValue('filterSiklik'), mode: getFilterMode('filterSiklik') },
            ustBaslik: { val: getFilterValue('filterUstBaslik'), mode: getFilterMode('filterUstBaslik') },
            antrepoAd: { val: getFilterValue('filterAntrepoAd'), mode: getFilterMode('filterAntrepoAd') },
            antrepoKodu: { val: getFilterValue('filterAntrepoKodu'), mode: getFilterMode('filterAntrepoKodu') },
            antrepoBolgeAd: { val: getFilterValue('filterAntrepoBolgeAd'), mode: getFilterMode('filterAntrepoBolgeAd') },
            antrepoTip: { val: getFilterValue('filterAntrepoTip'), mode: getFilterMode('filterAntrepoTip') },
            antrepoIp: { val: getFilterValue('filterAntrepoIp'), mode: getFilterMode('filterAntrepoIp') },
            antrepoInsertedBy: { val: getFilterValue('filterAntrepoInsertedBy'), mode: getFilterMode('filterAntrepoInsertedBy') },
            urunSinifiKodu: { val: getFilterValue('filterUrunSinifiKodu'), mode: getFilterMode('filterUrunSinifiKodu') },
            urunSinifiAdi: { val: getFilterValue('filterUrunSinifiAdi'), mode: getFilterMode('filterUrunSinifiAdi') },
            urunSinifiInsertedBy: { val: getFilterValue('filterUrunSinifiInsertedBy'), mode: getFilterMode('filterUrunSinifiInsertedBy') }
        };

        const matches = (value, filterObj) => {
            if (!filterObj.val) return true;
            if (!value) return false;
            const target = value.toLowerCase();
            switch (filterObj.mode) {
                case 'starts': return target.startsWith(filterObj.val);
                case 'equals': return target === filterObj.val;
                case 'contains':
                default: return target.includes(filterObj.val);
            }
        };

        filteredData = allData.filter(item => {
            if (currentPageType === 'siklik') {
                const matchesUlke = matches(item.ulke, filterConfigs.ulke);
                const matchesUrunSinif = matches(item.urunSinifKodu, filterConfigs.urunSinif);
                const matchesUrunSinifAdi = matches(item.urunSinifAdi, filterConfigs.urunSinifAdi);
                const matchesUrunAdi = matches(item.urunAdi, filterConfigs.urunAdi);
                const matchesGtip = matches(item.gtip, filterConfigs.gtip);

                let matchesAnalizAdi = true;
                if (filterConfigs.analizAdi.val) {
                    if (expandedView) {
                        matchesAnalizAdi = matches(item.analizAdi, filterConfigs.analizAdi);
                    } else {
                        matchesAnalizAdi = matches(item.analizlerStr, filterConfigs.analizAdi);
                    }
                }

                const matchesSiklik = matches(item.siklikOrani?.toString(), filterConfigs.siklik);

                return matchesUlke && matchesUrunSinif && matchesUrunSinifAdi && matchesUrunAdi && matchesGtip && matchesAnalizAdi && matchesSiklik;
            } else if (currentPageType === 'urunTanimlama') {
                const matchesGtip = matches(item.gtip, filterConfigs.gtip);
                const matchesUrunAdi = matches(item.urunAdi, filterConfigs.urunAdi);
                const matchesUrunSinif = matches(item.urunSinifi, filterConfigs.urunSinif);
                const matchesUrunSinifAdi = matches(item.urunSinifAdi, filterConfigs.urunSinifAdi);

                return matchesGtip && matchesUrunAdi && matchesUrunSinif && matchesUrunSinifAdi;
            } else if (currentPageType === 'antrepo') {
                const matchesAd = matches(item.ad, filterConfigs.antrepoAd);
                const matchesKodu = matches(item.antrepoKodu, filterConfigs.antrepoKodu);
                const matchesBolge = matches(item.bolgeAd, filterConfigs.antrepoBolgeAd);
                const matchesTip = matches(item.antrepoTipi, filterConfigs.antrepoTip);
                const matchesIp = matches(item.ip, filterConfigs.antrepoIp);
                const matchesInsertedBy = matches(item.insertedBy, filterConfigs.antrepoInsertedBy);

                return matchesAd && matchesKodu && matchesBolge && matchesTip && matchesIp && matchesInsertedBy;
            } else if (currentPageType === 'urunSinifi') {
                const matchesSinifKodu = matches(item.sinifKodu, filterConfigs.urunSinifiKodu);
                const matchesSinifAdi = matches(item.sinifAdi, filterConfigs.urunSinifiAdi);
                const matchesInsertedBy = matches(item.insertedBy, filterConfigs.urunSinifiInsertedBy);

                return matchesSinifKodu && matchesSinifAdi && matchesInsertedBy;
            } else {
                const matchesAnalizAdi = matches(item.analizAdi, filterConfigs.analizAdi);
                const matchesUstBaslik = matches(item.analizUstBasligi, filterConfigs.ustBaslik);

                return matchesAnalizAdi && matchesUstBaslik;
            }
        });

        window.currentPage = 1;
        selectedRows.clear();
        window.renderTable();
    }

    // Excel'e Aktar
    window.exportToExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert('Excel kütüphanesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
            return;
        }

        if (filteredData.length === 0) {
            alert('Dışarı aktarılacak veri bulunamadı.');
            return;
        }

        let exportData = [];
        let fileName = 'timos_export.xlsx';

        if (currentPageType === 'siklik') {
            fileName = 'analiz_siklik_listesi.xlsx';
            exportData = filteredData.map(item => ({
                'Ülke': item.ulke || '-',
                'Ürün Sınıf Kodu': item.urunSinifKodu || '-',
                'Ürün Sınıf Adı': item.urunSinifAdi || '-',
                'Ürün Adı': item.urunAdi || '-',
                'GTIP': item.gtip || '-',
                'Analizler': expandedView ? (item.analizAdi || '-') : (item.analizlerStr || '-'),
                'Sıklık Oranı (%)': item.siklikOrani || 0
            }));
        } else if (currentPageType === 'urunTanimlama') {
            fileName = 'urun_tanimlama_listesi.xlsx';
            exportData = filteredData.map(item => ({
                'ID': item.id || '-',
                'GTIP': item.gtip || '-',
                'Ürün Adı': item.urunAdi || '-',
                'Ürün Sınıf Kodu': item.urunSinifi || '-',
                'Ürün Sınıf Adı': item.urunSinifAdi || '-'
            }));
        } else if (currentPageType === 'antrepo') {
            fileName = 'antrepo_listesi.xlsx';
            exportData = filteredData.map(item => ({
                'ID': item.id || '-',
                'Antrepo Adı': item.ad || '-',
                'Kod': item.antrepoKodu || '-',
                'Bölge': item.bolgeAd || '-',
                'Tip': item.antrepoTipi || '-',
                'IP': item.ip || '-',
                'Durum': item.isActive ? 'Aktif' : 'Pasif',
                'Ekleyen': item.insertedBy || '-',
                'Ekleme': item.insertTime ? new Date(item.insertTime).toLocaleString() : '-',
                'Güncelleyen': item.updatedBy || '-',
                'Güncelleme': item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'
            }));
        } else if (currentPageType === 'urunSinifi') {
            fileName = 'urun_sinifi_listesi.xlsx';
            exportData = filteredData.map(item => ({
                'ID': item.id || '-',
                'Sınıf Kodu': item.sinifKodu || '-',
                'Sınıf Adı': item.sinifAdi || '-',
                'Ekleyen': item.insertedBy || '-',
                'Ekleme': item.insertTime ? new Date(item.insertTime).toLocaleString() : '-',
                'Güncelleyen': item.updatedBy || '-',
                'Güncelleme': item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'
            }));
        } else {
            fileName = 'analiz_tanimlama_listesi.xlsx';
            exportData = filteredData.map(item => ({
                'ID': item.id || '-',
                'Analiz Adı': item.analizAdi || '-',
                'Üst Başlık': item.analizUstBasligi || '-'
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Veriler");

        // Sütun genişliklerini ayarla
        const wscols = Object.keys(exportData[0]).map(key => ({
            wch: Math.max(key.length, ...exportData.map(item => (item[key] ? item[key].toString().length : 0))) + 2
        }));
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, fileName);
    };

    // Sıralama
    window.sortData = function (column) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }

        filteredData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        window.renderTable();
    };

    // Satır seçimi
    window.toggleRowSelection = function (id) {
        if (selectedRows.has(id)) {
            selectedRows.delete(id);
        } else {
            selectedRows.add(id);
        }
        updateBulkActions();
        updateCheckboxStates();
    };

    // Tümünü seç/kaldır
    window.toggleSelectAll = function () {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const startIndex = (window.currentPage - 1) * window.rowsPerPage;
        const endIndex = startIndex + window.rowsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        if (selectAllCheckbox.checked) {
            pageData.forEach(item => selectedRows.add(item._uniqueId));
        } else {
            pageData.forEach(item => selectedRows.delete(item._uniqueId));
        }

        updateBulkActions();
        window.renderTable();
    };

    // Toplu işlem butonlarını güncelle
    function updateBulkActions() {
        const bulkActionsDiv = document.getElementById('bulkActions');
        const bulkInfo = document.getElementById('bulkInfo');

        if (bulkActionsDiv && bulkInfo) {
            if (selectedRows.size > 0) {
                bulkActionsDiv.classList.add('active');
                bulkInfo.textContent = `${selectedRows.size} kayıt seçildi`;
            } else {
                bulkActionsDiv.classList.remove('active');
            }
        }
    }

    // Checkbox durumlarını güncelle
    function updateCheckboxStates() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => {
            const id = cb.dataset.id;
            cb.checked = selectedRows.has(id);
        });

        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            const startIndex = (window.currentPage - 1) * window.rowsPerPage;
            const endIndex = startIndex + window.rowsPerPage;
            const pageData = filteredData.slice(startIndex, endIndex);
            const allPageSelected = pageData.length > 0 && pageData.every(item => selectedRows.has(item._uniqueId));
            selectAllCheckbox.checked = allPageSelected;
        }
    }

    // Tek satır sil
    window.deleteRow = async function (id) {
        if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
            return;
        }

        const item = allData.find(i => i._uniqueId === id.toString() || i.id === id);
        if (!item) {
            alert('Kayıt bulunamadı!');
            return;
        }

        try {
            let result;
            if (currentPageType === 'siklik') {
                result = await deleteSiklikItems([{
                    id: item._originalId || item.id,
                    urunSinifKodu: item.urunSinifKodu,
                    gtip: item.gtip,
                    ulke: item.ulke,
                    siklikOrani: item.siklikOrani,
                    urunAdi: item.urunAdi,
                    analizler: item.analizler || []
                }]);
            } else if (currentPageType === 'urunTanimlama') {
                result = await deleteUrunItems([item]);
            } else if (currentPageType === 'antrepo') {
                result = await deleteAntrepoItems([item]);
            } else if (currentPageType === 'urunSinifi') {
                result = await deleteUrunSinifiItems([item]);
            } else {
                result = await deleteAnalizItems([item]);
            }

            if (result.deleted > 0) {
                alert('Kayıt başarıyla silindi!');
                await fetchData();
                window.renderTable();
            } else {
                alert('Kayıt silinemedi!');
            }
        } catch (error) {
            alert('Silme işlemi başarısız: ' + error.message);
        }
    };

    // Tek satır düzenle
    window.editRow = async function (id) {
        const item = allData.find(i => i._uniqueId === id.toString() || i.id === id);
        if (!item) {
            alert('Kayıt bulunamadı!');
            return;
        }

        // Düzenleme modalı oluştur
        let modal;
        if (currentPageType === 'siklik') {
            modal = createEditSiklikModal(item);
        } else if (currentPageType === 'urunTanimlama') {
            modal = createEditUrunModal(item);
        } else if (currentPageType === 'antrepo') {
            modal = createEditAntrepoModal(item);
        } else if (currentPageType === 'urunSinifi') {
            modal = createEditUrunSinifiModal(item);
        } else {
            modal = createEditAnalizModal(item);
        }
        document.body.appendChild(modal);
    };

    // Düzenleme modalı oluştur (Sıklık)
    function createEditSiklikModal(item) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">📝 Analiz Kaydını Düzenle</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Ürün Sınıf Kodu</label>
                <input type="text" id="editUrunSinifKodu" value="${item.urunSinifKodu || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;" readonly>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">GTIP</label>
                <input type="text" id="editGtip" value="${item.gtip || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Ülke</label>
                <input type="text" id="editUlke" value="${item.ulke || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Sıklık Oranı (%)</label>
                <input type="number" id="editSiklikOrani" value="${item.siklikOrani || 0}" min="0" max="100"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Analizler</label>
                <div style="font-size: 13px; color: #666; margin-bottom: 10px;">
                    Şu anda: ${item.analizler && item.analizler.length > 0 ? item.analizler.map(a => a.analizAdi).join(', ') : 'Yok'}
                </div>
                <div style="font-size: 12px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    ℹ️ Analizler şu anda düzenlenemiyor. Sadece temel bilgiler güncellenebilir.
                </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button id="editCancelBtn" class="btn btn-secondary" style="padding: 10px 20px;">İptal</button>
                <button id="editSaveBtn" class="btn btn-success" style="padding: 10px 20px;">💾 Kaydet</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);

        // İptal butonu
        modalContent.querySelector('#editCancelBtn').onclick = () => {
            modalOverlay.remove();
        };

        // Kaydet butonu
        modalContent.querySelector('#editSaveBtn').onclick = async () => {
            const saveBtn = modalContent.querySelector('#editSaveBtn');
            const originalText = saveBtn.textContent;
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ Kaydediliyor...';

            try {
                const updatedItem = {
                    id: item._originalId || item.id,
                    urunSinifKodu: item.urunSinifKodu, // readonly
                    gtip: document.getElementById('editGtip').value,
                    ulke: document.getElementById('editUlke').value,
                    siklikOrani: parseInt(document.getElementById('editSiklikOrani').value) || 0,
                    urunAdi: item.urunAdi,
                    analizler: item.analizler || []
                };

                const token = getAuthToken();
                const response = await fetch('https://timosapi.tasar.com.tr/api/as/UpdateAS', {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedItem),
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('✅ Kayıt başarıyla güncellendi!');
                    modalOverlay.remove();
                    await fetchData();
                    window.renderTable();
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                alert('❌ Güncelleme başarısız: ' + error.message);
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }
        };

        // Overlay'e tıklanınca kapat
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        };

        return modalOverlay;
    }

    // Düzenleme modalı oluştur (Ürün Tanımlama)
    function createEditUrunModal(item, isNew = false) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';

        // Ürün Sınıfı arama kabiliyeti için yardımcı fonksiyonlar
        let selectedSinifKod = item.urunSinifi || '';
        let selectedSinifAd = item.urunSinifAdi || urunSinifMap[item.urunSinifi] || '';

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">${isNew ? '📦 Yeni Ürün Ekle' : '📝 Ürün Bilgilerini Düzenle'}</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">GTIP</label>
                <input type="text" id="editGtip" value="${item.gtip || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Ürün Adı</label>
                <input type="text" id="editUrunAdi" value="${item.urunAdi || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px; position: relative;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Ürün Sınıfı (Ara: Kod veya Ad)</label>
                <input type="text" id="editUrunSinifiSearch" value="${selectedSinifAd ? `${selectedSinifAd} (${selectedSinifKod})` : ''}"
                       placeholder="Sınıf ara..."
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;"
                       autocomplete="off">
                <input type="hidden" id="editUrunSinifi" value="${selectedSinifKod}">
                <div id="sinifSearchResults" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 0 0 5px 5px;"></div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button id="editCancelBtn" class="btn btn-secondary" style="padding: 10px 20px;">İptal</button>
                <button id="editSaveBtn" class="btn btn-success" style="padding: 10px 20px;">💾 ${isNew ? 'Ekle' : 'Kaydet'}</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);

        // Arama işlevselliği
        const searchInput = modalContent.querySelector('#editUrunSinifiSearch');
        const hiddenInput = modalContent.querySelector('#editUrunSinifi');
        const resultsDiv = modalContent.querySelector('#sinifSearchResults');

        searchInput.oninput = function () {
            const query = this.value.toLowerCase().trim();
            if (!query) {
                resultsDiv.style.display = 'none';
                return;
            }

            const matches = Object.entries(urunSinifMap).filter(([kod, ad]) =>
                kod.toLowerCase().includes(query) || ad.toLowerCase().includes(query)
            ).slice(0, 50);

            if (matches.length > 0) {
                resultsDiv.innerHTML = matches.map(([kod, ad]) => `
                    <div class="sinif-option" data-kod="${kod}" data-ad="${ad}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; font-size: 13px;">
                        <strong>${kod}</strong> - ${ad}
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';

                resultsDiv.querySelectorAll('.sinif-option').forEach(opt => {
                    opt.onmouseover = function () { this.style.background = '#f0f4ff'; };
                    opt.onmouseout = function () { this.style.background = 'white'; };
                    opt.onclick = function () {
                        const kod = this.dataset.kod;
                        const ad = this.dataset.ad;
                        searchInput.value = `${ad} (${kod})`;
                        hiddenInput.value = kod;
                        resultsDiv.style.display = 'none';
                    };
                });
            } else {
                resultsDiv.innerHTML = '<div style="padding: 10px; color: #999;">Sonuç bulunamadı</div>';
                resultsDiv.style.display = 'block';
            }
        };

        // Dışarı tıklayınca sonuçları kapat
        document.addEventListener('click', function (e) {
            if (e.target !== searchInput && e.target !== resultsDiv) {
                resultsDiv.style.display = 'none';
            }
        });

        modalContent.querySelector('#editCancelBtn').onclick = () => modalOverlay.remove();

        modalContent.querySelector('#editSaveBtn').onclick = async () => {
            const saveBtn = modalContent.querySelector('#editSaveBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ İşlem yapılıyor...';

            try {
                const payload = {
                    id: item._originalId || item.id || 0,
                    gtip: document.getElementById('editGtip').value,
                    urunAdi: document.getElementById('editUrunAdi').value,
                    urunSinifi: document.getElementById('editUrunSinifi').value,
                    insertedBy: item.insertedBy || 'System',
                    insertTime: item.insertTime || new Date().toISOString()
                };

                const token = getAuthToken();
                const url = isNew ? 'https://timosapi.tasar.com.tr/api/urun' : 'https://timosapi.tasar.com.tr/api/urun/UpdateUrun';
                const method = isNew ? 'POST' : 'PUT';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert(`✅ Ürün başarıyla ${isNew ? 'eklendi' : 'güncellendi'}!`);
                    modalOverlay.remove();
                    await fetchData();
                    window.renderTable();
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                alert('❌ İşlem başarısız: ' + error.message);
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 Kaydet';
            }
        };

        return modalOverlay;
    }

    // Düzenleme modalı oluştur (Analiz Tanımlama)
    function createEditAnalizModal(item, isNew = false) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">${isNew ? '🧪 Yeni Analiz Ekle' : '📝 Analiz Tanımlamasını Düzenle'}</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Analiz Adı</label>
                <input type="text" id="editAnalizAdi" value="${item.analizAdi || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Analiz Üst Başlığı</label>
                <input type="text" id="editAnalizUstBasligi" value="${item.analizUstBasligi || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="editIsActive" ${item.isActive !== false ? 'checked' : ''} style="width: 20px; height: 20px;">
                <label style="font-weight: 600;">Aktif</label>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button id="editCancelBtn" class="btn btn-secondary" style="padding: 10px 20px;">İptal</button>
                <button id="editSaveBtn" class="btn btn-success" style="padding: 10px 20px;">💾 ${isNew ? 'Ekle' : 'Kaydet'}</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);

        modalContent.querySelector('#editCancelBtn').onclick = () => modalOverlay.remove();

        modalContent.querySelector('#editSaveBtn').onclick = async () => {
            const saveBtn = modalContent.querySelector('#editSaveBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ İşlem yapılıyor...';

            try {
                // Sadece gerekli alanları gönder (Fazla alanlar API hatasına sebep olabilir)
                const payload = {
                    id: item._originalId || item.id || 0,
                    analizAdi: document.getElementById('editAnalizAdi').value,
                    analizUstBasligi: document.getElementById('editAnalizUstBasligi').value,
                    isActive: document.getElementById('editIsActive').checked
                };

                const token = getAuthToken();
                const url = isNew ? 'https://timosapi.tasar.com.tr/api/analiz/InsertAnaliz' : 'https://timosapi.tasar.com.tr/api/analiz/UpdateAnaliz';
                const method = isNew ? 'POST' : 'PUT';

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    mode: 'cors',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert(`✅ Analiz başarıyla ${isNew ? 'eklendi' : 'güncellendi'}!`);
                    modalOverlay.remove();
                    await fetchData();
                    window.renderTable();
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                alert('❌ İşlem başarısız: ' + error.message);
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 Kaydet';
            }
        };

        return modalOverlay;
    }

    function createEditAntrepoModal(item) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';

        // Bölge seçeneklerini oluştur
        const bolgeOptions = Object.entries(antrepoBolgeMap)
            .map(([id, ad]) => `<option value="${id}" ${item.bolgeId == id ? 'selected' : ''}>${ad}</option>`)
            .join('');

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">🏠 Antrepo Düzenle</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Antrepo Adı</label>
                <input type="text" id="editAntrepoAd" value="${item.ad || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Bölge</label>
                <select id="editAntrepoBolge" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    <option value="">Seçiniz...</option>
                    ${bolgeOptions}
                </select>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Antrepo Kodu</label>
                <input type="text" id="editAntrepoKodu" value="${item.antrepoKodu || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Antrepo Tipi</label>
                <input type="text" id="editAntrepoTipi" value="${item.antrepoTipi || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button id="editCancelBtn" class="btn btn-secondary" style="padding: 10px 20px;">İptal</button>
                <button id="editSaveBtn" class="btn btn-success" style="padding: 10px 20px;">💾 Kaydet</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);

        modalContent.querySelector('#editCancelBtn').onclick = () => modalOverlay.remove();

        modalContent.querySelector('#editSaveBtn').onclick = async () => {
            const saveBtn = modalContent.querySelector('#editSaveBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ Kaydediliyor...';

            try {
                const payload = {
                    id: item.id,
                    ad: document.getElementById('editAntrepoAd').value,
                    bolgeId: parseInt(document.getElementById('editAntrepoBolge').value) || item.bolgeId,
                    antrepoKodu: document.getElementById('editAntrepoKodu').value,
                    antrepoTipi: document.getElementById('editAntrepoTipi').value
                };

                await updateAntrepo(payload);

                alert('✅ Antrepo başarıyla güncellendi!');
                modalOverlay.remove();
                await fetchData();
                window.renderTable();
            } catch (error) {
                alert('❌ Güncelleme başarısız: ' + error.message);
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 Kaydet';
            }
        };

        return modalOverlay;
    }

    // Düzenleme modalı oluştur (Ürün Sınıfı)
    function createEditUrunSinifiModal(item, isNew = false) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;';

        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">${isNew ? '🏷️ Yeni Ürün Sınıfı Ekle' : '📝 Ürün Sınıfı Düzenle'}</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Sınıf Kodu</label>
                <input type="text" id="editSinifKodu" value="${item.sinifKodu || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-weight: 600; margin-bottom: 5px;">Sınıf Adı</label>
                <input type="text" id="editSinifAdi" value="${item.sinifAdi || ''}"
                       style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                <button id="editCancelBtn" class="btn btn-secondary" style="padding: 10px 20px;">İptal</button>
                <button id="editSaveBtn" class="btn btn-success" style="padding: 10px 20px;">💾 ${isNew ? 'Ekle' : 'Kaydet'}</button>
            </div>
        `;

        modalOverlay.appendChild(modalContent);

        modalContent.querySelector('#editCancelBtn').onclick = () => modalOverlay.remove();

        modalContent.querySelector('#editSaveBtn').onclick = async () => {
            const saveBtn = modalContent.querySelector('#editSaveBtn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ İşlem yapılıyor...';

            try {
                const payload = {
                    id: item.id || 0,
                    sinifKodu: document.getElementById('editSinifKodu').value,
                    sinifAdi: document.getElementById('editSinifAdi').value,
                    insertedBy: item.insertedBy || 'admin',
                    insertTime: item.insertTime || new Date().toISOString(),
                    updatedBy: 'admin',
                    updateTime: new Date().toISOString(),
                    ip: item.ip || '127.0.0.1'
                };

                if (isNew) {
                    // Yeni ekle — POST olarak tahmin ediyoruz
                    const token = getAuthToken();
                    const response = await fetch('https://timosapi.tasar.com.tr/api/urunsinifi/InsertUrunSinifi', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Authorization': token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                        mode: 'cors',
                        credentials: 'include'
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                } else {
                    await updateUrunSinifi(payload);
                }

                alert(`✅ Ürün sınıfı başarıyla ${isNew ? 'eklendi' : 'güncellendi'}!`);
                modalOverlay.remove();
                await fetchData();
                window.renderTable();
            } catch (error) {
                alert('❌ İşlem başarısız: ' + error.message);
                saveBtn.disabled = false;
                saveBtn.textContent = '💾 Kaydet';
            }
        };

        return modalOverlay;
    }

    // Yeni Kayıt Ekle
    window.addNewRecord = function () {
        if (currentPageType === 'siklik') {
            alert('Sıklık sayfası için Yeni Ekle henüz aktif değil.');
        } else if (currentPageType === 'urunTanimlama') {
            const modal = createEditUrunModal({
                id: 0,
                gtip: '',
                urunAdi: '',
                urunSinifi: ''
            }, true);
            document.body.appendChild(modal);
        } else if (currentPageType === 'antrepo') {
            alert('Antrepo ekleme işlemi henüz desteklenmiyor.');
        } else if (currentPageType === 'urunSinifi') {
            const modal = createEditUrunSinifiModal({
                id: 0,
                sinifKodu: '',
                sinifAdi: ''
            }, true);
            document.body.appendChild(modal);
        } else {
            const modal = createEditAnalizModal({
                id: 0,
                analizAdi: '',
                analizUstBasligi: '',
                isActive: true
            }, true);
            document.body.appendChild(modal);
        }
    };

    // Seçilenleri sil
    window.deleteSelected = async function () {
        if (selectedRows.size === 0) {
            alert('Lütfen silinecek kayıtları seçin!');
            return;
        }

        const itemsToDelete = [];
        const selectedIds = new Set();

        selectedRows.forEach(uniqueId => {
            const item = allData.find(i => i._uniqueId === uniqueId);
            if (item) {
                const originalId = item._originalId || item.id;
                if (!selectedIds.has(originalId)) {
                    selectedIds.add(originalId);
                    if (currentPageType === 'siklik') {
                        itemsToDelete.push({
                            id: originalId,
                            urunSinifKodu: item.urunSinifKodu,
                            gtip: item.gtip,
                            ulke: item.ulke,
                            siklikOrani: item.siklikOrani,
                            urunAdi: item.urunAdi,
                            analizler: item.analizler || []
                        });
                    } else {
                        itemsToDelete.push(item);
                    }
                }
            }
        });

        if (!confirm(`${itemsToDelete.length} kayıt silinecek. Emin misiniz?`)) {
            return;
        }

        const deleteBtn = document.getElementById('deleteSelectedBtn');
        const originalText = deleteBtn.textContent;

        try {
            deleteBtn.disabled = true;

            let deleteFunc;
            if (currentPageType === 'siklik') {
                deleteFunc = deleteSiklikItems;
            } else if (currentPageType === 'urunTanimlama') {
                deleteFunc = deleteUrunItems;
            } else if (currentPageType === 'antrepo') {
                deleteFunc = deleteAntrepoItems;
            } else if (currentPageType === 'urunSinifi') {
                deleteFunc = deleteUrunSinifiItems;
            } else {
                deleteFunc = deleteAnalizItems;
            }

            const result = await deleteFunc(itemsToDelete, (current, total) => {
                deleteBtn.textContent = `Siliniyor... (${current}/${total})`;
            });

            alert(`İşlem tamamlandı!\n\nSilinen: ${result.deleted}\nBaşarısız: ${result.failed}`);

            selectedRows.clear();
            await fetchData();
            window.renderTable();

        } catch (error) {
            alert('Silme işlemi başarısız: ' + error.message);
        } finally {
            deleteBtn.disabled = false;
            deleteBtn.textContent = originalText;
        }
    };

    // Tablo render
    window.renderTable = function () {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const startIndex = (window.currentPage - 1) * window.rowsPerPage;
        const endIndex = startIndex + window.rowsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);

        if (currentPageType === 'siklik') {
            if (expandedView) {
                // Genişletilmiş görünüm: Her analiz ayrı satır
                tableBody.innerHTML = pageData.map(item => `
                    <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                        <td class="checkbox-cell">
                            <input type="checkbox"
                                   class="row-checkbox"
                                   data-id="${item._uniqueId}"
                                   ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                                   onclick="window.toggleRowSelection('${item._uniqueId}')">
                        </td>
                        <td style="font-family: monospace; font-size: 12px; font-weight: 600;">${item.urunSinifKodu || '-'}</td>
                        <td>${item.gtip === 'Tüm Ürünler' || !item.gtip ? '<span style="color: #666;">Tüm Ürünler</span>' : item.gtip}</td>
                        <td>${item.ulke || '-'}</td>
                        <td><span style="background: white; border: 1px solid #e0e0e0; padding: 4px 10px; border-radius: 4px; font-weight: 600;">${item.siklikOrani !== null && item.siklikOrani !== undefined ? item.siklikOrani : '-'}</span></td>
                        <td><span class="analiz-badge">${item.analizAdi || '-'}</span></td>
                        <td>
                            <div class="action-buttons-row">
                                <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                                <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                // Kompakt görünüm: Analizler badges
                tableBody.innerHTML = pageData.map(item => `
                    <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                        <td class="checkbox-cell">
                            <input type="checkbox"
                                   class="row-checkbox"
                                   data-id="${item._uniqueId}"
                                   ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                                   onclick="window.toggleRowSelection('${item._uniqueId}')">
                        </td>
                        <td style="font-family: monospace; font-size: 12px; font-weight: 600;">${item.urunSinifKodu || '-'}</td>
                        <td>${item.gtip === 'Tüm Ürünler' || !item.gtip ? '<span style="color: #666;">Tüm Ürünler</span>' : item.gtip}</td>
                        <td>${item.ulke || '-'}</td>
                        <td><span style="background: white; border: 1px solid #e0e0e0; padding: 4px 10px; border-radius: 4px; font-weight: 600;">${item.siklikOrani !== null && item.siklikOrani !== undefined ? item.siklikOrani : '-'}</span></td>
                        <td style="max-width: 450px; white-space: normal; line-height: 1.6;">
                            ${(item.analizler || []).map(a => `<span class="analiz-badge">${a.analizAdi || a}</span>`).join('') || '-'}
                        </td>
                        <td>
                            <div class="action-buttons-row">
                                <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                                <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } else if (currentPageType === 'urunTanimlama') {
            // Ürün Tanımlama görünümü
            tableBody.innerHTML = pageData.map(item => `
                <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                    <td class="checkbox-cell">
                        <input type="checkbox"
                               class="row-checkbox"
                               data-id="${item._uniqueId}"
                               ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                               onclick="window.toggleRowSelection('${item._uniqueId}')">
                    </td>
                    <td>${item.id || '-'}</td>
                    <td><strong style="color: #667eea;">${item.gtip || '-'}</strong></td>
                    <td>${item.urunAdi || '-'}</td>
                    <td><span title="${item.urunSinifi || ''}">${item.urunSinifAdi || item.urunSinifi || '-'}</span></td>
                    <td>${item.insertedBy || '-'}</td>
                    <td>${item.insertTime ? new Date(item.insertTime).toLocaleString() : '-'}</td>
                    <td>${item.updatedBy || '-'}</td>
                    <td>${item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'}</td>
                    <td>
                        <div class="action-buttons-row">
                             <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                             <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else if (currentPageType === 'antrepo') {
            // Antrepo görünümü
            tableBody.innerHTML = pageData.map(item => `
                <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                    <td class="checkbox-cell">
                        <input type="checkbox"
                               class="row-checkbox"
                               data-id="${item._uniqueId}"
                               ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                               onclick="window.toggleRowSelection('${item._uniqueId}')">
                    </td>
                    <td>${item.id || '-'}</td>
                    <td><strong>${item.ad || '-'}</strong></td>
                    <td style="font-family: monospace;">${item.antrepoKodu || '-'}</td>
                    <td>${item.bolgeAd || '-'}</td>
                    <td>${item.antrepoTipi || '-'}</td>
                    <td>${item.ip || '-'}</td>
                    <td><span class="status-badge ${item.isActive ? 'active' : 'inactive'}">${item.isActive ? 'Aktif' : 'Pasif'}</span></td>
                    <td>${item.insertedBy || '-'}</td>
                    <td>${item.insertTime ? new Date(item.insertTime).toLocaleString() : '-'}</td>
                    <td>${item.updatedBy || '-'}</td>
                    <td>${item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'}</td>
                    <td>
                        <div class="action-buttons-row">
                             <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                             <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else if (currentPageType === 'urunSinifi') {
            // Ürün Sınıfı görünümü
            tableBody.innerHTML = pageData.map(item => `
                <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                    <td class="checkbox-cell">
                        <input type="checkbox"
                               class="row-checkbox"
                               data-id="${item._uniqueId}"
                               ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                               onclick="window.toggleRowSelection('${item._uniqueId}')">
                    </td>
                    <td>${item.id || '-'}</td>
                    <td style="font-family: monospace; font-weight: 600;"><strong style="color: #667eea;">${item.sinifKodu || '-'}</strong></td>
                    <td>${item.sinifAdi || '-'}</td>
                    <td>${item.insertedBy || '-'}</td>
                    <td>${item.insertTime ? new Date(item.insertTime).toLocaleString() : '-'}</td>
                    <td>${item.updatedBy || '-'}</td>
                    <td>${item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'}</td>
                    <td>
                        <div class="action-buttons-row">
                             <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                             <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            // Analiz Tanımlama görünümü
            tableBody.innerHTML = pageData.map(item => `
                <tr class="${selectedRows.has(item._uniqueId) ? 'selected' : ''}">
                    <td class="checkbox-cell">
                        <input type="checkbox"
                               class="row-checkbox"
                               data-id="${item._uniqueId}"
                               ${selectedRows.has(item._uniqueId) ? 'checked' : ''}
                               onclick="window.toggleRowSelection('${item._uniqueId}')">
                    </td>
                    <td>${item.id || '-'}</td>
                    <td><strong style="color: #667eea;">${item.analizAdi || '-'}</strong></td>
                    <td>${item.analizUstBasligi || '-'}</td>
                    <td>${item.insertedBy || '-'}</td>
                    <td>${item.insertTime ? new Date(item.insertTime).toLocaleString() : '-'}</td>
                    <td>${item.updatedBy || '-'}</td>
                    <td>${item.updateTime ? new Date(item.updateTime).toLocaleString() : '-'}</td>
                    <td><span style="color: ${item.isActive ? '#28a745' : '#dc3545'}; font-weight: bold;">${item.isActive ? 'Aktif' : 'Pasif'}</span></td>
                    <td>
                        <div class="action-buttons-row">
                             <button class="btn btn-edit-row" onclick='window.editRow("${item._uniqueId}")' title="Düzenle">✏️</button>
                             <button class="btn btn-delete-row" onclick='window.deleteRow("${item._uniqueId}")' title="Sil">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // İstatistikler güncelle
        const recordCountText = `${filteredData.length} kayıt`;
        document.getElementById('headerRecordCount').textContent = recordCountText;
        document.getElementById('totalRecords').textContent = `Toplam: ${filteredData.length}`;
        document.getElementById('showingRecords').textContent =
            `Gösterilen: ${startIndex + 1}-${Math.min(endIndex, filteredData.length)}`;

        // Sayfalama güncelle
        renderPagination();

        // Sıralama işaretlerini güncelle
        document.querySelectorAll('.custom-table th.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.column === sortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        // Checkbox durumlarını güncelle
        updateCheckboxStates();
        updateBulkActions();
    };

    // Tabloyu kapat
    window.closeTable = function () {
        const container = document.getElementById('customSiklikTableContainer');
        if (container) {
            container.style.display = 'none';
        }
        document.documentElement.classList.remove('modal-open');
    };

    // Sayfalama
    function renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(filteredData.length / window.rowsPerPage);

        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= window.currentPage - 2 && i <= window.currentPage + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        pagination.innerHTML = `
            <button class="page-btn" ${window.currentPage === 1 ? 'disabled' : ''} onclick="window.goToPage(${window.currentPage - 1})">
                ← Önceki
            </button>
            ${pages.map(page => {
            if (page === '...') {
                return '<span class="page-info">...</span>';
            }
            return `<button class="page-btn ${page === window.currentPage ? 'active' : ''}"
                        onclick="window.goToPage(${page})">${page}</button>`;
        }).join('')}
            <button class="page-btn" ${window.currentPage === totalPages ? 'disabled' : ''} onclick="window.goToPage(${window.currentPage + 1})">
                Sonraki →
            </button>
        `;
    }

    // Sayfa değiştirme
    window.goToPage = function (page) {
        window.currentPage = page;
        window.renderTable();
        document.querySelector('.table-wrapper')?.scrollTo(0, 0);
    };

    // Filtreleri temizle
    window.clearFilters = function () {
        const filters = [
            'filterUlke', 'filterUrunSinif', 'filterUrunSinifAdi',
            'filterUrunAdi', 'filterGtip', 'filterAnalizAdi',
            'filterSiklik', 'filterUstBaslik',
            'filterAntrepoAd', 'filterAntrepoKodu', 'filterAntrepoBolgeAd',
            'filterAntrepoTip', 'filterAntrepoIp', 'filterAntrepoInsertedBy',
            'filterUrunSinifiKodu', 'filterUrunSinifiAdi', 'filterUrunSinifiInsertedBy'
        ];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
            const modeEl = document.getElementById(id + 'Mode');
            if (modeEl) modeEl.value = 'contains';
        });
        applyFilters();
    };

    // Ana tabloyu oluştur
    function createTable() {
        document.documentElement.classList.add('modal-open');
        const currentUrl = window.location.href;
        const isSiklik = currentUrl.includes('analizSiklikGiris');
        const isUrun = currentUrl.includes('urunTanimlama') && !currentUrl.includes('urunSinifiTanimlama');
        const isAntrepo = currentUrl.includes('/main2/antrepo');
        const isUrunSinifi = currentUrl.includes('urunSinifiTanimlama');

        let title = '📊 Analiz Sıklık Tanımlamaları';
        if (isUrunSinifi) title = '🏷️ Ürün Sınıfı Tanımlama';
        else if (isUrun) title = '📦 Ürün Tanımlama (Full Liste)';
        else if (isAntrepo) title = '🏠 Antrepo Listesi';
        else if (!isSiklik) title = '🧪 Analiz Tanımlama (Full Liste)';

        // Eğer tablo zaten varsa göster, ama sayfa tipi değiştiyse yeniden oluştur
        const existingTable = document.getElementById('customSiklikTableContainer');
        if (existingTable) {
            const existingTitle = existingTable.querySelector('.header-title')?.textContent.trim().split('\n')[0];
            if (existingTitle && title.includes(existingTitle)) {
                existingTable.style.display = 'block';
                return;
            } else {
                // Sayfa tipi değişmiş, eskiyi temizle
                existingTable.remove();
                allData = [];
                filteredData = [];
                selectedRows.clear();
            }
        }

        const getFilterHTML = (id, label, placeholder) => `
            <div class="filter-group">
                <div class="filter-group-header">
                    <label class="filter-label">${label}</label>
                    <select class="filter-mode-select" id="${id}Mode" onchange="window.applyFilters()">
                        <option value="contains" selected>İçerir</option>
                        <option value="starts">İle Başlar</option>
                        <option value="equals">Eşittir</option>
                    </select>
                </div>
                <input type="text" id="${id}" class="filter-input" placeholder="${placeholder}" oninput="window.applyFilters()">
            </div>
        `;

        const container = document.createElement('div');
        container.id = 'customSiklikTableContainer';
        container.innerHTML = `
            <div style="max-width: 1600px; margin: 0 auto;">
                <div class="table-header">
                    <div class="header-title">
                        ${isSiklik ? 'Analiz Verileri' : (isUrunSinifi ? 'Ürün Sınıfı Tanımlama' : (isUrun ? 'Ürün Tanımlama' : (isAntrepo ? 'Antrepo Listesi' : 'Analiz Tanımlama')))}
                        <span id="headerRecordCount" class="stats-badge">0 kayıt</span>
                    </div>
                    <button class="close-btn" onclick="window.closeTable()">✖</button>
                </div>

                <div class="filter-section">
                    ${isSiklik ? `
                        ${getFilterHTML('filterUlke', 'Ülke', 'Ülke ara...')}
                        ${getFilterHTML('filterUrunSinif', 'Ürün Sınıf Kodu', 'Kod ara...')}
                        ${getFilterHTML('filterUrunSinifAdi', 'Ürün Sınıf Adı', 'Sınıf adı ara...')}
                        ${getFilterHTML('filterUrunAdi', 'Ürün Adı', 'Ürün ara...')}
                        ${getFilterHTML('filterGtip', 'GTIP', 'GTIP ara...')}
                    ` : (isAntrepo ? `
                        ${getFilterHTML('filterAntrepoAd', 'Antrepo Adı', 'Ad ara...')}
                        ${getFilterHTML('filterAntrepoKodu', 'Antrepo Kodu', 'Kod ara...')}
                        ${getFilterHTML('filterAntrepoBolgeAd', 'Bölge Adı', 'Bölge ara...')}
                        ${getFilterHTML('filterAntrepoTip', 'Tip', 'Tip ara...')}
                    ` : (isUrunSinifi ? `
                        ${getFilterHTML('filterUrunSinifiKodu', 'Sınıf Kodu', 'Kod ara...')}
                        ${getFilterHTML('filterUrunSinifiAdi', 'Sınıf Adı', 'Ad ara...')}
                        ${getFilterHTML('filterUrunSinifiInsertedBy', 'Ekleyen', 'Kullanıcı ara...')}
                    ` : (isUrun ? `
                        ${getFilterHTML('filterGtip', 'GTIP', 'GTIP ara...')}
                        ${getFilterHTML('filterUrunAdi', 'Ürün Adı', 'Ürün ara...')}
                        ${getFilterHTML('filterUrunSinif', 'Ürün Sınıfı', 'Sınıf kodu ara...')}
                        ${getFilterHTML('filterUrunSinifAdi', 'Ürün Sınıf Adı', 'Sınıf adı ara...')}
                    ` : `
                        ${getFilterHTML('filterUstBaslik', 'Üst Başlık', 'Üst başlık ara...')}
                    `)))}
                    ${!isUrun && !isAntrepo && !isUrunSinifi ? `
                        ${getFilterHTML('filterAnalizAdi', 'Analiz Adı', 'Analiz ara...')}
                    ` : ''}
                    ${isSiklik ? `
                        ${getFilterHTML('filterSiklik', 'Sıklık Oranı', 'Oran ara...')}
                    ` : ''}
                    ${isAntrepo ? `
                        ${getFilterHTML('filterAntrepoIp', 'IP', 'IP ara...')}
                        ${getFilterHTML('filterAntrepoInsertedBy', 'Ekleyen', 'Kullanıcı ara...')}
                    ` : ''}
                    <div class="filter-group" style="display: flex; align-items: flex-end; gap: 5px;">
                        <button class="btn btn-secondary" onclick="window.clearFilters()">🗑️ Temizle</button>
                        ${isSiklik ? `
                            <button class="btn btn-primary" id="viewToggleBtn" onclick="window.toggleView()">
                                🔄 Görünüm
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="bulk-actions" id="bulkActions">
                    <span class="bulk-info" id="bulkInfo">0 kayıt seçildi</span>
                    <div class="action-btn-group">
                        <button class="btn btn-danger" id="deleteSelectedBtn" onclick="window.deleteSelected()">
                            🗑️ Seçilenleri Sil
                        </button>
                    </div>
                </div>

                <div class="stats-bar">
                    <div class="stats-left">
                        <span id="totalRecords">Toplam: 0</span>
                        <span id="showingRecords">Gösterilen: 0</span>
                    </div>
                    <div class="stats-right" style="display: flex; align-items: center; gap: 15px;">
                        ${(!isSiklik && !isAntrepo) ? `
                            <button class="btn btn-success" onclick="window.addNewRecord()" style="padding: 10px 20px; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 10px rgba(40,167,69,0.3);">
                                ➕ Yeni ${isUrunSinifi ? 'Sınıf' : (isUrun ? 'Ürün' : 'Analiz')} Ekle
                            </button>
                        ` : ''}
                        <select class="filter-select" id="rowsPerPageSelect" onchange="window.rowsPerPage = parseInt(this.value); window.currentPage = 1; window.renderTable();">
                            <option value="10">10 satır</option>
                            <option value="25" selected>25 satır</option>
                            <option value="50">50 satır</option>
                            <option value="100">100 satır</option>
                            <option value="500">500 satır</option>
                            <option value="1000">1000 satır</option>
                        </select>
                        <button class="btn btn-excel" onclick="window.exportToExcel()" style="padding: 10px 20px; border-radius: 50px;">
                            Excel'e Aktar 📊
                        </button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th class="checkbox-cell">
                                    <input type="checkbox" id="selectAllCheckbox" class="row-checkbox" onclick="window.toggleSelectAll()">
                                </th>
                                ${isSiklik ? `
                                    <th class="sortable" data-column="urunSinifKodu" onclick="window.sortData('urunSinifKodu')">Ürün Sınıf Kodu</th>
                                    <th class="sortable" data-column="gtip" onclick="window.sortData('gtip')">GTIP</th>
                                    <th class="sortable" data-column="ulke" onclick="window.sortData('ulke')">Ülke</th>
                                    <th class="sortable" data-column="siklikOrani" onclick="window.sortData('siklikOrani')">Sıklık Oranı (%)</th>
                                    <th class="sortable" data-column="analizAdi" onclick="window.sortData('analizAdi')">Analizler</th>
                                ` : (isAntrepo ? `
                                    <th class="sortable" data-column="id" onclick="window.sortData('id')">ID</th>
                                    <th class="sortable" data-column="ad" onclick="window.sortData('ad')">Antrepo Adı</th>
                                    <th class="sortable" data-column="antrepoKodu" onclick="window.sortData('antrepoKodu')">Kod</th>
                                    <th class="sortable" data-column="bolgeAd" onclick="window.sortData('bolgeAd')">Bölge</th>
                                    <th class="sortable" data-column="antrepoTipi" onclick="window.sortData('antrepoTipi')">Tip</th>
                                    <th class="sortable" data-column="ip" onclick="window.sortData('ip')">IP</th>
                                    <th class="sortable" data-column="isActive" onclick="window.sortData('isActive')">Durum</th>
                                    <th class="sortable" data-column="insertedBy" onclick="window.sortData('insertedBy')">Ekleyen</th>
                                    <th class="sortable" data-column="insertTime" onclick="window.sortData('insertTime')">Ekleme</th>
                                    <th class="sortable" data-column="updatedBy" onclick="window.sortData('updatedBy')">Güncelleyen</th>
                                    <th class="sortable" data-column="updateTime" onclick="window.sortData('updateTime')">Güncelleme</th>
                                ` : (isUrun ? `
                                    <th class="sortable" data-column="id" onclick="window.sortData('id')">ID</th>
                                    <th class="sortable" data-column="gtip" onclick="window.sortData('gtip')">GTIP</th>
                                    <th class="sortable" data-column="urunAdi" onclick="window.sortData('urunAdi')">Ürün Adı</th>
                                    <th class="sortable" data-column="urunSinifi" onclick="window.sortData('urunSinifi')">Ürün Sınıfı</th>
                                    <th class="sortable" data-column="insertedBy" onclick="window.sortData('insertedBy')">Ekleyen</th>
                                    <th class="sortable" data-column="insertTime" onclick="window.sortData('insertTime')">Ekleme Tarihi</th>
                                    <th class="sortable" data-column="updatedBy" onclick="window.sortData('updatedBy')">Güncelleyen</th>
                                    <th class="sortable" data-column="updateTime" onclick="window.sortData('updateTime')">Güncelleme Tarihi</th>
                                ` : (isUrunSinifi ? `
                                    <th class="sortable" data-column="id" onclick="window.sortData('id')">ID</th>
                                    <th class="sortable" data-column="sinifKodu" onclick="window.sortData('sinifKodu')">Sınıf Kodu</th>
                                    <th class="sortable" data-column="sinifAdi" onclick="window.sortData('sinifAdi')">Sınıf Adı</th>
                                    <th class="sortable" data-column="insertedBy" onclick="window.sortData('insertedBy')">Ekleyen</th>
                                    <th class="sortable" data-column="insertTime" onclick="window.sortData('insertTime')">Ekleme Tarihi</th>
                                    <th class="sortable" data-column="updatedBy" onclick="window.sortData('updatedBy')">Güncelleyen</th>
                                    <th class="sortable" data-column="updateTime" onclick="window.sortData('updateTime')">Güncelleme Tarihi</th>
                                ` : `
                                    <th class="sortable" data-column="id" onclick="window.sortData('id')">ID</th>
                                    <th class="sortable" data-column="analizAdi" onclick="window.sortData('analizAdi')">Analiz Adı</th>
                                    <th class="sortable" data-column="analizUstBasligi" onclick="window.sortData('analizUstBasligi')">Üst Başlık</th>
                                    <th>Ekleyen</th>
                                    <th>Ekleme Tarihi</th>
                                    <th>Güncelleyen</th>
                                    <th>Güncelleme Tarihi</th>
                                    <th>Durum</th>
                                `)))}
                                <th style="width: 150px;">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr><td colspan="${isSiklik ? 7 : (isAntrepo ? 13 : (isUrunSinifi ? 9 : 10))}" class="loading">📡 Veriler yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="pagination" id="pagination"></div>
            </div>
        `;

        document.body.appendChild(container);

        // Event listeners
        if (isSiklik) {
            document.getElementById('filterUlke').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinif').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinifAdi').addEventListener('input', applyFilters);
            document.getElementById('filterUrunAdi').addEventListener('input', applyFilters);
            document.getElementById('filterGtip').addEventListener('input', applyFilters);
            document.getElementById('filterAnalizAdi').addEventListener('input', applyFilters);
            document.getElementById('filterSiklik').addEventListener('input', applyFilters);
        } else if (isAntrepo) {
            document.getElementById('filterAntrepoAd').addEventListener('input', applyFilters);
            document.getElementById('filterAntrepoKodu').addEventListener('input', applyFilters);
            document.getElementById('filterAntrepoBolgeAd').addEventListener('input', applyFilters);
            document.getElementById('filterAntrepoTip').addEventListener('input', applyFilters);
            document.getElementById('filterAntrepoIp').addEventListener('input', applyFilters);
            document.getElementById('filterAntrepoInsertedBy').addEventListener('input', applyFilters);
        } else if (isUrun) {
            document.getElementById('filterGtip').addEventListener('input', applyFilters);
            document.getElementById('filterUrunAdi').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinif').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinifAdi').addEventListener('input', applyFilters);
        } else if (isUrunSinifi) {
            document.getElementById('filterUrunSinifiKodu').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinifiAdi').addEventListener('input', applyFilters);
            document.getElementById('filterUrunSinifiInsertedBy').addEventListener('input', applyFilters);
        } else {
            document.getElementById('filterUstBaslik').addEventListener('input', applyFilters);
            document.getElementById('filterAnalizAdi').addEventListener('input', applyFilters);
        }

        // Verileri yükle
        fetchData()
            .then(() => {
                window.renderTable();
            })
            .catch(error => {
                const colSpan = isSiklik ? 7 : (isAntrepo ? 13 : (isUrunSinifi ? 9 : 10));
                document.getElementById('tableBody').innerHTML =
                    `<tr><td colspan="${colSpan}" class="error">❌ Hata: ${error.message}</td></tr>`;
            });
    }

    // Tetikleyici butonlar
    let tableTriggerBtn = null;
    let tokenBtn = null;

    function addTableTriggerButton() {
        if (tableTriggerBtn && document.body.contains(tableTriggerBtn)) return;

        tableTriggerBtn = document.createElement('button');
        tableTriggerBtn.className = 'trigger-btn';
        tableTriggerBtn.id = 'timosSiklikTriggerBtn';
        tableTriggerBtn.textContent = '📊 Modern Tablo';
        tableTriggerBtn.onclick = createTable;
        document.body.appendChild(tableTriggerBtn);
    }

    function removeTableTriggerButton() {
        if (tableTriggerBtn && document.body.contains(tableTriggerBtn)) {
            tableTriggerBtn.remove();
            tableTriggerBtn = null;
        }
    }

    function addTokenButton() {
        if (tokenBtn && document.body.contains(tokenBtn)) return;

        tokenBtn = document.createElement('button');
        tokenBtn.className = 'trigger-btn';
        tokenBtn.id = 'timosTokenBtn';
        tokenBtn.textContent = '🔑 Token Kopyala';
        tokenBtn.style.bottom = '90px';
        tokenBtn.onclick = function () {
            const token = getAuthToken();
            if (token) {
                navigator.clipboard.writeText(token).then(() => {
                    const originalText = tokenBtn.textContent;
                    tokenBtn.textContent = '✅ Kopyalandı!';
                    tokenBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                    setTimeout(() => {
                        tokenBtn.textContent = originalText;
                        tokenBtn.style.background = '';
                    }, 2000);
                }).catch(err => {
                    alert('Token kopyalanamadı: ' + err);
                });
            } else {
                alert('Token bulunamadı! Lütfen giriş yapın.');
            }
        };
        document.body.appendChild(tokenBtn);
    }

    function removeTokenButton() {
        if (tokenBtn && document.body.contains(tokenBtn)) {
            tokenBtn.remove();
            tokenBtn = null;
        }
    }

    // Sayfa kontrolü
    function checkPage() {
        const currentUrl = window.location.href;
        const isSiklikPage = currentUrl.includes('timos.tasar.com.tr/main2/analizSiklikGiris');
        const isTanimlamaPage = currentUrl.includes('timos.tasar.com.tr/main2/analizTanimlama');
        const isUrunTanimlamaPage = currentUrl.includes('timos.tasar.com.tr/main2/urunTanimlama');
        const isAntrepoPage = currentUrl.includes('timos.tasar.com.tr/main2/antrepo');
        const isUrunSinifiPage = currentUrl.includes('timos.tasar.com.tr/main2/urunSinifiTanimlama');
        const isGorevatamaPage = currentUrl.includes('timos.tasar.com.tr/main2/gorevatama');
        const isTimosPage = currentUrl.includes('timos.tasar.com.tr');

        if (isGorevatamaPage) {
            removeTableTriggerButton();
            addTokenButton();
            addGorevTriggerButton();
            const mainContainer = document.getElementById('customSiklikTableContainer');
            if (mainContainer) mainContainer.remove();
        } else if (isSiklikPage || isTanimlamaPage || isUrunTanimlamaPage || isAntrepoPage || isUrunSinifiPage) {
            addTableTriggerButton();
            addTokenButton();
            removeGorevTriggerButton();
        } else if (isTimosPage) {
            removeTableTriggerButton();
            addTokenButton();
            removeGorevTriggerButton();
            const tableContainer = document.getElementById('customSiklikTableContainer');
            if (tableContainer) {
                tableContainer.remove();
            }
        } else {
            removeTableTriggerButton();
            removeTokenButton();
            removeGorevTriggerButton();
            const tableContainer = document.getElementById('customSiklikTableContainer');
            if (tableContainer) {
                tableContainer.remove();
            }
        }
    }

    // ================================================================
    // === GÖREV ATAMA (gorevatama) BAĞIMSIZ MODÜLÜ ===
    // === Kendi veri yönetimi, render, filtre, sıralama, sayfalama ===
    // ================================================================
    let gorev_Data = [];
    let gorev_FilteredData = [];
    let gorev_SortColumn = null;
    let gorev_SortDirection = 'asc';
    let gorev_CurrentPage = 1;

    async function fetchBelgeNoData(token) {
        const response = await fetch('https://timosapi.tasar.com.tr/api/gumrukcu/GetBelgeNoNotInGorevler', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Authorization': token,
            },
            method: 'GET',
            mode: 'cors'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const rawData = Array.isArray(data) ? data : (data.data || data.result || []);
        gorev_Data = rawData.map(item => {
            const belgeNo = item.belgeNo || item.belgeNumarasi || item.belge_No || '-';
            return {
                belgeNo: belgeNo,
                firmaAdi: item.firmaAdi || item.firma || '-',
                eklenmeTarihi: item.eklenmeTarihi || item.eklenmeTarih || item.insertTime || item.tarih || '',
                durum: item.durum || (item.isActive === true ? 'Aktif' : item.isActive === false ? 'Pasif' : 'Aktif'),
                _uniqueId: belgeNo
            };
        });
        gorev_FilteredData = [...gorev_Data];
    }

    let gorevTriggerBtn = null;

    function addGorevTriggerButton() {
        if (gorevTriggerBtn && document.body.contains(gorevTriggerBtn)) return;
        gorevTriggerBtn = document.createElement('button');
        gorevTriggerBtn.className = 'trigger-btn';
        gorevTriggerBtn.id = 'gorevTriggerBtn';
        gorevTriggerBtn.textContent = '📋 Görevsiz Belgeler';
        gorevTriggerBtn.style.bottom = '150px';
        gorevTriggerBtn.onclick = createGorevTable;
        document.body.appendChild(gorevTriggerBtn);
    }

    function removeGorevTriggerButton() {
        if (gorevTriggerBtn && document.body.contains(gorevTriggerBtn)) {
            gorevTriggerBtn.remove();
            gorevTriggerBtn = null;
        }
        const gorevContainer = document.getElementById('gorevTableContainer');
        if (gorevContainer) gorevContainer.remove();
    }

    window.closeGorevTable = function () {
        const container = document.getElementById('gorevTableContainer');
        if (container) container.style.display = 'none';
    };

    function createGorevTable() {
        const existing = document.getElementById('gorevTableContainer');
        if (existing) {
            existing.style.display = 'block';
            return;
        }

        const container = document.createElement('div');
        container.id = 'gorevTableContainer';
        container.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.98); z-index: 1000000; overflow-y: scroll; padding: 20px; box-sizing: border-box;';
        container.innerHTML = `
            <div style="max-width: 1400px; margin: 0 auto;">
                <div class="table-header">
                    <div class="header-title">
                        Görevlerde Olmayan Belge Numaraları
                        <span id="gorevRecordCount" class="stats-badge">0 kayıt</span>
                    </div>
                    <button class="close-btn" onclick="window.closeGorevTable()">✖</button>
                </div>

                <div class="filter-section">
                    <div class="filter-group">
                        <div class="filter-group-header">
                            <label class="filter-label">Belge No</label>
                            <select class="filter-mode-select" id="gorevFilterBelgeNoMode" onchange="window.applyGorevFilters()">
                                <option value="contains" selected>İçerir</option>
                                <option value="starts">İle Başlar</option>
                                <option value="equals">Eşittir</option>
                            </select>
                        </div>
                        <input type="text" id="gorevFilterBelgeNo" class="filter-input" placeholder="Belge no ara..." oninput="window.applyGorevFilters()">
                    </div>
                    <div class="filter-group">
                        <div class="filter-group-header">
                            <label class="filter-label">Firma Adı</label>
                            <select class="filter-mode-select" id="gorevFilterFirmaMode" onchange="window.applyGorevFilters()">
                                <option value="contains" selected>İçerir</option>
                                <option value="starts">İle Başlar</option>
                                <option value="equals">Eşittir</option>
                            </select>
                        </div>
                        <input type="text" id="gorevFilterFirma" class="filter-input" placeholder="Firma ara..." oninput="window.applyGorevFilters()">
                    </div>
                    <div class="filter-group">
                        <label class="filter-label">Durum</label>
                        <select id="gorevFilterDurum" class="filter-select" onchange="window.applyGorevFilters()">
                            <option value="">Tümü</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Pasif">Pasif</option>
                        </select>
                    </div>
                    <div class="filter-group" style="display: flex; align-items: flex-end;">
                        <button class="btn btn-secondary" onclick="window.clearGorevFilters()">🗑️ Temizle</button>
                    </div>
                </div>

                <div class="stats-bar">
                    <div class="stats-left">
                        <span id="gorevTotalRecords">Toplam: 0</span>
                        <span id="gorevShowingRecords">Gösterilen: 0</span>
                    </div>
                    <div class="stats-right">
                        <select class="filter-select" id="gorevRowsPerPage" onchange="gorev_CurrentPage=1; window.renderGorevTable();">
                            <option value="10">10 satır</option>
                            <option value="25" selected>25 satır</option>
                            <option value="50">50 satır</option>
                            <option value="100">100 satır</option>
                        </select>
                        <button class="btn btn-excel" onclick="window.exportGorevToExcel()" style="padding: 10px 20px; border-radius: 50px;">Excel'e Aktar 📊</button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-column="belgeNo" onclick="window.sortGorevData('belgeNo')">Belge No</th>
                                <th class="sortable" data-column="firmaAdi" onclick="window.sortGorevData('firmaAdi')">Firma Adı</th>
                                <th class="sortable" data-column="eklenmeTarihi" onclick="window.sortGorevData('eklenmeTarihi')">Eklenme Tarihi</th>
                                <th class="sortable" data-column="durum" onclick="window.sortGorevData('durum')">Durum</th>
                            </tr>
                        </thead>
                        <tbody id="gorevTableBody">
                            <tr><td colspan="4" class="loading">📡 Veriler yükleniyor...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="pagination" id="gorevPagination"></div>
            </div>
        `;
        document.body.appendChild(container);

        const token = getAuthToken();
        if (!token) {
            document.getElementById('gorevTableBody').innerHTML =
                '<tr><td colspan="4" class="error">❌ Token bulunamadı! Lütfen giriş yapın.</td></tr>';
            return;
        }
        fetchBelgeNoData(token)
            .then(() => window.renderGorevTable())
            .catch(err => {
                document.getElementById('gorevTableBody').innerHTML =
                    `<tr><td colspan="4" class="error">❌ Hata: ${err.message}</td></tr>`;
            });
    }

    window.renderGorevTable = function () {
        const tbody = document.getElementById('gorevTableBody');
        if (!tbody) return;

        const rowsPerPage = parseInt(document.getElementById('gorevRowsPerPage')?.value || 25);
        const start = (gorev_CurrentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = gorev_FilteredData.slice(start, end);

        tbody.innerHTML = pageData.map(item => `
                <tr>
                    <td><span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">${item.belgeNo}</span></td>
                    <td style="font-weight: 500;">${item.firmaAdi}</td>
                    <td>${item.eklenmeTarihi || '-'}</td>
                    <td><span style="background: ${item.durum === 'Aktif' ? '#28a745' : '#dc3545'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${item.durum || 'Aktif'}</span></td>
                </tr>
            `).join('') ||
            '<tr><td colspan="4" style="text-align: center; padding: 40px; color: #666;">📭 Veri bulunamadı</td></tr>';

        document.getElementById('gorevRecordCount').textContent = `${gorev_FilteredData.length} kayıt`;
        document.getElementById('gorevTotalRecords').textContent = `Toplam: ${gorev_FilteredData.length}`;
        document.getElementById('gorevShowingRecords').textContent =
            `Gösterilen: ${start + 1}-${Math.min(end, gorev_FilteredData.length)}`;

        document.querySelectorAll('#gorevTableContainer .custom-table th.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.column === gorev_SortColumn) {
                th.classList.add(gorev_SortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        renderGorevPagination();
    };

    function renderGorevPagination() {
        const pagination = document.getElementById('gorevPagination');
        if (!pagination) return;
        const rowsPerPage = parseInt(document.getElementById('gorevRowsPerPage')?.value || 25);
        const totalPages = Math.ceil(gorev_FilteredData.length / rowsPerPage);
        let pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= gorev_CurrentPage - 2 && i <= gorev_CurrentPage + 2)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        pagination.innerHTML = `
                <button class="page-btn" ${gorev_CurrentPage === 1 ? 'disabled' : ''} onclick="window.goToGorevPage(${gorev_CurrentPage - 1})">← Önceki</button>
                ${pages.map(p => p === '...' ? '<span class="page-info">...</span>' : `<button class="page-btn ${p === gorev_CurrentPage ? 'active' : ''}" onclick="window.goToGorevPage(${p})">${p}</button>`).join('')}
                <button class="page-btn" ${gorev_CurrentPage === totalPages ? 'disabled' : ''} onclick="window.goToGorevPage(${gorev_CurrentPage + 1})">Sonraki →</button>
            `;
    }

    window.goToGorevPage = function (page) {
        gorev_CurrentPage = page;
        window.renderGorevTable();
    };

    window.sortGorevData = function (column) {
        if (gorev_SortColumn === column) {
            gorev_SortDirection = gorev_SortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            gorev_SortColumn = column;
            gorev_SortDirection = 'asc';
        }
        gorev_FilteredData.sort((a, b) => {
            let aVal = a[column],
                bVal = b[column];
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';
            if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
            return gorev_SortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
        window.renderGorevTable();
    };

    window.applyGorevFilters = function () {
        const belgeNo = (document.getElementById('gorevFilterBelgeNo')?.value || '').toLowerCase();
        const belgeNoMode = document.getElementById('gorevFilterBelgeNoMode')?.value || 'contains';
        const firma = (document.getElementById('gorevFilterFirma')?.value || '').toLowerCase();
        const firmaMode = document.getElementById('gorevFilterFirmaMode')?.value || 'contains';
        const durum = document.getElementById('gorevFilterDurum')?.value || '';

        const matches = (val, filter, mode) => {
            if (!filter) return true;
            if (!val) return false;
            const target = val.toLowerCase();
            switch (mode) {
                case 'starts': return target.startsWith(filter);
                case 'equals': return target === filter;
                default: return target.includes(filter);
            }
        };

        gorev_FilteredData = gorev_Data.filter(item => {
            if (!matches(item.belgeNo, belgeNo, belgeNoMode)) return false;
            if (!matches(item.firmaAdi, firma, firmaMode)) return false;
            if (durum && item.durum !== durum) return false;
            return true;
        });

        gorev_CurrentPage = 1;
        window.renderGorevTable();
    };

    window.clearGorevFilters = function () {
        ['gorevFilterBelgeNo', 'gorevFilterFirma'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const durum = document.getElementById('gorevFilterDurum');
        if (durum) durum.value = '';
        window.applyGorevFilters();
    };

    window.exportGorevToExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert('Excel kütüphanesi yüklenemedi.');
            return;
        }
        if (gorev_FilteredData.length === 0) {
            alert('Dışarı aktarılacak veri yok.');
            return;
        }
        const exportData = gorev_FilteredData.map(item => ({
            'Belge No': item.belgeNo,
            'Firma Adı': item.firmaAdi,
            'Eklenme Tarihi': item.eklenmeTarihi || '-',
            'Durum': item.durum || 'Aktif'
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Belgeler');
        const wscols = Object.keys(exportData[0]).map(key => ({
            wch: Math.max(key.length, ...exportData.map(item => (item[key] ? item[key].toString().length : 0))) + 2
        }));
        ws['!cols'] = wscols;
        XLSX.writeFile(wb, 'gorevsiz_belge_numaralari.xlsx');
    };

    // URL değişikliklerini izle
    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            checkPage();
        }
    }).observe(document.body, {
        childList: true,
        subtree: true
    });

    // Sayfa yüklendiğinde
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPage);
    } else {
        checkPage();
    }

    // Hash ve popstate değişikliklerini de izle
    window.addEventListener('hashchange', checkPage);
    window.addEventListener('popstate', checkPage);

    // Eski div genişletme fonksiyonu (yedek olarak)
    function divGenislet() {
        const targetDiv = document.querySelector("body > app-root > app-main-page2 > div > div > div > app-analiz-siklik-giris > div.container-fluid.d-flex.flex-column.align-items-center > div:nth-child(2) > div");
        const scrollDiv = document.querySelector("[id^='grid_'] > div.e-gridcontent > div");

        if (targetDiv) {
            targetDiv.style.width = '100%';
            targetDiv.style.maxWidth = '100%';
            targetDiv.style.height = '100%';
            targetDiv.style.maxHeight = '100%';

            let parent = targetDiv.parentElement;
            while (parent && parent !== document.body) {
                parent.style.width = '100%';
                parent.style.maxWidth = '100%';
                parent.style.height = '100%';
                parent.style.maxHeight = '100%';
                parent = parent.parentElement;
            }
        }

        if (scrollDiv) {
            scrollDiv.style.overflow = 'visible';
            scrollDiv.style.height = '100%';
            scrollDiv.style.maxHeight = '100%';
        }
    }

    // Div genişletmeyi düzenli olarak çalıştır
    setTimeout(divGenislet, 1000);
    setInterval(divGenislet, 3000);
})();