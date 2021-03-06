let data1;
let data2;
let data;
let currentIndex = 0;
let diffId = [];

// 读取文件内容
function readFile(file) {
    return new Promise(function (resolve, reject) {
        let fileData;
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (event) {
            const fileString = event.target.result;
            try {
                fileData = JSON.parse(fileString);
                console.log("导入文件" + file.name + "成功，大小为" + fileData.length);
                console.log(fileData);
            } catch (error) {
                alert("解析json文件报错！\n" + error.message);
                reject(error);
            }
            resolve(fileData);
        }
    });
}

// 显示情绪提示
function displayEmotionPrompt(id) {
    console.log("当前id：" + id);
    $("#emotion_prompt").show();
    switch (id) {
        case "anger_label":
            $("#emotion_prompt_content").text("生气的常见划分有：愤怒、愤恨、不平。判断生气时，可以先找情绪词，例如令人气愤，生气等。");
            break;
        case "sadness_label":
            $("#emotion_prompt_content").text("悲伤的常见划分有：忧伤、悲痛、自怜、失望、惋惜、沮丧、寂寞、无奈、愧疚、懊悔、思念。");
            break;
        case "disgust_label":
            $("#emotion_prompt_content").text("厌恶的常见划分有：轻蔑、讥讽、抗拒、烦躁、反感、嫉妒、怀疑。厌恶要有对应的对象，当厌恶变得强烈，逼近个人利益时，人就会产生想要消灭以保护自己利益的欲望，情绪就转化为了愤怒。");
            break;
        case "happiness_label":
            $("#emotion_prompt_content").text("高兴的常见划分有：高兴、开心、满足、幸福、骄傲、快乐、兴奋、狂喜。判断高兴时，可以先找情绪词，如开心，愉快，拟声词、表情标签等。");
            break;
        case "fear_label":
            $("#emotion_prompt_content").text("害怕的常见划分有：焦虑、惊恐、紧张、担忧、疑虑、恐慌、羞耻、害羞。害怕有对应的主体或对象。");
            break;
        case "surprise_label":
            $("#emotion_prompt_content").text("惊讶的常见划分有：疑惑、震惊、讶异、惊喜、尴尬。惊讶表示的情感倾向也有正面和负面，需要结合全文本考虑。");
            break;
        case "love_label":
            $("#emotion_prompt_content").text("喜爱的常见划分有：喜爱、赞美、鼓励、友善、信赖、亲密、挚爱。同时，喜爱要有对应的对象，当喜爱变得强烈，涉及个人利益时，情绪就转变成高兴。");
            break;
        default:
            break;
    }

}

// 隐藏情绪提示
function hideEmotionPrompt() {
    console.log("鼠标离开");
    $("#emotion_prompt").hide();
}

