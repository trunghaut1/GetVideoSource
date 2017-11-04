// ==UserScript==
// @name         Get Video Source
// @namespace    https://github.com/trunghaut1/GetVideoSource
// @version      0.6
// @description  Get original video from online movie sites
// @author       TrungHau
// @include      https://phimbathu.com/xem-phim/*
// @include      http://bilutv.com/xem-phim/*
// @include      http://tvhay.org/xem-phim-*
// @include      http://www.phimmoi.net/phim/*
// @updateURL    https://raw.githubusercontent.com/trunghaut1/GetVideoSource/master/getVideoSource.js
// @downloadURL  https://raw.githubusercontent.com/trunghaut1/GetVideoSource/master/getVideoSource.js
// @encoding     utf-8
// @grant        none
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_addStyle
// @grant          GM_getResourceText
// @grant          GM_getResourceURL
// @grant          GM_deleteValue
// @grant          GM_getValue
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @require      https://apis.google.com/js/api.js
// @require      http://code.jquery.com/jquery-1.11.0.min.js
// @homepage     https://trunghaut1.github.io/GetVideoSource/
// ==/UserScript==
function getDriveInfo(driveId) {
    return new Promise(function(resolve, reject) {
        gapi.client.init({
            apiKey: 'AIzaSyBUq_Gd1KCL7ix7asMNs9SKrEqyxOEmIE8'
        }).then(function(){
            var request = gapi.client.request({
                'path': '/drive/v2/files/'+ driveId,
                'method': 'GET',
            });
            request.execute(function(resp) {
                if(resp.title !== undefined) {
                    resolve(resp);
                }
                else reject("Lỗi truy cập file | " + driveId);
            });
        });
    });
}
// Check type video source
function checkSource()
{
    var check = $(".jw-video").length;
    if(check === 0) return "open";
    else if(!$(".jw-video").attr("src").includes('google')) return "other";
    return "drive";
}
function getDriveLink(source) {
    return new Promise((resolve, reject) =>
                      $.get('https://quiztool.azurewebsites.net/getvideo.php', {driveUrl : source})
                           .done(resolve).fail(reject));
}
function getVideo() {
    var source = null;
    //
    var getDriveVideo = function(source) {
        if(source !== null && source.includes('google')) {
            var url = new URL(source);
            var driveId = url.searchParams.get("driveid");
            if(driveId !== null) {
                $("#downLink").attr("href","https://drive.google.com/file/d/" + driveId + "/view");
                gapi.load('client', function(){ getDriveInfo(driveId).then(function(info) {
                    var time = new Date(info.createdDate);
                    $("#downLink").html(info.mimeType + " | " + info.videoMediaMetadata.width + "x" + info.videoMediaMetadata.height + " | " +
                                        time.toLocaleString() + " | " + parseInt(info.fileSize/1024/1024) + " MB");
                }, error => $("#downLink").html(error));});
            } else $("#downLink").html("Không tìm thấy Google Drive ID, vui lòng thử lại");
        }
        else $("#downLink").html("Không tìm thấy liên kết, vui lòng thử lại");
    };

    switch(checkSource()) {
        case "drive" : // Get Google Drive source
            {
                source = $(".jw-video").attr("src");
                if(source !== null && source.includes('googleusercontent')) {
                    getDriveLink(source).then(function(newUrl) {
                        source = newUrl;
                        getDriveVideo(source);
                    });
                }
                else getDriveVideo(source);
                break;
            }
        case "open" : // Get Openload source
            {
                if(location.href.indexOf("tvhay.org") > 0)
                    source = $("#media").find("iframe").attr("src");
                else
                    source = $("#player").find("iframe").attr("src");
                if(source !== null && source.includes('openload')) {
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
                else if(source !== null) {
                    $("#downLink").attr("href",source);
                    $("#downLink").html(source);
                }
                else $("#downLink").html("Không tìm thấy liên kết, vui lòng thử lại");
                break;
            }
            default :
            {
                source = $(".jw-video").attr("src");
                var leng = source.length;
                if(leng > 80)
                    $("#downLink").html(source.substring(0,leng/10) + "..." + source.substring(leng-5));
                else
                    $("#downLink").html(source.substring(0,leng/2) + "..." + source.substring(leng-10));
                $("#downLink").attr("href",source);
            }
    }
}

$(document).ready(function(){
    //Create download button
    var downBtn = document.createElement("a");
    downBtn.setAttribute("id","downBtn");
    downBtn.setAttribute("class", "btn btn-sm btn-primary");
    downBtn.innerHTML = "Tải phim";
    //Create link download button
    var downLink = document.createElement("a");
    downLink.setAttribute("id","downLink");
    downLink.setAttribute("class", "btn btn-sm btn-info");
    downLink.style.cssText = "float:right;";
    downLink.setAttribute("target","_blank");
    //Check site
    if(location.href.indexOf("phimbathu.com") > 0 || location.href.indexOf("bilutv.com") > 0) {
        //Add download button
        $(".option.col-lg-10.col-md-10.col-sm-8.col-xs-8").first().append(downBtn);
        $("#downBtn").click(getVideo);
        //Add link download button
        $(".option.col-lg-10.col-md-10.col-sm-8.col-xs-8").first().append(downLink);
    } else
        if(location.href.indexOf("tvhay.org") > 0) {
        // Add download button
        $(".action").append(downBtn);
        $("#downBtn").click(getVideo);
        //Add link download button
        downLink.setAttribute("class", "btn btn-primary");
        downLink.style.cssText = "top:0; position: absolute; right: 0; height:16px; margin-top:-3px; margin-right:10px;";
        $("#detail").find(".blockbody").attr("style","position: relative;");
        $("#detail").find(".blockbody").append(downLink);
    } else
        if(location.href.indexOf("phimmoi.net") > 0) {
            $("#btn-download").attr("href",null);
            $("#btn-download").attr("target",null);
            $("#btn-download").click(getVideo);
            downLink.style.cssText = "top:0; position: absolute; right: 0; margin-right:5px; margin-top:5px;";
            $(".box-rating").append(downLink);
        }
});