document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');
    var clearButton = document.getElementById('clear'); // 新增一個清除按鈕
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
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, 640, 480);
        //drawRecognitionArea();
        setTimeout(function() {
            let imageData = context.getImageData(200, 180, 240, 120);
            processImage(imageData);

            var imgData = canvas.toDataURL('image/png'); // 將處理過的圖像轉換為DataURL
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
        }, 100); // 確保繪製完成後再進行OCR
    });

    clearButton.addEventListener('click', function() {
        context.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布
        //context.drawImage(video, 0, 0, 640, 480); // 重新繪製視頻流到畫布上
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
        context.putImageData(imageData, 200, 180);
    }
});