$(document).ready(function () {
    $("#file_view").show();
    $("#label_view").hide();

    // 鼠标悬停显示情绪提示
    $("label[name='emotion_label']").hover(function () {
        displayEmotionPrompt($(this).attr("id"));
    }, function () {
        hideEmotionPrompt();
    });

    // 上一页响应函数
    $("#pre_button").click(function () {
        if (currentIndex === 0) {
            alert("已经到头了！");
        } else {
            currentIndex -= 1;
            render_data(diffId[currentIndex]);
        }
    });

    // 下一页响应函数
    $("#next_button").click(function () {
        if (currentIndex === diffId.length - 1) {
            alert("已经到底了！");
        } else {
            //跳转到下一页
            currentIndex += 1;
            render_data(diffId[currentIndex]);
        }
    });


    // 选择文件响应函数
    $("#file_input").change(function () {
        // 获取到文件列表
        let files = $("#file_input").prop("files");

        if (files.length !== 2) {
            alert("请选择2个文件");
            return;
        }

        Promise.all([readFile(files[0]), readFile(files[1])])
            .then(function (results) {
                // 坑！！！！！！！！！！！！！！！！！！
                // 不能这样赋值，否则原对象的值也会被改变
                // data = results[0];

                data1 = JSON.parse(JSON.stringify(results[0]));
                data2 = JSON.parse(JSON.stringify(results[1]));

                data = JSON.parse(JSON.stringify(results[0]));

                for (let i = 0; i < results[0].length; i++) {

                    if (results[0][i]["isValid"] !== results[1][i]["isValid"] ||
                        results[0][i]["emotion3"] !== results[1][i]["emotion3"]
                        || results[0][i]["emotion7"].sort().toString() !== results[1][i]["emotion7"].sort().toString()) {
                        diffId.push(i);

                        data[i]["isValid"] = "";
                        data[i]["emotion3"] = "";
                        data[i]["emotion7"] = [];
                    }
                }

                if (diffId.length === 0) {
                    alert("两个文件完全相同");
                    return;
                }
                console.log("diffId大小为：" + diffId.length);
                console.log(diffId);
                console.log(data);
                $("#file_view").hide();
                $("#label_view").show();
                $("#file1_name").html(files[0].name);
                $("#file2_name").html(files[1].name);
                currentIndex = 0;
                // 直接跳转到上次标注结果
                // if (data[0].hasOwnProperty("check_finished")) {
                //     currentIndex = diffId[data[0]["check_finished"]];
                // }
                console.log(currentIndex);
                console.log("diffId[currentIndex]=" + diffId[currentIndex]);
                render_data(diffId[currentIndex]);
            })
    });

    // 提交按钮响应函数
    $("#save_button").click(function () {
        // data[0]['check_finished'] = currentIndex;
        save();
    });

    // 保存标注数据
    function save() {
        var saveAs = saveAs || (function (view) {
            "use strict";
            // IE <10 is explicitly unsupported
            if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
                return;
            }
            var
                doc = view.document
                // only get URL when necessary in case Blob.js hasn't overridden it yet
                ,
                get_URL = function () {
                    return view.URL || view.webkitURL || view;
                },
                save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
                can_use_save_link = "download" in save_link,
                click = function (node) {
                    var event = new MouseEvent("click");
                    node.dispatchEvent(event);
                },
                is_safari = /constructor/i.test(view.HTMLElement) || view.safari,
                is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
                throw_outside = function (ex) {
                    (view.setImmediate || view.setTimeout)(function () {
                        throw ex;
                    }, 0);
                },
                force_saveable_type = "application/octet-stream"
                // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
                ,
                arbitrary_revoke_timeout = 1000 * 40 // in ms
                ,
                revoke = function (file) {
                    var revoker = function () {
                        if (typeof file === "string") { // file is an object URL
                            get_URL().revokeObjectURL(file);
                        } else { // file is a File
                            file.remove();
                        }
                    };
                    setTimeout(revoker, arbitrary_revoke_timeout);
                },
                dispatch = function (filesaver, event_types, event) {
                    event_types = [].concat(event_types);
                    var i = event_types.length;
                    while (i--) {
                        var listener = filesaver["on" + event_types[i]];
                        if (typeof listener === "function") {
                            try {
                                listener.call(filesaver, event || filesaver);
                            } catch (ex) {
                                throw_outside(ex);
                            }
                        }
                    }
                },
                auto_bom = function (blob) {
                    // prepend BOM for UTF-8 XML and text/* types (including HTML)
                    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
                    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                        return new Blob([String.fromCharCode(0xFEFF), blob], {
                            type: blob.type
                        });
                    }
                    return blob;
                },
                FileSaver = function (blob, name, no_auto_bom) {
                    if (!no_auto_bom) {
                        blob = auto_bom(blob);
                    }
                    // First try a.download, then web filesystem, then object URLs
                    var
                        filesaver = this,
                        type = blob.type,
                        force = type === force_saveable_type,
                        object_url, dispatch_all = function () {
                            dispatch(filesaver, "writestart progress write writeend".split(" "));
                        }
                        // on any filesys errors revert to saving with object URLs
                        ,
                        fs_error = function () {
                            if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                                // Safari doesn't allow downloading of blob urls
                                var reader = new FileReader();
                                reader.onloadend = function () {
                                    var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                                    var popup = view.open(url, '_blank');
                                    if (!popup) view.location.href = url;
                                    url = undefined; // release reference before dispatching
                                    filesaver.readyState = filesaver.DONE;
                                    dispatch_all();
                                };
                                reader.readAsDataURL(blob);
                                filesaver.readyState = filesaver.INIT;
                                return;
                            }
                            // don't create more object URLs than needed
                            if (!object_url) {
                                object_url = get_URL().createObjectURL(blob);
                            }
                            if (force) {
                                view.location.href = object_url;
                            } else {
                                var opened = view.open(object_url, "_blank");
                                if (!opened) {
                                    // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                                    view.location.href = object_url;
                                }
                            }
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                            revoke(object_url);
                        };
                    filesaver.readyState = filesaver.INIT;

                    if (can_use_save_link) {
                        object_url = get_URL().createObjectURL(blob);
                        setTimeout(function () {
                            save_link.href = object_url;
                            save_link.download = name;
                            click(save_link);
                            dispatch_all();
                            revoke(object_url);
                            filesaver.readyState = filesaver.DONE;
                        });
                        return;
                    }

                    fs_error();
                },
                FS_proto = FileSaver.prototype,
                saveAs = function (blob, name, no_auto_bom) {
                    return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
                };
            // IE 10+ (native saveAs)
            if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
                return function (blob, name, no_auto_bom) {
                    name = name || blob.name || "download";

                    if (!no_auto_bom) {
                        blob = auto_bom(blob);
                    }
                    return navigator.msSaveOrOpenBlob(blob, name);
                };
            }

            FS_proto.abort = function () {
            };
            FS_proto.readyState = FS_proto.INIT = 0;
            FS_proto.WRITING = 1;
            FS_proto.DONE = 2;

            FS_proto.error =
                FS_proto.onwritestart =
                    FS_proto.onprogress =
                        FS_proto.onwrite =
                            FS_proto.onabort =
                                FS_proto.onerror =
                                    FS_proto.onwriteend =
                                        null;

            return saveAs;
        }(
            typeof self !== "undefined" && self ||
            typeof window !== "undefined" && window ||
            this.content
        ));
        // `self` is undefined in Firefox for Android content script context
        // while `this` is nsIContentFrameMessageManager
        // with an attribute `content` that corresponds to the window

        if (typeof module !== "undefined" && module.exports) {
            module.exports.saveAs = saveAs;
        } else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
            define("FileSaver.js", function () {
                return saveAs;
            });
        }


        var file = new File([JSON.stringify(data)], "label_result.json", {
            type: "text/plain;charset=utf-8"
        });

        saveAs(file);
    }


    // 页面加载数据
    function render_data(current_id) {
        console.log("current_id:" + current_id);
        $("#title_div").text(data[current_id]["title"]);
        $("#content_div").html(data[current_id]["content"].substring(0, 511));
        $("#current_id_show").html(currentIndex);
        $("#last_id_show").html(diffId.length - 1);
        $("#actual_id_show").html(diffId[currentIndex]);
        $('#div_id_show').show();

        $("#file1_isValid").html(data1[current_id]["isValid"]);
        $("#file1_emotion3").html(data1[current_id]["emotion3"]);
        $("#file1_emotion7").html(data1[current_id]["emotion7"].toString());

        $("#file2_isValid").html(data2[current_id]["isValid"]);
        $("#file2_emotion3").html(data2[current_id]["emotion3"]);
        $("#file2_emotion7").html(data2[current_id]["emotion7"].toString());

        $("input[type='radio']").parent().attr("class", "btn btn-default");
        $("input[type='radio']").prev().attr("class", "glyphicon glyphicon-uncheck");

        $("input[type='checkbox']").parent().attr("class", "btn btn-default");
        $("input[type='checkbox']").prev().attr("class", "glyphicon glyphicon-uncheck");


        if (data[current_id]["isValid"] != "") {
            let isValid = data[current_id]['isValid'];
//           console.log(category_id)
//           console.log(typeof category_id)
            if (isValid == "是") {
                $("#yes").parent().attr("class", "btn btn-default active");
                $("#yes").prev().attr("class", "glyphicon glyphicon-check");
            } else if (isValid == "否") {
                $("#no").parent().attr("class", "btn btn-default active");
                $("#no").prev().attr("class", "glyphicon glyphicon-check");
            }
        }

        if (data[current_id]["emotion3"] != "") {
            let category_id = data[current_id]['emotion3'];
//           console.log(category_id)
//           console.log(typeof category_id)
            if (category_id == "正面") {
                $("#positive").parent().attr("class", "btn btn-default active");
                $("#positive").prev().attr("class", "glyphicon glyphicon-check");
            } else if (category_id == "负面") {
                $("#negative").parent().attr("class", "btn btn-default active");
                $("#negative").prev().attr("class", "glyphicon glyphicon-check");
            } else if (category_id == "中性") {
                $("#neutral").parent().attr("class", "btn btn-default active");
                $("#neutral").prev().attr("class", "glyphicon glyphicon-check");
            }
        }
        for (let i = 0; i < data[current_id]["emotion7"].length; i++) {
            if (data[current_id]["emotion7"][i] != "") {
                let rank_id = data[current_id]['emotion7'][i]
                //           console.log(rank_id)
                //           console.log(typeof rank_id)
                if (rank_id == "生气") {
                    $("#anger").parent().attr("class", "btn btn-default active");
                    $("#anger").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "悲伤") {
                    $("#sadness").parent().attr("class", "btn btn-default active");
                    $("#sadness").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "厌恶") {
                    $("#disgust").parent().attr("class", "btn btn-default active");
                    $("#disgust").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "高兴") {
                    $("#happiness").parent().attr("class", "btn btn-default active");
                    $("#happiness").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "害怕") {
                    $("#fear").parent().attr("class", "btn btn-default active");
                    $("#fear").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "惊讶") {
                    $("#surprise").parent().attr("class", "btn btn-default active");
                    $("#surprise").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "喜爱") {
                    $("#love").parent().attr("class", "btn btn-default active");
                    $("#love").prev().attr("class", "glyphicon glyphicon-check");
                } else if (rank_id == "其他") {
                    $("#none").parent().attr("class", "btn btn-default active");
                    $("#none").prev().attr("class", "glyphicon glyphicon-check");
                }

            }
        }
    }
});
"use strict";
$(document).ready(function () {

    $("#agree .btn").click(function () {
        agree("#agree", $(this));
    });
    $("#Select1 .btn").on('click', function () {
        ToggleRadioButtons1("#Select1", $(this));
    });

    $("#Select2 .btn").on('click', function () {
        ToggleRadioButtons2("#Select2", $(this));
    });

});
let timer = null;
$(document).ready(function () {
    $("#Select3 .btn").on('click', function () {
        let nowid = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            ToggleRadioButtons3("#Select3", $(nowid));
        }, 200);
    });


});

