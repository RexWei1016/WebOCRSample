document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');

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
        let imageData = context.getImageData(0, 0, 640, 480);
        processImage(imageData);

        var imgData = canvas.toDataURL('image/png');
        Tesseract.recognize(
            imgData,
            'eng',
            {
                logger: m => console.log(m)
            }
        ).then(function({ data: { text } }) {
            document.getElementById('ocrResult').innerText = text;
        });
    });

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
        context.putImageData(imageData, 0, 0);
    }
});
