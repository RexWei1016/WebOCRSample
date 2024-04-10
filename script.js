document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var snapButton = document.getElementById('snap');

    // 嘗試選擇後置鏡頭
    var constraints = {
        video: { facingMode: "environment" }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject = stream;
    }).catch(function(error) {
        console.error("無法訪問攝像頭，錯誤：", error);
    });

    // 拍照並進行OCR識別
    snapButton.addEventListener('click', function() {
        context.drawImage(video, 0, 0, 640, 480);
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
});