$(document).ready(function () {
    $("#Select3 .btn").dblclick(function () {
        clearTimeout(timer);
        ToggleRadioButtons4("#Select3", $(this));
    });
});


function agree(groupName, current) {

    // 清除右边标注面板的样式
    $("input[name='is_valid']").parent().attr("class", "btn btn-default");
    $("input[name='is_valid']").prev().attr("class", "glyphicon glyphicon-uncheck");

    $("input[name='emotion']").parent().attr("class", "btn btn-default");
    $("input[name='emotion']").prev().attr("class", "glyphicon glyphicon-uncheck");

    $("input[type='checkbox']").parent().attr("class", "btn btn-default");
    $("input[type='checkbox']").prev().attr("class", "glyphicon glyphicon-uncheck");
    console.log("赞成点击行为");
    let c = current.text().replace(/\ +/g, "");
    let d = c.replace(/[\r\n]/g, "");
    console.log("d是：" + d);

    if (d == "赞成第一个") {
        data[diffId[currentIndex]]["isValid"] = data1[diffId[currentIndex]]["isValid"];
        data[diffId[currentIndex]]["emotion3"] = data1[diffId[currentIndex]]["emotion3"];
        data[diffId[currentIndex]]["emotion7"] = data1[diffId[currentIndex]]["emotion7"];
    } else if ("赞成第二个") {
        data[diffId[currentIndex]]["isValid"] = data2[diffId[currentIndex]]["isValid"];
        data[diffId[currentIndex]]["emotion3"] = data2[diffId[currentIndex]]["emotion3"];
        data[diffId[currentIndex]]["emotion7"] = data2[diffId[currentIndex]]["emotion7"];
    }
    console.log(data[diffId[currentIndex]]);
    //在当前的btn-group里先清除所有“选取”图标，全部换成“取消”样式（“初始化”）
    $(groupName + " .glyphicon-check")
        .removeClass("glyphicon-check")
        .addClass("glyphicon-unchecked");
    //alert("暂停啦");
    //更改当前用户选择的那个btn图标
    current.find(":first-child")
        .removeClass("glyphicon-unchecked")
        .addClass("glyphicon-check");


}

