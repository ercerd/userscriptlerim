// ==UserScript==
// @name         TekPencere Add Link to Header
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a link to the header of the specified page and set the select option
// @match        https://uygulama.gtb.gov.tr/TekPencere/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the new link element
    const link = document.createElement('a');
    link.href = 'https://uygulama.gtb.gov.tr/TekPencere/EBelge/BelgeListesi';
    link.textContent = 'EBelge Sorgulama'; // Customize the link text
    link.style.color = 'white'; // Set link color
    link.style.fontSize = '16px'; // Set font size
    link.style.textDecoration = 'none'; // Remove underline
    link.style.position = 'absolute';
    link.style.left = '50%';
    link.style.transform = 'translateX(-50%)';
    link.style.top = '50%'; // Adjust as needed for vertical centering
    link.style.zIndex = '1000'; // Ensure it is on top of other elements
    link.style.backgroundImage = 'url("https://uygulama.gtb.gov.tr/TekPencere/Content/img/skin.png")';

    // Style the header for positioning
    const header = document.getElementById('header');
    header.style.position = 'relative'; // Set position to relative for absolute positioning of the link

    // Append the link to the header
    header.appendChild(link);


})();
