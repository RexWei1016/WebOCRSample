document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');
    var resultDisplay = document.getElementById('ocrResult');

    var constraints = {
        video: { facingMode: "environment" }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject = stream;
    }).catch(function(error) {
        console.error("無法訪問攝像頭，錯誤：", error);
    });

    snapButton.addEventListener('click', function() {
        context.drawImage(video, 0, 0, 640, 480);
        drawRecognitionArea();
        let imageData = context.getImageData(200, 180, 240, 120);  // 只針對車牌區域進行OCR
        processImage(imageData);

        var imgData = canvas.toDataURL('image/png');
        Tesseract.recognize(
            imgData,
            'eng',
            {
                logger: m => console.log(m)
            }
        ).then(function({ data: { text } }) {
            let formattedText = text.match(/[A-Z]{2}-\d{4}/); // 正規表達式匹配英文兩碼，數字四碼
            resultDisplay.innerText = formattedText ? formattedText[0] : "未識別到有效車牌";
        });
    });

    function drawRecognitionArea() {
        context.strokeStyle = 'green';
        context.lineWidth = 6;
        context.strokeRect(200, 180, 240, 120);  // 繪製綠色框框
    }

    // 圖像前處理函數
    function processImage(imageData) {
        let data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // 灰階處理
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;

            // 二值化
            data[i] = data[i + 1] = data[i + 2] = (avg > 128) ? 255 : 0;
        }
        context.putImageData(imageData, 200, 180);  // 將處理後的圖像數據放回車牌區域
    }
});