function ToggleRadioButtons1(groupName, current) {
    console.log('有效数据筛选点击行为');
    let c = current.text().replace(/\ +/g, "");
    let d = c.replace(/[\r\n]/g, "");
    console.log(d);

    clearAgreeRadio();
    data[diffId[currentIndex]]['isValid'] = d;
    //在当前的btn-group里先清除所有“选取”图标，全部换成“取消”样式（“初始化”）
    $(groupName + " .glyphicon-check")
        .removeClass("glyphicon-check")
        .addClass("glyphicon-unchecked");
    //alert("暂停啦");
    //更改当前用户选择的那个btn图标
    current.find(":first-child")
        .removeClass("glyphicon-unchecked")
        .addClass("glyphicon-check");


}

function ToggleRadioButtons2(groupName, current) {
//       console.log(current)
    console.log('情感产生点击行为');
    let c = current.text().replace(/\ +/g, "");
    let d = c.replace(/[\r\n]/g, "");
    console.log(d);

    clearAgreeRadio();
    data[diffId[currentIndex]]['emotion3'] = d;
    //在当前的btn-group里先清除所有“选取”图标，全部换成“取消”样式（“初始化”）
    $(groupName + " .glyphicon-check")
        .removeClass("glyphicon-check")
        .addClass("glyphicon-unchecked");
    //alert("暂停啦");
    //更改当前用户选择的那个btn图标
    current.find(":first-child")
        .removeClass("glyphicon-unchecked")
        .addClass("glyphicon-check");


}


