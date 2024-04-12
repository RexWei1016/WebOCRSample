document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');
    var clearButton = document.getElementById('clear');
    var resultDisplay = document.getElementById('ocrResult');
    var plateFormat = document.getElementById('plateFormat');  // 獲取車牌格式選擇器

    var constraints = {
        video: { facingMode: "environment" }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject = stream;
    }).catch(function(error) {
        console.error("無法訪問攝像頭，錯誤：", error);
    });

    snapButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, 640, 480);
        setTimeout(function() {
            let imageData = context.getImageData(0, 0, canvas.width, canvas.height); // 取得整個畫布的影像數據
            processImage(imageData);
            var imgData = canvas.toDataURL('image/png'); // 將整個處理過的畫布轉換為DataURL
            Tesseract.recognize(
                imgData,
                'eng',
                {
                    logger: m => console.log(m)
                }
            ).then(function({ data: { text } }) {
                let regex = new RegExp(plateFormat.value);  // 使用選定的車牌規則
                let formattedText = text.match(regex);
                resultDisplay.innerText = formattedText ? formattedText[0] : "未識別到有效車牌";
            });
        }, 100); // 確保繪製完成後再進行OCR
    });

    clearButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height);  // 清除畫布
        resultDisplay.innerText = "";  // 清除辨識結果顯示
    });

    function processImage(imageData) {
        let data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // 灰階處理
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
            // 二值化
            data[i] = data[i + 1] = data[i + 2] = (avg > 128) ? 255 : 0;
        }
        context.putImageData(imageData, 0, 0); // 將處理後的影像數據放回畫布的原位置
    }
});
