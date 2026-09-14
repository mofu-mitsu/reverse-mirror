const GAS_URL = "https://script.google.com/macros/s/AKfycbwvWAFJhcpLH_aWxxNord2Cc6SCl2MbpkoB0qiiGjeoDF0QCKKOHY44J_QpwIYgk_iv/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    const reverseBtn = document.getElementById("reverse-btn");
    const resultSection = document.getElementById("result-section");
    const myTypeBoard = document.getElementById("my-type-board");
    const reverseBoard = document.getElementById("reverse-board");
    const saveBtn = document.getElementById("save-btn");
    const shareBtn = document.getElementById("share-btn");

    reverseBtn.addEventListener("click", () => {
        myTypeBoard.innerHTML = ''; 
        reverseBoard.innerHTML = ''; 

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
                const originalUpper = rawVal.toUpperCase();
                const reversedUpper = item.func(originalUpper).toUpperCase();
                
                // 👤 常に表示される自認用の白カード
                createStaticCard(key, originalUpper);
                
                // 🪞 常に表示されてパタパタ裏返る演出用のオセロカード
                createFlipCard(key, originalUpper, reversedUpper);
                
                payloadToGAS[key] = { original: originalUpper, reverse: reversedUpper };
            }
        }

        if (hasInput) {
            resultSection.classList.remove("hidden");
            
            // アニメーションを確実に発火させる
            void resultSection.offsetWidth; 

            sendDataToGAS(payloadToGAS);

            // フリップカードの裏返り演出
            setTimeout(() => {
                const cards = document.querySelectorAll('.flip-card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('flipped');
                    }, index * 150);
                });
            }, 50); 
        } else {
            alert("最低一つはタイプを入力してね！");
        }
    });

    function createStaticCard(title, value) {
        const card = document.createElement("div");
        card.className = "static-card";
        card.innerHTML = `<div class="card-title">${title}</div><div class="card-value">${value}</div>`;
        myTypeBoard.appendChild(card);
    }

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
        reverseBoard.appendChild(card);
    }

    // --- 📸 画像保存ロジック ---
    saveBtn.addEventListener("click", () => {
        const target = document.getElementById("export-container");
        
        // キャプチャする瞬間だけ、フリップカードの裏面（黒）を平面にする（スケスケ対策）
        target.classList.add("capture-mode");

        setTimeout(() => {
            html2canvas(target, { backgroundColor: "#f7f9fa", scale: 2 }).then(canvas => {
                // キャプチャが終わったら元に戻す
                target.classList.remove("capture-mode");

                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

                if (isMobile) {
                    const modal = document.getElementById("image-modal");
                    const modalImage = document.getElementById("modal-image");
                    modalImage.src = canvas.toDataURL('image/png');
                    modal.classList.remove("hidden");
                } else {
                    const link = document.createElement('a');
                    link.download = 'reverse-mirror.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            });
        }, 150); 
    });

    document.getElementById("modal-close").addEventListener("click", () => {
        document.getElementById("image-modal").classList.add("hidden");
    });

    function sendDataToGAS(dataObj) {
        if (!GAS_URL) return;
        fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp: new Date().toISOString(), data: dataObj })
        }).catch(err => console.error("GAS Send Error:", err));
    }

    shareBtn.addEventListener("click", async () => {
        if (navigator.share) {
            await navigator.share({
                title: 'Reverse Mirror',
                text: '私の自認を反転させて「もう一つの自分」を探しました！ #ReverseMirror',
                url: window.location.href
            }).catch(err => console.log('Share failed:', err));
        } else {
            alert("お使いのブラウザはシェア機能に対応していません。URLをコピーして共有してね！");
        }
    });

    // --- 各類型の変換ロジック ---
    function getNSFromInputs() {
        const mbti = document.getElementById("mbti").value.toUpperCase();
        const socio = document.getElementById("socionics").value.toUpperCase();
        
        const nTypes = ['ILE', 'LII', 'EIE', 'IEI', 'ILI', 'LIE', 'EII', 'IEE'];
        const sTypes = ['SEI', 'ESE', 'LSI', 'SLE', 'SEE', 'ESI', 'LSE', 'SLI'];
        
        if (mbti.includes('N') || socio.includes('N') || nTypes.some(t => socio.includes(t))) return 'N';
        if (mbti.includes('S') || socio.includes('S') || sTypes.some(t => socio.includes(t))) return 'S';
        return null;
    }

    function getTFFromInputs() {
        const mbti = document.getElementById("mbti").value.toUpperCase();
        const socio = document.getElementById("socionics").value.toUpperCase();

        const tTypes = ['LII', 'LSI', 'ILE', 'SLE', 'ILI', 'SLI', 'LIE', 'LSE'];
        const fTypes = ['EIE', 'ESE', 'SEI', 'IEI', 'ESI', 'SEE', 'EII', 'IEE'];

        if (mbti.includes('T') || socio.includes('T') || tTypes.some(t => socio.includes(t))) return 'T';
        if (mbti.includes('F') || socio.includes('F') || fTypes.some(t => socio.includes(t))) return 'F';
        return null;
    }

    function reverseMBTI(val) {
        const map = { 'E':'I', 'I':'E', 'N':'N', 'S':'S', 'T':'F', 'F':'T', 'J':'P', 'P':'J' };
        return val.toUpperCase().split('').map(c => map[c] || c).join('');
    }

    function reverseSocionics(val) {
        const map3 = { "ILE":"EII", "SEI":"LSE", "ESE":"SLI", "LII":"IEE", "EIE":"ILI", "LSI":"SEE", "SLE":"ESI", "IEI":"LIE", "SEE":"LSI", "ILI":"EIE", "LIE":"IEI", "ESI":"SLE", "LSE":"SEI", "EII":"ILE", "IEE":"LII", "SLI":"ESE" };
        const v = val.toUpperCase();
        if (map3[v]) return map3[v];
        if (val.length === 4) {
            const map = { 'E':'I', 'I':'E', 'N':'N', 'S':'S', 'T':'F', 'F':'T', 'J':'P', 'P':'J', 'j':'p', 'p':'j' };
            return val.split('').map(c => map[c.toUpperCase()] ? (c === c.toLowerCase() ? map[c.toUpperCase()].toLowerCase() : map[c.toUpperCase()]) : c).join('');
        }
        return val;
    }

    function reversePsycho(val) {
        const psychoMap = { "LVFE":"EVLF", "EVLF":"LVFE", "LVEF":"EVFL", "EVFL":"LVEF", "VLFE":"ELVF", "ELVF":"VLFE", "LFEV":"EFVL", "EFVL":"LFEV", "LFVE":"EFLV", "EFLV":"LFVE", "FLVE":"LEFV", "LEFV":"FLVE", "VLEF":"FELV", "FVLE":"FELV" };
        const v = val.toUpperCase();
        if (v === "FELV") return document.getElementById("mbti").value.toUpperCase() === "ESTP" ? "FVLE" : "VLEF";
        if (psychoMap[v]) return psychoMap[v];
        if (v.length === 4) return v[3] + v[1] + v[0] + v[2];
        return val;
    }

    function reverseAmatorica(val) {
        const v = val.toUpperCase();
        return v.length === 4 ? v[3] + v[1] + v[0] + v[2] : val;
    }

    function reverseEnneagram(val) {
        const map = { "1W2":"7W8", "1W9":"6W7", "2W1":"9W8", "2W3":"5W4", "3W2":"4W3", "3W4":"4W5", "4W3":"3W2", "4W5":"3W4", "5W4":"2W3", "5W6":"7W6", "6W5":"8W7", "6W7":"1W9", "7W6":"5W6", "7W8":"1W2", "8W7":"6W5", "8W9":"9W1", "9W1":"8W9", "9W8":"2W1" };
        return map[val.toUpperCase()] || val;
    }

    function reverseTritype(val, enneaVal) {
        const centerMap = { '5':'head', '6':'head', '7':'head', '2':'heart', '3':'heart', '4':'heart', '8':'gut', '9':'gut', '1':'gut' };
        const defaultFlip = { '5':'7', '7':'6', '6':'5', '2':'4', '4':'3', '3':'2', '8':'1', '1':'9', '9':'8' };
        let revCore = null, revCenter = null;
        if (enneaVal) {
            const rEnnea = reverseEnneagram(enneaVal);
            if (rEnnea) { revCore = rEnnea[0]; revCenter = centerMap[revCore]; }
        }
        let res = [];
        for (let c of val) {
            if (!centerMap[c]) continue;
            let f = defaultFlip[c];
            if (revCenter && centerMap[c] === revCenter) f = revCore;
            res.push(f);
        }
        if (revCore && res.includes(revCore)) {
            res = res.filter(x => x !== revCore);
            res.unshift(revCore);
        }
        return res.join('');
    }

    function reverseInstincts(val) {
        const v = val.toLowerCase();
        if (!v.includes('/')) return val;
        const [f, s] = v.split('/');
        const blind = ['sp', 'so', 'sx'].find(x => x !== f && x !== s);
        return blind ? `${blind}/${s}` : val;
    }

    function reverseDCNH(val) {
        const map = { 'D':'H', 'H':'D', 'C':'N', 'N':'C' };
        return val.toUpperCase().split('').map(c => map[c] || c).join('');
    }

    function reverseJung(val) {
        // 💡 全角カッコ「（ ）」が入力されても半角「( )」に自動変換して処理するよ！
        let v = val.toUpperCase().replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')');
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
        const flipFunc = x => (x === 'T' ? 'F' : (x === 'F' ? 'T' : x));
        
        if (f2) {
            return `${att}${flipFunc(f2)}(${flipFunc(f1)})`;
        } else {
            return `${att}${flipFunc(f1)}`; 
        }
    }
});
// 👆 ここまでしっかりコピーしてね！！