function clearAgreeRadio() {
    $("input[name='agree']").parent().attr("class", "btn btn-default");
    $("input[name='agree']").prev().attr("class", "glyphicon glyphicon-uncheck");

    if ($("input[name='agree']:checked").val() != null) {
        $("input[name='agree']:checked").prop("checked", false);
        data[diffId[currentIndex]]["isValid"] = "";
        data[diffId[currentIndex]]["emotion3"] = "";
        data[diffId[currentIndex]]["emotion7"] = [];
    }
}

function ToggleRadioButtons3(groupName, current) {
    console.log('情绪产生点击行为');
    let r = current.text().replace(/\ +/g, "");
    let s = r.replace(/[\r\n]/g, "");
    console.log(s);
    console.log(data[diffId[currentIndex]]['emotion7'].indexOf(s));
    console.log(typeof data[diffId[currentIndex]]['emotion7'].indexOf(s));
    console.log("-----------------------分割线------------------------");
    console.log($("input[name='agree']:checked").val());

    clearAgreeRadio();
    if (data[diffId[currentIndex]]['emotion7'].indexOf(s) > -1) {
        console.log("数据已存在");
    } else {
        data[diffId[currentIndex]]['emotion7'].push(s);
        current.find(":first-child").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
    }

    console.log("这里是保存后的数据", data[diffId[currentIndex]]['emotion7'])

}

function ToggleRadioButtons4(groupName, current) {
    console.log("这里双击了");
    let r = current.text().replace(/\ +/g, "");
    let s = r.replace(/[\r\n]/g, "");
    console.log(s);
    let removeIndex = data[diffId[currentIndex]]['emotion7'].indexOf(s);
    console.log("这里是位置：", removeIndex);
    if (removeIndex > -1) {
        data[diffId[currentIndex]]['emotion7'].splice(removeIndex, 1);
        current.find(":first-child").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
        current.removeClass("btn btn-default active").addClass("btn btn-default");
    }
}


