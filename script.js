// ↓みつきが教えてくれたGAS URLをここにセット！
const GAS_URL = "https://script.google.com/macros/s/AKfycbyiQ8X8mtypSZoIdB1QP1joUyBJ2zWRqY68oP2oEc0eNgUtIveH2fBKlXQtDZgCeB_9vQ/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    const reverseBtn = document.getElementById("reverse-btn");
    const resultSection = document.getElementById("result-section");
    const resultBoard = document.getElementById("result-board");
    const actionBtns = document.getElementById("action-buttons-area");
    const saveBtn = document.getElementById("save-btn");
    const shareBtn = document.getElementById("share-btn");

    reverseBtn.addEventListener("click", () => {
        resultBoard.innerHTML = ''; 
        const enneaVal = document.getElementById("ennea").value.trim();
        let payloadToGAS = {}; 

        const data = {
            "MBTI": { val: document.getElementById("mbti").value, func: reverseMBTI },
            "Socionics": { val: document.getElementById("socionics").value, func: reverseSocionics },
            "Psychosophy": { val: document.getElementById("psycho").value, func: reversePsycho },
            "Enneagram": { val: enneaVal, func: reverseEnneagram },
            "Tritype": { val: document.getElementById("tritype").value, func: (val) => reverseTritype(val, enneaVal) },
            "Instincts": { val: document.getElementById("instinct").value, func: reverseInstincts },
            "DCNH": { val: document.getElementById("dcnh").value, func: reverseDCNH },
            "Classic Jung": { val: document.getElementById("jung").value, func: reverseJung },
            "Amatorica": { val: document.getElementById("amatorica").value, func: reverseAmatorica },
            "Temporistics": { val: document.getElementById("tempo").value, func: reverseAmatorica },
        };

        let hasInput = false;

        for (const [key, item] of Object.entries(data)) {
            const rawVal = item.val.trim();
            if (rawVal) {
                hasInput = true;
                const reversedVal = item.func(rawVal);
                // シンプルな白黒カードを生成
                createFlipCard(key, rawVal.toUpperCase(), reversedVal.toUpperCase());
                
                payloadToGAS[key] = {
                    original: rawVal.toUpperCase(),
                    reverse: reversedVal.toUpperCase()
                };
            }
        }

        if (hasInput) {
            resultSection.classList.remove("hidden");
            actionBtns.classList.remove("hidden"); // 保存・シェアボタンを表示
            
            sendDataToGAS(payloadToGAS);

            setTimeout(() => {
                const cards = document.querySelectorAll('.flip-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('flipped');
                    }, index * 150);
                });
            }, 100);
        } else {
            alert("最低一つはタイプを入力してね！");
        }
    });

    // 初期デザインのシンプルな裏表カード
    function createFlipCard(title, original, reversed) {
        const card = document.createElement("div");
        card.className = "flip-card";
        
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="card-title">${title}</div>
                    <div class="card-value">${original}</div>
                </div>
                <div class="flip-card-back">
                    <div class="card-title">${title} (Reverse)</div>
                    <div class="card-value">${reversed}</div>
                </div>
            </div>
        `;
        resultBoard.appendChild(card);
    }

    function sendDataToGAS(dataObj) {
        if (!GAS_URL) return;
        const timestamp = new Date().toISOString();
        const payload = { timestamp, data: dataObj };

        fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("GAS Send Error:", err));
    }

    // --- 各類型の変換ロジック ---
    function getNSFromInputs() {
        const mbti = document.getElementById("mbti").value.toUpperCase();
        const socio = document.getElementById("socionics").value.toUpperCase();
        if (mbti.includes('N') || socio.includes('N') || socio.includes('ILE') || socio.includes('LII') || socio.includes('EIE') || socio.includes('IEI') || socio.includes('ILI') || socio.includes('LIE') || socio.includes('EII') || socio.includes('IEE')) return 'N';
        if (mbti.includes('S') || socio.includes('S') || socio.includes('SEI') || socio.includes('ESE') || socio.includes('LSI') || socio.includes('SLE') || socio.includes('SEE') || socio.includes('ESI') || socio.includes('LSE') || socio.includes('SLI')) return 'S';
        return null;
    }

    function getTFFromInputs() {
        const mbti = document.getElementById("mbti").value.toUpperCase();
        const socio = document.getElementById("socionics").value.toUpperCase();
        if (mbti.includes('T') || socio.includes('T') || socio.includes('LII') || socio.includes('LSI') || socio.includes('ILE') || socio.includes('SLE') || socio.includes('ILI') || socio.includes('SLI') || socio.includes('LIE') || socio.includes('LSE')) return 'T';
        if (mbti.includes('F') || socio.includes('F') || socio.includes('EIE') || socio.includes('ESE') || socio.includes('SEI') || socio.includes('IEI') || socio.includes('ESI') || socio.includes('SEE') || socio.includes('EII') || socio.includes('IEE')) return 'F';
        return null;
    }

    function reverseMBTI(val) {
        const map = { 'E':'I', 'I':'E', 'N':'N', 'S':'S', 'T':'F', 'F':'T', 'J':'P', 'P':'J' };
        return val.toUpperCase().split('').map(c => map[c] || c).join('');
    }

    function reverseSocionics(val) {
        const type = val.toUpperCase();
        const map3 = {
            "ILE": "EII", "SEI": "LSE", "ESE": "SLI", "LII": "IEE",
            "EIE": "ILI", "LSI": "SEE", "SLE": "ESI", "IEI": "LIE",
            "SEE": "LSI", "ILI": "EIE", "LIE": "IEI", "ESI": "SLE",
            "LSE": "SEI", "EII": "ILE", "IEE": "LII", "SLI": "ESE"
        };
        if (map3[type]) return map3[type];
        if (val.length === 4) {
            const map = { 'E':'I', 'I':'E', 'N':'N', 'S':'S', 'T':'F', 'F':'T', 'J':'P', 'P':'J', 'j':'p', 'p':'j' };
            return val.split('').map(c => map[c.toUpperCase()] ? (c === c.toLowerCase() ? map[c.toUpperCase()].toLowerCase() : map[c.toUpperCase()]) : c).join('');
        }
        return val;
    }

    const psychoMap = {
        "LVFE": "EVLF", "EVLF": "LVFE", "LVEF": "EVFL", "EVFL": "LVEF",
        "VLFE": "ELVF", "ELVF": "VLFE", "LFEV": "EFVL", "EFVL": "LFEV",
        "LFVE": "EFLV", "EFLV": "LFVE", "FLVE": "LEFV", "LEFV": "FLVE",
        "VLEF": "FELV", "FVLE": "FELV" 
    };

    function reversePsycho(val) {
        const v = val.toUpperCase();
        const mbti = document.getElementById("mbti").value.toUpperCase();
        if (v === "FELV") return mbti === "ESTP" ? "FVLE" : "VLEF";
        if (psychoMap[v]) return psychoMap[v];
        if (v.length === 4) return v[3] + v[1] + v[0] + v[2];
        return val;
    }

    function reverseAmatorica(val) {
        const v = val.toUpperCase();
        if (v.length === 4) return v[3] + v[1] + v[0] + v[2];
        return val;
    }

    function reverseEnneagram(val) {
        const map = {
            "1W2": "7W8", "1W9": "6W7", "2W1": "9W8", "2W3": "5W4",
            "3W2": "4W3", "3W4": "4W5", "4W3": "3W2", "4W5": "3W4",
            "5W4": "2W3", "5W6": "7W6", "6W5": "8W7", "6W7": "1W9",
            "7W6": "5W6", "7W8": "1W2", "8W7": "6W5", "8W9": "9W1",
            "9W1": "8W9", "9W8": "2W1"
        };
        return map[val.toUpperCase()] || val;
    }

    function reverseTritype(val, enneaVal) {
        const centerMap = { '5':'head', '6':'head', '7':'head', '2':'heart', '3':'heart', '4':'heart', '8':'gut', '9':'gut', '1':'gut' };
        const defaultFlip = { '5':'7', '7':'6', '6':'5', '2':'4', '4':'3', '3':'2', '8':'1', '1':'9', '9':'8' };
        
        let reverseEnneaCore = null;
        let reverseEnneaCenter = null;
        
        if (enneaVal) {
            const revEnnea = reverseEnneagram(enneaVal);
            if (revEnnea) {
                reverseEnneaCore = revEnnea[0]; 
                reverseEnneaCenter = centerMap[reverseEnneaCore];
            }
        }

        let results = [];
        for (let char of val) {
            if (!centerMap[char]) continue; 
            let flipped = defaultFlip[char];
            if (reverseEnneaCenter && centerMap[char] === reverseEnneaCenter) {
                flipped = reverseEnneaCore;
            }
            results.push(flipped);
        }

        if (reverseEnneaCore && results.includes(reverseEnneaCore)) {
            results = results.filter(x => x !== reverseEnneaCore);
            results.unshift(reverseEnneaCore);
        }
        return results.join('');
    }

    function reverseInstincts(val) {
        const v = val.toLowerCase();
        if (!v.includes('/')) return val;
        const [first, second] = v.split('/');
        const all = ['sp', 'so', 'sx'];
        const blind = all.find(x => x !== first && x !== second);
        return blind ? `${blind}/${second}` : val;
    }

    function reverseDCNH(val) {
        const map = { 'D':'H', 'H':'D', 'C':'N', 'N':'C' };
        return val.toUpperCase().split('').map(c => map[c] || c).join('');
    }

    function reverseJung(val) {
        let v = val.toUpperCase().replace(/\s+/g, '');
        const ns = getNSFromInputs();
        const tf = getTFFromInputs();

        const match = v.match(/^([EI])([NSTF])(?:\(([NSTF])\))?$/);
        if (!match) return val; 

        let att = match[1]; 
        let f1 = match[2];  
        let f2 = match[3];  

        if (!f2) {
            if (['T', 'F'].includes(f1) && ns) f2 = ns;
            else if (['N', 'S'].includes(f1) && tf) f2 = tf;
        }

        att = att === 'E' ? 'I' : 'E';

        const flipFunc = (func) => {
            if (func === 'T') return 'F';
            if (func === 'F') return 'T';
            return func; 
        };

        if (f2) {
            let newF1 = flipFunc(f2);
            let newF2 = flipFunc(f1);
            return `${att}${newF1}(${newF2})`;
        } else {
            return `${att}${flipFunc(f1)}`; 
        }
    }

    // --- 保存 & シェア機能 ---
    saveBtn.addEventListener("click", () => {
        // 画像に不要なテキストやボタンを隠す
        const hideElements = document.querySelectorAll('.hide-on-capture');
        hideElements.forEach(el => el.style.display = 'none');

        // 入力フォームと結果のカードをまとめたコンテナをキャプチャ対象にする
        const target = document.getElementById("export-container");
        
        html2canvas(target, { backgroundColor: "#f7f9fa", scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'reverse-mirror.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 隠した要素を元に戻す
            hideElements.forEach(el => el.style.display = '');
        });
    });

    shareBtn.addEventListener("click", async () => {
        const shareData = {
            title: 'Reverse Mirror',
            text: '私の自認を反転させて「もう一つの自分」を探しました！ #ReverseMirror #ソシオニクス #MBTI',
            url: window.location.href
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            alert("お使いのブラウザはシェア機能に対応していません。URLをコピーして共有してね！");
        }
    });
});