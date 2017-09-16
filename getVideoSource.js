// ==UserScript==
// @name         Get Video Source
// @namespace    https://github.com/trunghaut1/GetVideoSource
// @version      0.2
// @description  Get original video from online movie sites
// @author       TrungHau
// @include      https://phimbathu.com/xem-phim/*
// @include      http://bilutv.com/xem-phim/*
// @grant        none
// @require      https://apis.google.com/js/api.js
// @homepage     https://trunghaut1.github.io/GetVideoSource/
// ==/UserScript==

function getDriveInfo(driveId) {
    gapi.client.init({
        apiKey: 'AIzaSyBUq_Gd1KCL7ix7asMNs9SKrEqyxOEmIE8'
    }).then(function(){
        var request = gapi.client.request({
            'path': '/drive/v2/files/'+ driveId,
            'method': 'GET',
        });
        request.execute(function(resp) {
            if(resp.title != null)
                $("#downLink").html(resp.mimeType + " | " + resp.videoMediaMetadata.width + "x" + resp.videoMediaMetadata.height + " | " +
                                    resp.createdDate.substring(0, 19) + " | " + parseInt(resp.fileSize/1024/1024) + " MB");
            else $("#downLink").html("Lỗi truy cập file | " + driveId);
        });
    });
}
// Check type video source
function checkSource()
{
    var check = $(".jw-video").length;
    if(check === 0) return "open";
    return "drive";
}
function getVideo() {
    var source = null;
    switch(checkSource()) {
        case "drive" :
            {
                source = $(".jw-video").attr("src");
                if(source != null) {
                    var url = new URL(source);
                    var driveId = url.searchParams.get("driveid");
                    if(driveId != null) {
                        $("#downLink").attr("href","https://drive.google.com/file/d/" + driveId + "/view");
                        gapi.load('client', function(){getDriveInfo(driveId);});
                    }
                }
                else $("#downLink").html("Không tìm thấy liên kết");
                break;
            }
        case "open" :
            {
                source = $("#player").find("iframe").attr("src");
                if(source != null) {
                    var fileId = source.substring(26);
                    $("#downLink").attr("href","https://openload.co/f/" + fileId);
                    $.get(
                        "https://api.openload.co/1/file/info",
                        {file : fileId},
                        function(data) {
                            var info = data.result[fileId];
                            if(info.status == 200)
                                $("#downLink").html(info.content_type + " | " + info.name + " | " + parseInt(info.size/1024/1024) + " MB");
                            else $("#downLink").html("Lỗi truy cập file | " + fileId);
                        }
                    );
                }
                else $("#downLink").html("Không tìm thấy liên kết");
                break;
            }
    }
}

$(document).ready(function(){
    // Add download button
    var downBtn = document.createElement("a");
    downBtn.setAttribute("id","downBtn");
    downBtn.setAttribute("class", "btn btn-sm btn-primary");
    downBtn.innerHTML = "Tải phim";
    $(".option.col-lg-10.col-md-10.col-sm-8.col-xs-8").first().append(downBtn);
    $("#downBtn").click(getVideo);

    // Add link download button
    var downLink = document.createElement("a");
    downLink.setAttribute("id","downLink");
    downLink.setAttribute("class", "btn btn-sm btn-info");
    downLink.style.cssText = "float:right;";
    $(".option.col-lg-10.col-md-10.col-sm-8.col-xs-8").first().append(downLink);
});
