// ==UserScript==
// @name         GGBS AnaMenu Sidebar (Modern Paste Test)
// @namespace    http://tampermonkey.net/
// @version      1.23
// @description  Adds a sidebar with buttons to select specific values from dropdowns in any iframe and click a specific button (Test file for modern paste)
// @author       Your Name
// @match        http://172.20.20.103/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.104/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.105/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.106/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.107/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.108/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://172.20.20.109/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        https://ggbs.tarim.gov.tr/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @match        http://ggbs.tarim.gov.tr/cis/servlet/StartCISPage?PAGEURL=/FSIS/ggbs.giris.html&POPUPTITLE=AnaMenu
// @grant        GM_log
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/ercerd/userscriptlerim/master/ggbsithalat1.user.js
// @downloadURL  https://raw.githubusercontent.com/ercerd/userscriptlerim/master/ggbsithalat1.user.js
// ==/UserScript==

(function() {
    'use strict';

    let currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '.');

    const selectDropdown = (iframeDocument, dropdownId, valueOrIndex, { byValue = false, delayMs = 0 } = {}) => {
        return new Promise((resolve, reject) => {
            try {
                const dropdown = iframeDocument.getElementById(dropdownId);
                if (!dropdown) {
                    GM_log(`Dropdown with id ${dropdownId} not found.`);
                    return reject(`Dropdown with id ${dropdownId} not found.`);
                }
                if (byValue) {
                    dropdown.value = String(valueOrIndex);
                } else {
                    dropdown.selectedIndex = valueOrIndex;
                }
                triggerEvent(dropdown, 'change');
                triggerEvent(dropdown, 'input');
                GM_log(`${byValue ? 'Value' : 'Option'} ${valueOrIndex} selected in dropdown ${dropdownId}`);
                setTimeout(() => resolve(true), delayMs);
            } catch (error) {
                GM_log(`Error selecting dropdown ${dropdownId}: ${error}`);
                reject(error);
            }
        });
    };

    const copyFieldValue = (iframeDocument, sourceFieldId, targetFieldId) => new Promise((resolve, reject) => {
        try {
            const sourceField = iframeDocument.getElementById(sourceFieldId);
            const targetField = iframeDocument.getElementById(targetFieldId);
            if (sourceField && targetField) {
                targetField.value = sourceField.value;
                triggerEvent(targetField, 'change');
                triggerEvent(targetField, 'input');
                GM_log(`Value copied from ${sourceFieldId} to ${targetFieldId}`);
                resolve(true);
            } else {
                GM_log(`Source or target field not found`);
                resolve(false);
            }
        } catch (error) {
            GM_log('Error copying field value: ' + error);
            reject(error);
        }
    });

    const isButtonDisabled = (button) => {
        return button.disabled || button.getAttribute('disabled') !== null;
    };

    const clickButtonWithId = (doc, buttonId) => new Promise((resolve, reject) => {
        try {
            const button = doc.getElementById(buttonId);
            if (button) {
                if (isButtonDisabled(button)) {
                    GM_log(`${buttonId} ID'li düğme disabled olduğu için tıklanmadı.`);
                    resolve(false);
                    return;
                }

                let currentElement = button;
                while (currentElement && currentElement !== doc) {
                    if (window.getComputedStyle(currentElement).display === 'none') {
                        GM_log(`${buttonId} ID'li düğme veya üst elementi display: none olduğu için tıklanmadı.`);
                        resolve(false);
                        return;
                    }
                    currentElement = currentElement.parentElement;
                }

                triggerEvent(button, 'mousedown');
                triggerEvent(button, 'mouseup');
                triggerEvent(button, 'click');
                GM_log(`${buttonId} ID'li düğme tıklandı`);
                resolve(true);
            } else {
                GM_log(`${buttonId} ID'li düğme bulunamadı`);
                resolve(false);
            }
        } catch (error) {
            GM_log('Düğmeye tıklama hatası: ' + error);
            reject(error);
        }
    });

    const openArea = (iframeDocument) => {
        const areaDiv = iframeDocument.getElementById('AREADIV105');
        if (areaDiv) {
            areaDiv.style.display = 'block';
        }
    };

    const isIframeVisible = (iframe) => {
        try {
            if (!iframe || !iframe.getBoundingClientRect) return false;
            const rect = iframe.getBoundingClientRect();
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
            const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
            const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
            return vertInView && horInView &&
                   window.getComputedStyle(iframe).visibility !== 'hidden' &&
                   window.getComputedStyle(iframe).display !== 'none' &&
                   rect.width > 0 && rect.height > 0;
        } catch (e) {
            return false;
        }
    };

    const findTargetIframe = (targetUrl) => {
        const iframes = document.getElementsByTagName('iframe');
        for (let iframe of iframes) {
            try {
                if (iframe.contentDocument &&
                    iframe.contentDocument.location.href.indexOf(targetUrl) !== -1 &&
                    isIframeVisible(iframe)) {
                    return iframe.contentDocument;
                }
            } catch (error) {
                GM_log('Error accessing iframe: ' + error);
            }
        }
        return null;
    };

    const findB9ButtonInIframes = (doc) => {
        const button = doc.getElementById('B_9');
        if (button) return { document: doc, button };
        const iframes = doc.getElementsByTagName('iframe');
        for (let i = 0; i < iframes.length; i++) {
            try {
                const result = findB9ButtonInIframes(iframes[i].contentDocument);
                if (result) return result;
            } catch (error) {
                GM_log('Error accessing iframe: ' + error);
            }
        }
        return null;
    };

    const waitForElement = (doc, elementId) => new Promise((resolve) => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (doc.getElementById(elementId)) {
                    observer.disconnect();
                    resolve();
                }
            });
        });
        observer.observe(doc.body, { childList: true, subtree: true });
    });

    // buttondokumanonayla için özel waitForElementWithTimeoutAndReject (bu orijinal betikteki gibi bırakıldı)
    const waitForElementWithTimeoutAndReject = (doc, elementId, timeoutMs) => new Promise((resolve, reject) => {
        const startTime = Date.now();
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (doc.getElementById(elementId)) {
                    observer.disconnect();
                    setTimeout(() => {
                        doc.body.click(); // Element bulunduğunda manuel tıklama simülasyonu
                        GM_log(`${elementId} bulundu, sayfaya manuel tıklama simüle edildi`);
                        resolve();
                    }, 250);
                }
            });
        });
        observer.observe(doc.body, { childList: true, subtree: true });

        setTimeout(() => {
            if (Date.now() - startTime >= timeoutMs) {
                observer.disconnect();
                GM_log(`${elementId} elementi ${timeoutMs} ms içinde bulunamadı`);
                doc.body.click(); // Zaman aşımında manuel tıklama simülasyonu
                GM_log(`${elementId} için zaman aşımı, sayfaya manuel tıklama simüle edildi`);
                reject(new Error(`${elementId} zaman aşımına uğradı`));
            }
        }, timeoutMs);
    });

    // Özel Modal Fonksiyonu
    function showCustomPrompt(message, defaultValue = '') {
        return new Promise((resolve) => {
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'customModalOverlay';
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 99999;
            `;

            const modalBox = document.createElement('div');
            modalBox.id = 'customModalBox';
            modalBox.style.cssText = `
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
            `;

            const messageParagraph = document.createElement('p');
            messageParagraph.innerText = message;
            messageParagraph.style.marginBottom = '15px';

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = defaultValue;
            inputField.style.cssText = `
                width: calc(100% - 20px);
                padding: 8px 10px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
            `;

            const okButton = document.createElement('button');
            okButton.innerText = 'Tamam';
            okButton.style.cssText = `
                padding: 8px 15px;
                margin-right: 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;

            const cancelButton = document.createElement('button');
            cancelButton.innerText = 'İptal';
            cancelButton.style.cssText = `
                padding: 8px 15px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;

            modalBox.appendChild(messageParagraph);
            modalBox.appendChild(inputField);
            modalBox.appendChild(okButton);
            modalBox.appendChild(cancelButton);
            modalOverlay.appendChild(modalBox);
            document.body.appendChild(modalOverlay);

            inputField.focus();

            okButton.onclick = () => {
                document.body.removeChild(modalOverlay);
                resolve(inputField.value);
            };

            cancelButton.onclick = () => {
                document.body.removeChild(modalOverlay);
                resolve(null);
            };

            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    okButton.click();
                } else if (e.key === 'Escape') {
                    cancelButton.click();
                }
            });
        });
    }


    const waitForElementById = (doc, elementId, timeout = 10000) => new Promise((resolve, reject) => {
        const check = () => doc.getElementById(elementId);
        let element = check();
        if (element) return resolve(element);

        const observer = new MutationObserver(() => {
            element = check();
            if (element) {
                observer.disconnect();
                clearTimeout(timer);
                resolve(element);
            }
        });
        observer.observe(doc.body, { childList: true, subtree: true });
        const timer = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element with ID '${elementId}' not found within ${timeout}ms`));
        }, timeout);
    });

    const waitForButtonClickable = (doc, buttonId, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const check = () => {
                const button = doc.getElementById(buttonId);
                if (!button || isButtonDisabled(button)) return null;

                let currentElement = button;
                while (currentElement && currentElement !== doc.body) {
                    const style = window.getComputedStyle(currentElement);
                    if (style.display === 'none' || style.visibility === 'hidden') {
                        return null;
                    }
                    currentElement = currentElement.parentElement;
                }
                return button;
            };

            let element = check();
            if (element) return resolve(element);

            const observer = new MutationObserver(() => {
                element = check();
                if (element) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(element);
                }
            });

            observer.observe(doc.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['disabled', 'style', 'class']
            });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for button '${buttonId}' to become clickable within ${timeout}ms.`));
            }, timeout);
        });
    };

    const waitForIframe = (urlPart, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const check = () => findTargetIframe(urlPart);
            let iframeDoc = check();
            if (iframeDoc) return resolve(iframeDoc);

            const interval = setInterval(() => {
                iframeDoc = check();
                if (iframeDoc) {
                    clearInterval(interval);
                    clearTimeout(timer);
                    resolve(iframeDoc);
                }
            }, 500);

            const timer = setTimeout(() => {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for iframe with URL containing '${urlPart}'`));
            }, timeout);
        });
    };

    const findElementInIframes = (doc, elementId) => {
        const element = doc.getElementById(elementId);
        if (element) return { document: doc, element };

        const iframes = doc.getElementsByTagName('iframe');
        for (let i = 0; i < iframes.length; i++) {
            try {
                const result = findElementInIframes(iframes[i].contentDocument, elementId);
                if (result) return result;
            } catch (error) {
                GM_log('Iframe erişim hatası: ' + error);
            }
        }
        return null;
    };

    const proceedWithIthalatIframe = async (targetIframeDoc) => {
        try {
            GM_log('İthalat iframe\'i bulundu. İşlemler başlıyor...');

            const b29Button = await waitForButtonClickable(targetIframeDoc, 'B_29');
            GM_log('B_29 butonu hazır ve aktif');
            await clickButtonWithId(b29Button.ownerDocument, 'B_29');

            const obsIframeDoc = await waitForIframe('ggbs.ithalat.ithalatOBSorgulama.html');
            GM_log('ggbs.ithalat.ithalatOBSorgulama.html iframe\'i bulundu ve görünür');

            const inputField = await waitForElementById(obsIframeDoc, 'F_32');
            GM_log('F_32 input alanı bulundu');

            if (inputField.disabled) {
                GM_log('F_32 input alanı disabled. Etkinleşmesi bekleniyor...');
                await new Promise(resolve => {
                    const observer = new MutationObserver(() => {
                        if (!inputField.disabled) {
                            observer.disconnect();
                            resolve();
                        }
                    });
                    observer.observe(inputField, { attributes: true, attributeFilter: ['disabled'] });
                });
                GM_log('F_32 input alanı etkinleşti.');
            }

            inputField.focus();
            let textToPaste = null;
            const onbildirimRegex = /^\d{2}-\d{6,8}-\d{1,4}$/;

            if (location.protocol === 'https:' && navigator.clipboard && navigator.clipboard.readText) {
                try {
                    textToPaste = await navigator.clipboard.readText();
                    if (!onbildirimRegex.test(textToPaste)) {
                        GM_log('Panodan okunan metin önbildirim formatında değil. Kullanıcıdan manuel giriş istenecek.');
                        textToPaste = null;
                    }
                } catch (error) {
                    GM_log('Panodan metin okuma yetkisi reddedildi veya başka bir hata oluştu: ' + error);
                    textToPaste = null;
                }
            } else {
                GM_log('HTTP ortamında veya Clipboard API desteklenmiyor. Kullanıcıdan manuel giriş istenecek.');
            }

            if (textToPaste) {
                inputField.value = textToPaste;
                triggerEvent(inputField, 'change');
                triggerEvent(inputField, 'input');
                GM_log('F_32 input alanına panodaki metin yapıştırıldı: ' + textToPaste);
            } else {
                const userInput = await showCustomPrompt('Lütfen Önbildirim numarasını giriniz (örn. 20-110236-300). Panodan yapıştırmak için Ctrl+V kullanın:');
                if (userInput && onbildirimRegex.test(userInput)) {
                    inputField.value = userInput;
                    triggerEvent(inputField, 'change');
                    triggerEvent(inputField, 'input');
                    GM_log('F_32 input alanına kullanıcı metni yapıştırıldı: ' + userInput);
                } else if (userInput) {
                    GM_log('Girilen metin önbildirim formatında değil: ' + userInput);
                    alert('Hatalı format! Lütfen doğru formatta bir önbildirim numarası girin.');
                    throw new Error('Hatalı önbildirim formatı');
                } else {
                    GM_log('Kullanıcı metin girmedi veya iptal etti.');
                    throw new Error('Metin girilmedi');
                }
            }

            const b21Button = await waitForButtonClickable(obsIframeDoc, 'B_21');
            GM_log('B_21 butonu hazır ve aktif');
            await clickButtonWithId(b21Button.ownerDocument, 'B_21');
            GM_log('B_21 butonu tıklandı');

            const b197Button = await waitForButtonClickable(obsIframeDoc, 'B_197');
            GM_log('B_197 butonu hazır ve aktif');
            await clickButtonWithId(b197Button.ownerDocument, 'B_197');
            GM_log('B_197 butonu tıklandı');

        } catch (error) {
            GM_log(`proceedWithIthalatIframe içinde hata: ${error.message}`);
            throw error;
        }
    };

    const findAndClickIthalat = async () => {
        try {
            let ithalatIframeDoc = findTargetIframe('ggbs.ithalat.ithalat.html');
            if (ithalatIframeDoc) {
                GM_log('ggbs.ithalat.ithalat.html iframe\'i zaten açık ve görünür, üst ve alt menü adımları atlanıyor');
                await proceedWithIthalatIframe(ithalatIframeDoc);
                return;
            }

            GM_log('ggbs.ithalat.ithalat.html iframe\'i açık veya görünür değil, menü adımları çalıştırılacak');

            const topMenuResult = await new Promise((resolve, reject) => {
                const check = () => findElementInIframes(document, 'CASAMENU2TOPTEXT_57');
                let result = check();
                if (result) return resolve(result);

                const observer = new MutationObserver(() => {
                    result = check();
                    if (result) {
                        observer.disconnect();
                        clearTimeout(timer);
                        resolve(result);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                const timer = setTimeout(() => {
                    observer.disconnect();
                    reject(new Error('Üst menü öğesi (CASAMENU2TOPTEXT_57) 10 saniye içinde bulunamadı'));
                }, 10000);
            });

            const { document: topIframeDoc, element: topMenuItem } = topMenuResult;
            const topMenuLink = topMenuItem.querySelector('a');
            if (!topMenuLink) {
                throw new Error('Üst menü içindeki <a> etiketi bulunamadı');
            }

            triggerEvent(topMenuLink, 'mouseover');
            await new Promise(r => setTimeout(r, 100));
            topMenuLink.click();
            GM_log('Üst menü (İthalat) tıklandı');

            const subMenuResult = await new Promise((resolve, reject) => {
                const check = () => {
                    const res = findElementInIframes(document, 'MENULNK_L1_C58');
                    if (res && res.element.offsetParent !== null) {
                        return res;
                    }
                    return null;
                };
                let result = check();
                if (result) return resolve(result);

                const observer = new MutationObserver(() => {
                    result = check();
                    if (result) {
                        observer.disconnect();
                        clearTimeout(timer);
                        resolve(result);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true, attributes: true });
                const timer = setTimeout(() => {
                    observer.disconnect();
                    reject(new Error('Alt menü (MENULNK_L1_C58) 10 saniye içinde bulunamadı veya görünür değil'));
                }, 10000);
            });

            subMenuResult.element.click();
            GM_log('İthalat menü öğesi (MENULNK_L1_C58) tıklandı');

            const targetIframeDoc = await waitForIframe('ggbs.ithalat.ithalat.html');
            GM_log('ggbs.ithalat.ithalat.html iframe\'i bulundu ve görünür');

            await proceedWithIthalatIframe(targetIframeDoc);

        } catch (error) {
            GM_log(`findAndClickIthalat içinde hata: ${error.message}`);
            alert(`Bir hata oluştu: ${error.message}`);
        }
    };

    const button1Action = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalat.html');
        if (iframeDocument) {
            selectDropdown(iframeDocument, 'CDYN_115', 3)
                .then(result => result && selectDropdown(iframeDocument, 'CDYN_125', 1))
                .then(result => {
                    if (result) {
                        const field75 = iframeDocument.getElementById('F_75');
                        if (field75) {
                            field75.value = currentDate;
                            triggerEvent(field75, 'change');
                            triggerEvent(field75, 'input');
                            GM_log('F_75 alanına tarih dolduruldu: ' + currentDate);
                        } else {
                            GM_log('F_75 alanı bulunamadı');
                        }
                        const field58 = iframeDocument.getElementById('F_58');
                        if (field58) {
                            field58.value = `${currentDate} 09:00`;
                            triggerEvent(field58, 'change');
                            triggerEvent(field58, 'input');
                            GM_log('F_58 alanına tarih dolduruldu: ' + `${currentDate} 09:00`);
                        } else {
                            GM_log('F_58 alanı bulunamadı');
                        }
                        return clickButtonWithId(iframeDocument, 'B_35');
                    }
                })
                .catch(error => GM_log('Error performing actions for button 1: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const onyButtonAction = () => {
        const result = findB9ButtonInIframes(document);
        if (result) {
            clickButtonWithId(result.document, 'B_9')
                .then((clicked) => {
                    if (clicked) {
                        GM_log('B_9 button clicked successfully');
                    }
                })
                .catch(error => GM_log('Error clicking B_9 button: ' + error));
        } else {
            GM_log('B_9 button not found in any iframe');
        }
    };

    const button2Action = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalat.html');
        if (iframeDocument) {
            selectDropdown(iframeDocument, 'CDYN_115', 3)
                .then(result => result && selectDropdown(iframeDocument, 'CDYN_125', 3))
                .then(result => {
                    if (result) {
                        const field75 = iframeDocument.getElementById('F_75');
                        if (field75) {
                            field75.value = currentDate;
                            triggerEvent(field75, 'change');
                            triggerEvent(field75, 'input');
                            GM_log('F_75 alanına tarih dolduruldu: ' + currentDate);
                        } else {
                            GM_log('F_75 alanı bulunamadı');
                        }
                        const field58 = iframeDocument.getElementById('F_58');
                        if (field58) {
                            field58.value = `${currentDate} 09:00`;
                            triggerEvent(field58, 'change');
                            triggerEvent(field58, 'input');
                            GM_log('F_58 alanına tarih dolduruldu: ' + `${currentDate} 09:00`);
                        } else {
                            GM_log('F_58 alanı bulunamadı');
                        }
                        return clickButtonWithId(iframeDocument, 'B_35');
                    }
                })
                .catch(error => GM_log('Error performing actions for button 2: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const button3Action = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalatOnay.html');
        if (iframeDocument) {
            openArea(iframeDocument);
            selectDropdown(iframeDocument, 'CDYN_92', 1)
                .then(result => result && copyFieldValue(iframeDocument, 'F_57', 'F_81'))
                .then(result => result && clickButtonWithId(iframeDocument, 'B_26'))
                .catch(error => GM_log('Error performing actions for button 3: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const button4Action = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalatOnay.html');
        if (iframeDocument) {
            openArea(iframeDocument);
            clickButtonWithId(iframeDocument, 'RADIO122')
                .then(() => waitForElement(iframeDocument, 'CDYN_126'))
                .then(() => selectDropdown(iframeDocument, 'CDYN_126', 1))
                .then(() => {
                    const field129 = iframeDocument.getElementById('F_129');
                    if (field129) {
                        field129.value = currentDate;
                        triggerEvent(field129, 'change');
                        triggerEvent(field129, 'input');
                        GM_log('F_129 alanına tarih dolduruldu: ' + currentDate);
                    } else {
                        GM_log('F_129 alanı bulunamadı');
                    }
                    return waitForElement(iframeDocument, 'RADIO147');
                })
                .then(() => clickButtonWithId(iframeDocument, 'RADIO147'))
                .then(() => waitForElement(iframeDocument, 'RADIO174'))
                .then(() => clickButtonWithId(iframeDocument, 'RADIO174'))
                .then(() => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            const field150 = iframeDocument.getElementById('F_150');
                            if (field150) {
                                GM_log('F_150 doldurulmadan önceki değer: ' + field150.value);
                                field150.value = currentDate;
                                triggerEvent(field150, 'change');
                                triggerEvent(field150, 'input');
                                triggerEvent(field150, 'blur');
                                GM_log('F_150 alanına tarih dolduruldu: ' + currentDate);
                                GM_log('F_150 doldurulduktan sonraki değer: ' + field150.value);
                            } else {
                                GM_log('F_150 alanı bulunamadı');
                            }
                            resolve();
                        }, 500);
                    });
                })
                .catch(error => GM_log('Error performing actions for button 4: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const button5Action = () => {
        const iframeDocument = findTargetIframe('ggbs.denetim.denetleme.html');
        if (iframeDocument) {
            const inputValue = prompt("Lütfen Önbildirim Numarasını Girin:");
            if (inputValue === null || inputValue.trim() === "") {
                alert("Geçerli bir değer girilmedi. İşlem iptal edildi.");
                return;
            }
            const startDate = `${currentDate} 09:00`;
            const endDate = `${currentDate} 18:00`;

            selectDropdown(iframeDocument, 'CDYN_274', 2)
                .then(() => {
                    const field57 = iframeDocument.getElementById('F_57');
                    if (field57) {
                        field57.value = '';
                        triggerEvent(field57, 'change');
                        triggerEvent(field57, 'input');
                        field57.value = inputValue;
                        triggerEvent(field57, 'change');
                        triggerEvent(field57, 'input');
                    } else {
                        GM_log('Field F_57 not found');
                    }
                    const field253 = iframeDocument.getElementById('F_253');
                    if (field253) {
                        field253.value = startDate;
                        triggerEvent(field253, 'change');
                        triggerEvent(field253, 'input');
                    } else {
                        GM_log('Field F_253 not found');
                    }
                    const field256 = iframeDocument.getElementById('F_256');
                    if (field256) {
                        field256.value = endDate;
                        triggerEvent(field256, 'change');
                        triggerEvent(field256, 'input');
                    } else {
                        GM_log('Field F_256 not found');
                    }
                    return clickButtonWithId(iframeDocument, 'B_335');
                })
                .catch(error => GM_log('Error performing actions for button 5: ' + error));
        } else {
            GM_log('Target iframe for denetim not found or not visible');
        }
    };

    const numuneGenelBilgiler = (iframeDocument) => {
        if (!iframeDocument) {
            GM_log('Target iframe for Numune Genel Bilgiler not found or not visible');
            return Promise.reject('Target iframe not found');
        }
        const combinedInput = prompt("Lütfen mühür numarasını, firma adının ilk üç harfini ve numunenin alındığı bölümü aralarında virgül olacak şekilde girin (örn. 33-25-00001, ABC, A Antrepo):");
        if (combinedInput === null || combinedInput.trim() === "") {
            alert("Geçerli bir mühür numarası, firma adı ve bölüm girilmedi. İşlem iptal edildi.");
            return Promise.reject('Input cancelled');
        }
        const [muhurNo, firmaIlkUcHarf, numuneBolum] = combinedInput.split(',').map(item => item.trim());
        if (!muhurNo || !firmaIlkUcHarf || !numuneBolum) {
            alert("Geçerli bir mühür numarası, firma adı ve bölüm girilmedi. İşlem iptal edildi.");
            return Promise.reject('Invalid input');
        }
        const field58 = iframeDocument.getElementById('F_58');
        if (field58) {
            field58.value = muhurNo;
            triggerEvent(field58, 'change');
            triggerEvent(field58, 'input');
        }
        const field55 = iframeDocument.getElementById('F_55');
        if (field55) {
            const muhurSon6Hane = muhurNo.slice(-6);
            field55.value = `33-2025-iee-${firmaIlkUcHarf}-${muhurSon6Hane}`;
            triggerEvent(field55, 'change');
            triggerEvent(field55, 'input');
        }
        const field161 = iframeDocument.getElementById('F_161');
        if (field161) {
            field161.value = numuneBolum;
            triggerEvent(field161, 'change');
            triggerEvent(field161, 'input');
        }
        return selectDropdown(iframeDocument, 'CDYN_117', 1);
    };

    const triggerAdditionalButton = (iframeDocument, buttonLabel) => {
        const buttonLabels = ['ANK', 'BAL', 'INT', 'İST', 'İZM', 'İL', 'STA', 'MGA', 'MRL', 'MSM', 'PMG', 'SİA', 'SİM', 'SOU'];
        const index = buttonLabels.indexOf(buttonLabel);
        if (index !== -1) {
            selectDropdown(iframeDocument, 'CDYN_150', index + 1);
        } else {
            GM_log(`Button label ${buttonLabel} not found in the list`);
        }
    };

    const numuneKgAction = () => {
        const iframeDocument = findTargetIframe('ggbs.numune.numune.html');
        return numuneGenelBilgiler(iframeDocument)
            .then(() => {
                if (!iframeDocument) {
                    GM_log('Target iframe for KG Numune Bilgileri not found or not visible');
                    return;
                }
                return selectDropdown(iframeDocument, 'CDYN_135', 1, { byValue: true, delayMs: 250 })
                    .then(() => selectDropdown(iframeDocument, 'CDYN_137', 3, { byValue: true }))
                    .then(() => selectDropdown(iframeDocument, 'CDYN_144', 3, { byValue: true }))
                    .then(() => {
                        const startDate = `${currentDate} 09:00`;
                        const field172 = iframeDocument.getElementById('F_172');
                        if (field172) {
                            field172.value = startDate;
                            triggerEvent(field172, 'change');
                            triggerEvent(field172, 'input');
                        }
                        const field133 = iframeDocument.getElementById('F_133');
                        const field140 = iframeDocument.getElementById('F_140');
                        if (field133) {
                            field133.value = '';
                            triggerEvent(field133, 'change');
                            triggerEvent(field133, 'input');
                        }
                        if (field140) {
                            field140.value = '';
                            triggerEvent(field140, 'change');
                            triggerEvent(field140, 'input');
                        }
                    });
            })
            .then(() => {
                const additionalButtonLabel = prompt("Lütfen 3 haneli kodu girin:");
                if (additionalButtonLabel) {
                    triggerAdditionalButton(iframeDocument, additionalButtonLabel);
                }
            })
            .catch(error => GM_log('Error in numuneKgAction: ' + error));
    };

    const numuneAdetAction = () => {
        const iframeDocument = findTargetIframe('ggbs.numune.numune.html');
        return numuneGenelBilgiler(iframeDocument)
            .then(() => {
                if (!iframeDocument) {
                    GM_log('Target iframe for Adet Numune Bilgileri not found or not visible');
                    return;
                }
                return selectDropdown(iframeDocument, 'CDYN_135', 25, { byValue: true, delayMs: 250 })
                    .then(() => selectDropdown(iframeDocument, 'CDYN_137', 49, { byValue: true }))
                    .then(() => selectDropdown(iframeDocument, 'CDYN_144', 49, { byValue: true }))
                    .then(() => {
                        const startDate = `${currentDate} 09:00`;
                        const field172 = iframeDocument.getElementById('F_172');
                        if (field172) {
                            field172.value = startDate;
                            triggerEvent(field172, 'change');
                            triggerEvent(field172, 'input');
                        }
                        const field133 = iframeDocument.getElementById('F_133');
                        const field140 = iframeDocument.getElementById('F_140');
                        if (field133) {
                            field133.value = '';
                            triggerEvent(field133, 'change');
                            triggerEvent(field133, 'input');
                        }
                        if (field140) {
                            field140.value = '';
                            triggerEvent(field140, 'change');
                            triggerEvent(field140, 'input');
                        }
                    });
            })
            .then(() => {
                const additionalButtonLabel = prompt("Lütfen 3 haneli kodu girin:");
                if (additionalButtonLabel) {
                    triggerAdditionalButton(iframeDocument, additionalButtonLabel);
                }
            })
            .catch(error => GM_log('Error in numuneAdetAction: ' + error));
    };

    const numuneLitreAction = () => {
        const iframeDocument = findTargetIframe('ggbs.numune.numune.html');
        return numuneGenelBilgiler(iframeDocument)
            .then(() => {
                if (!iframeDocument) {
                    GM_log('Target iframe for Litre Numune Bilgileri not found or not visible');
                    return;
                }
                return selectDropdown(iframeDocument, 'CDYN_135', 2, { byValue: true, delayMs: 250 })
                    .then(() => selectDropdown(iframeDocument, 'CDYN_137', 13, { byValue: true }))
                    .then(() => selectDropdown(iframeDocument, 'CDYN_144', 13, { byValue: true }))
                    .then(() => {
                        const startDate = `${currentDate} 09:00`;
                        const field172 = iframeDocument.getElementById('F_172');
                        if (field172) {
                            field172.value = startDate;
                            triggerEvent(field172, 'change');
                            triggerEvent(field172, 'input');
                        }
                        const field133 = iframeDocument.getElementById('F_133');
                        const field140 = iframeDocument.getElementById('F_140');
                        if (field133) {
                            field133.value = '';
                            triggerEvent(field133, 'change');
                            triggerEvent(field133, 'input');
                        }
                        if (field140) {
                            field140.value = '';
                            triggerEvent(field140, 'change');
                            triggerEvent(field140, 'input');
                        }
                    });
            })
            .then(() => {
                const additionalButtonLabel = prompt("Lütfen 3 haneli kodu girin:");
                if (additionalButtonLabel) {
                    triggerAdditionalButton(iframeDocument, additionalButtonLabel);
                }
            })
            .catch(error => GM_log('Error in numuneLitreAction: ' + error));
    };

    const numuneLabGonderAction = () => {
        const iframeDocument = findTargetIframe('ggbs.numune.numune.html');
        if (iframeDocument) {
            // RADIO245 tıkla
            const radio245 = iframeDocument.getElementById('RADIO245');
            if (radio245) {
                radio245.click();
                GM_log('RADIO245 ID\'li düğme tıklandı');
            } else {
                GM_log('RADIO245 bulunamadı');
            }

            // F_261 doldur
            const field261 = iframeDocument.getElementById('F_261');
            if (field261) {
                field261.value = currentDate;
                field261.focus();
                triggerEvent(field261, 'keydown');
                triggerEvent(field261, 'keypress');
                triggerEvent(field261, 'input');
                triggerEvent(field261, 'keyup');
                triggerEvent(field261, 'change');
                field261.click();
                setTimeout(() => {
                    field261.blur();
                    iframeDocument.body.click(); // Ekstra güvenlik için body tıklaması
                    GM_log('F_261 için body\'ye manuel tıklama simüle edildi');
                }, 200); // Blur ve tıklama için gecikme
                GM_log('F_261 alanına tarih dolduruldu: ' + currentDate);
            } else {
                GM_log('F_261 alanı bulunamadı');
            }

            // F_264 doldur
            const evrakSayisi = prompt("Evrak sayısını giriniz:");
            if (evrakSayisi !== null && evrakSayisi.trim() !== "") {
                const field264 = iframeDocument.getElementById('F_264');
                if (field264) {
                    field264.value = evrakSayisi;
                    field264.focus();
                    triggerEvent(field264, 'keydown');
                    triggerEvent(field264, 'keypress');
                    triggerEvent(field264, 'input');
                    triggerEvent(field264, 'keyup');
                    triggerEvent(field264, 'change');
                    field264.click();
                    setTimeout(() => field264.blur(), 100);
                    GM_log('F_264 alanına evrak sayısı yazıldı: ' + evrakSayisi);
                } else {
                    GM_log('F_264 alanı bulunamadı');
                }
            } else {
                GM_log('Evrak sayısı girilmedi');
            }

            // B_273 tıkla
            const dropdown150 = iframeDocument.getElementById('CDYN_150');
            let labValue = 'Bilinmeyen Laboratuvar';
            if (dropdown150 && dropdown150.selectedIndex >= 0) {
                labValue = dropdown150.options[dropdown150.selectedIndex].text;
            }
            const confirmation = confirm(`Numunenin ${labValue}'ye gönderilecek, laboratuvarı kontrol ettiğinizden emin misiniz?`);
            if (confirmation) {
                const button273 = iframeDocument.getElementById('B_273');
                if (button273) {
                    setTimeout(() => {
                        triggerEvent(button273, 'mousedown');
                        triggerEvent(button273, 'mouseup');
                        button273.click();
                        GM_log('B_273 butonu tıklandı');
                        const parentElement = button273.parentElement;
                        if (parentElement) {
                            parentElement.click();
                            GM_log('B_273 üst elementine manuel tıklama simüle edildi');
                        }
                    }, 500);
                } else {
                    GM_log('B_273 butonu bulunamadı');
                }
            } else {
                GM_log('Kullanıcı B_273 tıklamasını iptal etti');
            }
        } else {
            GM_log('Target iframe for Numune Bilgileri not found or not visible');
        }
    };

    const ekleButtonAction = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalat.html');
        if (iframeDocument) {
            clickButtonWithId(iframeDocument, 'B_309')
                .catch(error => GM_log('Error performing actions for Ekle button: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const denetimekleButtonAction = () => {
        const iframeDocument = findTargetIframe('ggbs.denetim.denetleme.html');
        if (iframeDocument) {
            clickButtonWithId(iframeDocument, 'B_23')
                .catch(error => GM_log('Error performing actions for denetimekle button: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const denAcButtonAction = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalatOnay.html');
        if (iframeDocument) {
            clickButtonWithId(iframeDocument, 'B_189')
                .catch(error => GM_log('Error performing actions for Den.Aç button: ' + error));
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const buttondokumanonayla = () => {
        const iframeDocument = findTargetIframe('ggbs.ithalat.ithalatOnay.html');
        if (iframeDocument) {
            openArea(iframeDocument);
            clickButtonWithId(iframeDocument, 'RADIO122') // Basit tıklama kullanılacak
                .then(() => waitForElement(iframeDocument, 'CDYN_126'))
                .then(() => selectDropdown(iframeDocument, 'CDYN_126', 2))
                .then(() => {
                    const field129 = iframeDocument.getElementById('F_129');
                    if (field129) {
                        field129.value = currentDate;
                        triggerEvent(field129, 'change');
                        triggerEvent(field129, 'input');
                        GM_log('F_129 alanına tarih dolduruldu: ' + currentDate);
                    } else {
                        GM_log('F_129 alanı bulunamadı');
                    }
                    return waitForElement(iframeDocument, 'B_32');
                })
                .then(() => {
                    return new Promise((resolve, reject) => {
                        const confirmAction = confirm("ID numarası verilecek; emin misiniz?");
                        if (confirmAction) resolve();
                        else reject(new Error("İşlem kullanıcı tarafından iptal edildi."));
                    });
                })
                .then(() => clickButtonWithId(iframeDocument, 'B_32'))
                .catch(error => {
                    if (error.message === "İşlem kullanıcı tarafından iptal edildi.") {
                        GM_log('İşlem kullanıcı tarafından iptal edildi.');
                    } else {
                        GM_log('Error performing actions for buttondokumanonayla: ' + error);
                    }
                });
        } else {
            GM_log('Target iframe not found or not visible');
        }
    };

    const numuneeklebuttonaction = () => {
        const iframeDocument = findTargetIframe('ggbs.denetim.denetleme.html');
        if (iframeDocument) {
            const numunelerTab = iframeDocument.getElementById('TPTD3308');
            if (numunelerTab) {
                numunelerTab.click();
                if (typeof C !== 'undefined' && C.showPageTABAREA) {
                    C.showPageTABAREA(C_308, 2);
                }
            }
            clickButtonWithId(iframeDocument, 'B_380')
                .then((clicked) => {
                    if (clicked) {
                        GM_log('Clicked on B_380 button in Denetim iframe');
                    }
                })
                .catch(error => GM_log('Error clicking B_380 button: ' + error));
        } else {
            GM_log('Target iframe for Denetim not found or not visible');
        }
    };

    const createSquareButtons = (parentElement) => {
        const buttonLabels = ['ANK', 'BAL', 'INT', 'İST', 'İZM', 'İL', 'STA', 'MGA', 'MRL', 'MSM', 'PMG', 'SİA', 'SİM', 'SOU'];
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'square-button-container';
        buttonContainer.style.display = 'grid';
        buttonContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        buttonLabels.forEach((label, index) => {
            const button = document.createElement('button');
            button.innerText = label;
            button.addEventListener('click', () => {
                const iframeDocument = findTargetIframe('ggbs.numune.numune.html');
                if (iframeDocument) {
                    selectDropdown(iframeDocument, 'CDYN_150', index + 1);
                } else {
                    GM_log('Target iframe for Numune Bilgileri not found or not visible');
                }
            });
            buttonContainer.appendChild(button);
        });
        parentElement.appendChild(buttonContainer);
    };

    const addFloatingSidebar = () => {
        const sidebar = document.createElement('div');
        sidebar.id = 'floatingSidebar';

        const dateContainer = document.createElement('div');
        dateContainer.style.marginBottom = '5px';
        const dateInput = document.createElement('input');
        dateInput.type = 'text';
        dateInput.id = 'sidebarDate';
        dateInput.value = currentDate;
        dateInput.style.width = '100%';
        dateInput.style.padding = '2px';
        dateInput.style.fontSize = '12px';
        dateInput.style.borderRadius = '3px';
        dateInput.style.border = '1px solid #ccc';

        dateInput.addEventListener('input', (e) => {
            currentDate = e.target.value;
            GM_log('Tarih güncellendi: ' + currentDate);
        });

        dateContainer.appendChild(dateInput);
        sidebar.appendChild(dateContainer);

        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggleSidebar';
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        toggleButton.onclick = function() {
            const sidebarElement = document.getElementById('floatingSidebar');
            sidebarElement.style.display = sidebarElement.style.display === 'none' ? 'block' : 'none';
        };

        const groupedIframeActions = [
            {
                groupName: "İthalat İşlemleri",
                buttons: [
                    {
                        text: 'İthalat Aç',
                        action: findAndClickIthalat,
                    },
                    {
                        text: 'Ek2 ve Gıda San.',
                        action: button1Action,
                        additionalButtons: [
                            { text: 'Ony', action: onyButtonAction },
                            { text: 'Ekle', action: ekleButtonAction }
                        ]
                    },
                    {
                        text: 'Ek2 ve Piy. Arz.',
                        action: button2Action,
                        additionalButtons: [
                            { text: 'Ony', action: onyButtonAction },
                            { text: 'Ekle', action: ekleButtonAction }
                        ]
                    }
                ]
            },
            {
                groupName: "Onay İşlemleri",
                buttons: [
                    {
                        text: 'Miktar ve Gümrük seç',
                        action: button3Action,
                        additionalButtons: [
                            { text: 'Onayla', action: buttondokumanonayla, class: 'onayla-button' }
                        ]
                    },
                    {
                        text: 'Analize',
                        action: button4Action,
                        additionalButton: { text: 'Den.Say.Aç', action: denAcButtonAction }
                    }
                ]
            },
            {
                groupName: "Denetim İşlemleri",
                buttons: [
                    {
                        text: 'Dntm. İşlemleri',
                        action: button5Action,
                        additionalButtons: [
                            { text: 'DenEkle', action: denetimekleButtonAction }
                        ]
                    },
                    { text: 'Numune Ekle', action: numuneeklebuttonaction }
                ]
            },
            {
                groupName: "Numune İşlemleri",
                buttons: [
                    { text: 'Numune-KG', action: numuneKgAction },
                    { text: 'Numune-Adet', action: numuneAdetAction },
                    { text: 'Numune-Litre', action: numuneLitreAction },
                    { text: 'Numune Lab Gönder', action: numuneLabGonderAction }
                ]
            }
        ];

        groupedIframeActions.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group-div';
            groupDiv.style.marginBottom = '1px';
            groupDiv.style.border = '1px solid #ccc';
            groupDiv.style.padding = '2px';
            groupDiv.style.borderRadius = '5px';
            groupDiv.style.backgroundColor = 'rgba(233, 233, 233, 0.7)';

            const groupTitle = document.createElement('h3');
            groupTitle.innerText = group.groupName;
            groupDiv.appendChild(groupTitle);

            group.buttons.forEach(buttonInfo => {
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';
                buttonContainer.style.display = 'flex';
                buttonContainer.style.marginBottom = '1px';

                const button = document.createElement('button');
                button.className = 'normal-button';
                button.innerText = buttonInfo.text;
                button.addEventListener('click', buttonInfo.action);
                button.style.flex = '1';
                buttonContainer.appendChild(button);

                if (buttonInfo.additionalButtons) {
                    buttonInfo.additionalButtons.forEach(additionalButton => {
                        const addButton = document.createElement('button');
                        addButton.innerText = additionalButton.text;
                        addButton.addEventListener('click', additionalButton.action);
                        if (additionalButton.class) addButton.classList.add(additionalButton.class);
                        addButton.style.width = 'auto';
                        addButton.style.marginLeft = '2px';
                        buttonContainer.appendChild(addButton);
                    });
                } else if (buttonInfo.additionalButton) {
                    const additionalButton = document.createElement('button');
                    additionalButton.innerText = buttonInfo.additionalButton.text;
                    additionalButton.addEventListener('click', buttonInfo.additionalButton.action);
                    additionalButton.style.width = 'auto';
                    additionalButton.style.marginLeft = '2px';
                    buttonContainer.appendChild(additionalButton);
                }

                groupDiv.appendChild(buttonContainer);
            });

            if (group.groupName === "Numune İşlemleri") {
                createSquareButtons(groupDiv);
            }

            sidebar.appendChild(groupDiv);
        });

        GM_addStyle(`
            .confirm-custom {
                font-size: 18px !important;
                color: red !important;
            }
        `);

        document.body.appendChild(toggleButton);
        document.body.appendChild(sidebar);
    };

    function triggerEvent(element, eventName) {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent(eventName, false, true);
            element.dispatchEvent(evt);
        } else {
            element.fireEvent("on" + eventName);
        }
    }

    GM_addStyle(`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
        #floatingSidebar {
            position: fixed;
            top: 40px;
            right: 20px;
            width: 150px;
            background-color: rgba(242, 242, 242, 0.9);
            border: 1px solid #ccc;
            border-radius: 1px;
            padding: 1px;
            z-index: 10000;
            max-height: 95vh;
            overflow-y: auto;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
            font-family: sans-serif;
        }
        #floatingSidebar button {
            display: inline-block;
            margin-bottom: 2px;
            padding: 3px 5px;
            border: none;
            border-radius: 3px;
            background-color: #4CAF50;
            color: white;
            font-size: 10px;
            cursor: pointer;
            transition: background-color 0.2s;
            white-space: normal;
            overflow: hidden;
            text-overflow: ellipsis;
            height: auto;
            min-height: 30px;
            line-height: 1.2;
        }
        #floatingSidebar button:hover {
            background-color: #45a049;
        }
        #floatingSidebar h3 {
            font-size: 14px;
            color: #333;
            margin: 2px 0;
            padding: 0;
        }
        #toggleSidebar {
            position: fixed;
            top: 25px;
            right: 5px;
            z-index: 10001;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 3px 6px;
            cursor: pointer;
            font-size: 11px;
        }
        #floatingSidebar .group-div {
            margin-bottom: 3px;
            border: 1px solid #ccc;
            padding: 2px;
            border-radius: 3px;
            background-color: rgba(233, 233, 233, 0.7);
        }
        #floatingSidebar .button-container {
            display: flex;
            margin-bottom: 2px;
            justify-content: space-between;
            flex-wrap: wrap;
        }
        #floatingSidebar .button-container button:first-child {
            flex: 0 1 auto;
            font-size: 12px;
            margin-bottom: 2px;
        }
        #floatingSidebar .button-container button:not(:first-child) {
            flex: 0 1 auto;
            margin-left: 2px;
            padding: 1px 3px;
            font-size: 12px;
            min-width: 28px;
            min-height: 20px;
        }
        #floatingSidebar .square-button-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2px;
            margin-top: 3px;
            font-size: 12px;
        }
        #floatingSidebar .square-button-container button {
            padding: 2px;
            font-size: 9px;
            width: 100%;
            height: 20px;
            min-height: unset;
            font-size: 12px;
        }
        #floatingSidebar .onayla-button {
            background-color: #ff4444 !important;
        }
    `);

    if (document.readyState === 'loading') {
        window.addEventListener('load', addFloatingSidebar);
    } else {
        addFloatingSidebar();
    }
})();