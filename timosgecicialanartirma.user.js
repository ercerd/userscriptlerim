// ==UserScript==
// @name         Div Genişletici - Grid Scroll Kaldırıcı (Dinamik)
// @namespace    Violentmonkey
// @version      1.4
// @description  Ana div'i genişletir ve grid içindeki scroll'u kaldırır (dinamik ID destekli)
// @author       You
// @match        http://timos.tasar.com.tr/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function genislet() {
        // Ana div'i genişlet
        const targetDiv = document.querySelector("body > app-root > app-main-page2 > div > div > div > app-analiz-siklik-giris > div.container-fluid.d-flex.flex-column.align-items-center > div:nth-child(2) > div");
        
        // Scroll olan div'i seç (dinamik ID için)
        const scrollDiv = document.querySelector("[id^='grid_'] > div.e-gridcontent > div");
        
        let success = false;
        
        if (targetDiv) {
            // Ana div'i genişlet ve yüksekliğini ayarla
            targetDiv.style.width = '100%';
            targetDiv.style.maxWidth = '100%';
            targetDiv.style.height = '100%';
            targetDiv.style.maxHeight = '100%';
            
            // Parent container'ları da genişlet
            let parent = targetDiv.parentElement;
            while (parent && parent !== document.body) {
                parent.style.width = '100%';
                parent.style.maxWidth = '100%';
                parent.style.height = '100%';
                parent.style.maxHeight = '100%';
                parent = parent.parentElement;
            }
            
            console.log('✅ Ana div genişletildi!');
            success = true;
        }
        
        if (scrollDiv) {
            // Scroll'u kaldır
            scrollDiv.style.overflow = 'visible';
            scrollDiv.style.height = '100%';
            scrollDiv.style.maxHeight = '100%';
            
            console.log('✅ Scroll kaldırıldı!');
            success = true;
        }
        
        return success;
    }

    // Sayfa yüklendikten sonra çalıştır
    window.addEventListener('load', function() {
        setTimeout(genislet, 500);
    });

    // Angular gibi SPA'lar için MutationObserver ekle
    const observer = new MutationObserver(function(mutations) {
        genislet();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Hemen bir kez dene
    setTimeout(genislet, 1000);
    setTimeout(genislet, 2000);
})();