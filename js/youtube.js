var YT = (function () {

    var ytVideoUrlMatcher = /'url_encoded_fmt_stream_map=url=([^&]*)&'/i;
    var ytVideoInfoUrlBase = 'http://www.youtube.com/get_video_info?html5=1&video_id=';

    function getHTML5VideoFileFromYouTube(videoId) {
        var videoInfoUrl = ytVideoInfoUrlBase + videoId;
        var videoUrl;
        $.ajax({
            url: videoInfoUrl,
            headers: {"Access-Control-Allow-Origin": "*"}
        }).done(function (html) {
            alert(html);
            var vidMatch = ytVideoUrlMatcher.exec(data);
            videoUrl = vidMatch.groups(0)[0];
            alert(videoUrl);
        });

        return videoUrl;
    }


    return {
        getHTML5VideoFileFromYouTube: getHTML5VideoFileFromYouTube
    }
})();