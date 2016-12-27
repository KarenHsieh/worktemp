var PAGE_SIZE = 10;
var PAGE_IDX = -1;
var PAGE_CNT = -1;
var EDIT_DATA = new Array();
var G_DATA = new Array();


var ddlBreachMode, ddlInterestApart;


genData = function (id, tableArg) {


    $("#"+id).SexyTable(tableArg);

    $("#" + id).SexyPageCtrl(G_DATA["Table"].length, PAGE_SIZE, genPageChg);

    if (PAGE_IDX > 1) {
        $("#" + id).SexyPageSltCtrlF(PAGE_IDX, G_DATA["Table"].length, PAGE_SIZE,
			function (e) {
			    $("#scDataView").SexyPageChg(e);
			    PAGE_IDX = e;
			});
    }
};


var genPageChg = function (pageIdx) {
    PAGE_IDX = pageIdx;
    $("#scDataView").SexyPageChg(pageIdx);
};

indexOf = function (list, elem) {
    var i = 0,
		len = list.length;
    for (; i < len; i++) {
        if (list[i] === elem) {
            return i;
        }
    }
    return -1;
}



//一開始取得頁面資料
function OrdersQry() {


    var DataArgs =
	{
	    method: "post",
	    url: "SKL_1_1_Maintain_Interest_Project/init_Interest_Project",
	    data: "",
	    oMethod: genInitSelector,
	    eMethod: showError
	};
    docCore.ajax(DataArgs, true, true);

}

function genInitSelector(response) {

    ddlBreachMode = response.data['ddlBreachMode'];
    ddlInterestApart = response.data['ddlInterestApart'];

    $("#BreachMode").SexySelect(response.data['ddlBreachMode'], "BreachModeName", "BreachModeID");
    $("#InterestApart").SexySelect(response.data['ddlInterestApart'], "IntClassName", "InterestApartID");

    genInit(response);
}

function genInit(response) {
    //console.info(JSON.stringify(response));

    var table = response.data['Table'];

    var id_list = [] , section = [], breach = [];
    var record = {}, project = {};


    $.each(table.Section, function (index, data) {

        var project_temp = {
            "Project_Uid": data.Project_Uid,
            "ProjectID": data.ProjectID,
            "Project_Item": data.Project_Item,
            "Project_Point": data.Project_Point,
            "Project_Interest": data.Project_Interest,
            "ProjectSection": data.ProjectSection,
            "InterestApart": data.InterestApart,
            "InterestApartName": data.InterestApartName,
            "BreachMode": data.BreachMode,
            "BreachModeName": data.BreachModeName,
            "SeqNo": data.SeqNo,
            "Status": data.Status,
            "LastUpdate_EmpID": data.LastUpdate_EmpID,
            "LastUpdate_Date": data.LastUpdate_Date
        }

        if ($.inArray(data.ProjectID, id_list) == -1) { // 第一次取得ProjectID
            id_list.push(data.ProjectID);
            project[data.ProjectID] = project_temp;
        }

        if (data.SectionCode != null) {
            var section_temp = {
                "SectionCode": data.SectionCode,
                "Section1": data.Section1,
                "Section2": data.Section2,
                "Section_Kind": data.Section_Kind,
                "Section_Kind_Percent": data.Section_Kind_Percent,
                "Is_government": data.Is_government,
                "GovPercent": (data.GovPercent) ? data.GovPercent : ""
            };



            if (typeof section[data.ProjectID] === "undefined") {
                // 因為沒有直接判斷array key是否存在的方法，所以塞入一個不存在的key取值，若return undefined 表示這個section還沒寫入
                section[data.ProjectID] = [section_temp];
            } else {
                section[data.ProjectID].push(section_temp);
            }
        }

    });


    $.each(table.Breach, function (index, data) {
        //console.log(data.Breach_Uid);
        if (data.Breach_Uid != null) {
            var breach_temp = {
                "Breach_Uid": data.Breach_Uid,
                "Breach_Item1": data.Breach_Item1,
                "Breach_Item2": data.Breach_Item2,
                "Breach_Item3": data.Breach_Item3,
                "Breach_amount": data.Breach_amount
            }


            if (typeof breach[data.ProjectID] === "undefined") {

                breach[data.ProjectID] = [breach_temp];

            } else {
                breach[data.ProjectID].push(breach_temp);
            }
        }

    });


    genList(project, section, breach);
}


function genList(project, section, breach) {

    $(".record:nth-child(1)").removeClass("record").addClass("record_temp");
    $(".record").remove();
    $(".record_temp").removeClass("record_temp").addClass("record");


    var cnt = 0;
    $.each(project, function (index, data) {


        if (cnt > 0) {
            var clone = $(".record").first().clone();
            $("#view_list").append(clone);
        }


        $(".record").last().find("[name='section']").hide();
        if ($("#section_" + data.ProjectID).length == 0) {
            $(".record").last().find("[name='section']").attr("id", "section_" + data.ProjectID);
        }

        $(".record").last().find("[name='breach']").hide();
        if ($("#breach_" + data.ProjectID).length == 0) {
            $(".record").last().find("[name='breach']").attr("id", "breach_" + data.ProjectID);
        }


        var key_arr = Object.keys(data);
        for (var i = 0, len = Object.keys(data).length; i < len; i++) {

            switch (key_arr[i]) {
                case 'Project_Point':
                    $(".record").last().find("[name='view_" + key_arr[i] + "']").text((data[key_arr[i]] == "1") ? "保單分紅" : "中華郵政");
                    break;
                case 'Project_Interest':
                    $(".record").last().find("[name='view_" + key_arr[i] + "']").text((data[key_arr[i]] == "1") ? "是" : "否");
                    break;
                case 'Status':
                    $(".record").last().find("[name='view_" + key_arr[i] + "']").text((data[key_arr[i]] == "1") ? "啟用" : "停用");
                    break;
                case 'LastUpdate_Date':
                    $(".record").last().find("[name='view_" + key_arr[i] + "']").text(fullDateToChinse(data[key_arr[i]]));
                    break;
                default:
                    $(".record").last().find("[name='view_" + key_arr[i] + "']").text(data[key_arr[i]]);
            }

        }


        if (section[data.ProjectID] != undefined) {
            $("#section_" + data.ProjectID).show();
            genTable("section_" + data.ProjectID, "section", section[data.ProjectID]);
        }


        if (breach[data.ProjectID] != undefined) {
            $("#breach_" + data.ProjectID).show();
            genTable("breach_" + data.ProjectID, "breach", breach[data.ProjectID]);
        }

        $(".record").last().find("[name='view_Maintain']").find("a").attr("pid", data.Project_Uid);


        cnt++;
    });


    $(".maintain").on("click", function () {

        $('html,body').animate({
            scrollTop: $('#insertDiv').offset().top
        }, 300);


        $(".add_div").hide();
        $(".update_div").show();

        clearInsertDiv();


        var Project_Uid = $(this).attr("pid");

        $("#Project_Uid").val(Project_Uid);

        var element = $(this).closest('.record').find(".rwd_form_right");


        $.each(element, function (index, data) {

            var ele_name = $(data).attr("name").replace("view_", "");

            switch (ele_name) {
                case 'Status':
                    var status = ($(data).text() == "啟用") ? "1" : "0";
                    $("#insertDiv").find("[name='" + ele_name + "']").val(status);
                    break;
                case 'BreachModeName':
                    var record = $.map(ddlBreachMode, function (o) {
                        if (o.BreachModeName == $(data).text()) {
                            return o;
                        }
                    });
                    //console.info(record);
                    $("#insertDiv").find("[name='BreachMode']").val(record[0].BreachModeID);
                    break;

                case 'InterestApartName':
                    var record = $.map(ddlInterestApart, function (o) {
                        if (o.IntClassName == $(data).text()) {
                            return o;
                        }
                    });

                    $("#insertDiv").find("[name='InterestApart']").val(record[0].InterestApartID);
                    break;

                case 'Project_Point':
                    var Project_Point = ($(data).text() == "保單分紅") ? "1" : "2";
                    $("#insertDiv").find("[name='Project_Point']").filter('[value=' + Project_Point + ']').prop('checked', true);
                    break;

                case 'Project_Interest':
                    var Project_Interest = ($(data).text() == "是") ? "1" : "0";
                    $("#insertDiv").find("[name='Project_Interest']").filter('[value=' + Project_Interest + ']').prop('checked', true);
                    break;


                default:
                    $("#insertDiv").find("[name='" + ele_name + "']").val($(data).text());
            }

        }); // end each



        var section = $(this).closest('.record').find("[name='section']").find("tbody").find("tr");

        controlSection(section.length.toString());
        $("#insertDiv").find("#ProjectSection").val(section.length.toString());

        $.each(section, function (index, data) { //0~6


            var tr = $("#edit tr:nth-child(" + (index+1) + ")");


            for (var i = 0; i < 7; i++) {

                switch (i) {
                    case 1:
                        tr.find("[name='s_month']").val(data.cells[i].innerText);
                        break;
                    case 2:
                        tr.find("[name='e_month']").val(data.cells[i].innerText);
                        break;
                    case 3:
                        tr.find("[name='rate']").val(data.cells[i].innerText);
                        break;
                    case 4:
                        tr.find("[name='Section_Kind_Percent']").val(data.cells[i].innerText);
                        break;
                    case 5:
                        tr.find("[name='Is_government" + index + "']").filter('[value="' + data.cells[i].innerText + '"]').prop('checked', true);
                        tr.find(".GovPercent_text").show();
                        break;
                    case 6:
                        tr.find(".GovPercent_text").val(data.cells[i].innerText);
                        break;
                }

            }

        });

    });
}

function breachSetting() {
    alert("Open Breach Page");
}


function genTable(id, type, G_DATA) {


    var tableArg = "";
    switch (type) {
        case 'section':
            tableArg = {
                theadValue: [[
                    { Text: "SectionCode", Style: { "display": "none" } },
                    { Text: "Section1", Style: { "display": "none" } },
                    { Text: "Section2", Style: { "display": "none" } },
                    { Text: "Section_Kind", Style: { "display": "none" } },
                    { Text: "Section_Kind_Percent", Style: { "display": "none" } },
                    { Text: "Is_government", Style: { "display": "none" } },
                    { Text: "GovPercent", Style: { "display": "none" } },
                    { Text: "段別" },
                    { Text: "期間" },
                    { Text: "種類" },
                    { Text: "政策性貸款補貼息" }



                ]],
                tbodyValue: {
                    Value: [
                            "SectionCode", "Section1", "Section2", "Section_Kind", "Section_Kind_Percent", "Is_government", "GovPercent",
                             {
                                 t: function (e) {
                                     switch (e['SectionCode']) {
                                         case 1:
                                             return "一";  break;
                                         case 2:
                                             return "二";  break;
                                         case 3:
                                             return "三";  break;
                                         case 4:
                                             return "四";  break;
                                         case 5:
                                             return "五";  break;
                                     }
                                 }
                             },
                             { t: function (e) { return "第" + e['Section1'] + "個月~第" + e['Section2'] + "個月" } },
                             {
                                 t: function (e) {
                                     var Section_Kind = (e["Section_Kind"] == "1") ? "固定利率" : "加碼利率";
                                     return Section_Kind + " " + e['Section_Kind_Percent']+"%";
                                 }
                             },
                             {
                                 t: function (e) {
                                     if (e["Is_government"] == "N") {
                                         return "";
                                     } else {
                                         if (e['GovPercent'] == "") {
                                             return "";
                                         } else {
                                             return e['GovPercent'] + "%";
                                         }
                                     }
                                 }
                             }
                    ],
                    Style: [{ "display": "none" }, { "display": "none" }, { "display": "none" }, { "display": "none" }, { "display": "none" }, { "display": "none" }, { "display": "none" }]

                },
                Data: G_DATA,
                Style: {
                    tbody_odd: "rowodd",
                    tbody_even: "roweven"
                },
                PageSize: PAGE_SIZE,
                PluginSite: true
            };
            break;
        case 'breach':
            tableArg = {
                theadValue: [[
                    { Text: "Breach_Uid", Style: { "display": "none" } },
                    { Text: "內容" },
                    { Text: "違約率-金額" }


                ]],
                tbodyValue: {
                    Value: [
                             "Breach_Uid",
                            { t: function (e) { return "第" + e['Breach_Item1'] + "個月~第" + e['Breach_Item2'] + "個月期間內提前清償者，依" + e['Breach_Item3'] + "%計付違約金。" } },
                            "Breach_amount"
                            ],
                    Style: [{ "display": "none" }]

                },
                Data: G_DATA,
                Style: {
                    tbody_odd: "rowodd",
                    tbody_even: "roweven"
                },
                PageSize: PAGE_SIZE,
                PluginSite: true
            };
            break;
    }

    $("#" + id).find("thead,tbody,caption").remove();
    //$("#" + id).off();
    if (type == "breach") {
        $("#" + id).append("<caption>違約條款 <span class='remark'><a class='button' onclick='breachSetting()'>設定</a></span></caption>");
    }

    $("#" + id).SexyTable(tableArg);

}


var controlSection = function (num) {

    //console.log("執行controlSection" + num);
        $("#edit tbody tr").hide().removeClass("active");
    switch (num) {

        case '5':
            $("#edit tbody tr:nth-child(n)").show().addClass("active");
            break;
        case '4':
            $("#edit tbody tr:nth-child(-n+4)").show().addClass("active");
            break;
        case '3':
            $("#edit tbody tr:nth-child(-n+3)").show().addClass("active");
            break;
        case '2':
            $("#edit tbody tr:nth-child(-n+2)").show().addClass("active");
            break;
        case '1':
            $("#edit tbody tr:first-child").show().addClass("active");
            break;
    }
}


var clearInsertDiv = function () {
    $('#insertDiv :input').not(':button, :submit, :reset, :hidden, :radio, select').val('').removeAttr('checked').removeAttr('selected');
    $("#Project_Uid").val("");
}



    function showError() {
        SexyAlert("提示", "資料讀取失敗，請重試！", "alert", "okonly", function () { $.unblockUI(); });
    }

    function showSuccess(response) {

        SexyAlert("提示", "資料儲存成功！", "SUCCESS", "okonly", function () {
            $.unblockUI();
            OrdersQry()
        });

    }

    //將西元日期轉成國曆
    function fullDateToChinse(input_date, time_display) {

        //console.log(input_date);
        var format_date = "";
        var date = new Date(input_date);


        var year = date.getUTCFullYear() - 1911;
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();


        time_display = typeof time_display !== 'undefined' ? time_display : false;

        if (time_display) {

            var hour = date.getUTCHours();
            var min = date.getUTCMinutes();
            var sec = date.getUTCSeconds();

            format_date = year + "/" + leftPad(month, 2) + "/" + leftPad(day, 2) + " " + leftPad(hour, 2) + ":" + leftPad(min, 2) + ":" + leftPad(sec, 2);
        } else {
            format_date = year + "/" + leftPad(month, 2) + "/" + leftPad(day, 2);
        }
        //console.warn(format_date);
        return format_date;
    }



    // 位數補0
    // 例如：
    // var month = 2;
    // console.log(leftPad(month,2)) // 02
    function leftPad(val, length) {
        var str = '' + val;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }



    $(document).ready(function () {

        $(".update_div").hide();

        OrdersQry();

        function getInsertDiv() {

            //var jsonData = FormDataToJSON("formData");
            var error = [];
            var jsonData = new Object();
            var section_temp = [];

            jsonData['ProjectID'] = $("#ProjectID").val();
            jsonData['Project_Item'] = $("#Project_Item").val();
            jsonData['Project_Point'] = $("input[name='Project_Point']:checked").val();
            jsonData['Project_Interest'] = $("input[name='Project_Interest']:checked").val();

            if (jsonData['Project_Interest'] == "1") {
                jsonData['ProjectSection'] = $("#ProjectSection").val();


                $("#edit tr.active").each(function (index, data) {
                    console.info(data.querySelectorAll("input"));
                    // console.log(data.children);
                    //console.log(data.children[3].querySelector("input:checked").value);

                    if (data.querySelectorAll("input").length == 0) {
                        return;
                    }

                    var Section1 = data.children[1].querySelectorAll("input")[0].value;
                    var Section2 = data.children[1].querySelectorAll("input")[1].value;
                    var Section_Kind = data.children[2].querySelector("select").selectedOptions[0].value;
                    var Section_Kind_Percent = data.children[2].querySelector("input").value;
                    var Is_government = data.children[3].querySelector("input:checked").value;
                    var GovPercent = data.children[3].querySelector(".GovPercent_text").value;

                    if (Section1 && Section2 && Section_Kind_Percent) {
                        section_temp.push({
                            SectionCode: (index + 1),
                            Section1: (Section1) ? Section1 : "",
                            Section2: Section2 ? Section2 : "",
                            Section_Kind: Section_Kind,
                            Section_Kind_Percent: (Section_Kind_Percent) ? Section_Kind_Percent : "",
                            Is_government: (Is_government) ? Is_government : "",
                            GovPercent: (GovPercent) ? GovPercent : "0"
                        });
                    } else {
                        error.push({ msg: "第" + (index + 1) + "分段別資料不完整" });
                    }
                });

            } else {
                jsonData['ProjectSection'] = "";
            }

            jsonData['SectionData'] = section_temp;

            jsonData['InterestApart'] = $("#InterestApart").val();
            jsonData['BreachMode'] = $("#BreachMode").val();
            jsonData['SeqNo'] = $("#SeqNo").val();
            jsonData['Status'] = $("#Status").val();



            if (error.length == 0) {
                return jsonData;
            } else {
                SexyAlert("錯誤", error[0].msg, "ERROR", "OKONLY");

            }

        }


        $("#btnConfirm").on("click", function () {

            var jsonData = getInsertDiv();

            console.error(jsonData);

            var DataArgs =
                {
                    method: "post",
                    url: "SKL_1_1_Maintain_Interest_Project/Interest_Project_Save",
                    data: jsonData,
                    oMethod: function (e) {
                        console.info(e);
                        SexyAlert("提示", "新增成功！", "OK", "OKONLY", function () {
                            genInit(e);
                        });
                    }
                };
            docCore.ajax(DataArgs, true, true);

        });

        $("#btnUpdate").on("click", function () {

            var jsonData = getInsertDiv();
            jsonData['Project_Uid'] = $("#Project_Uid").val();

            console.error(jsonData);

            var DataArgs =
                {
                    method: "post",
                    url: "SKL_1_1_Maintain_Interest_Project/Interest_Project_Update",
                    data: jsonData,
                    oMethod: function (e) {
                        console.info(e);
                        SexyAlert("提示", "更新成功！", "OK", "OKONLY", function () {
                            clearInsertDiv();
                            $(".add_div").show();
                            $(".update_div").hide();
                            genInit(e);
                        });
                    }
                };
            docCore.ajax(DataArgs, true, true);
        });

        $("#btnCancel").on("click", function () {
            $(".update_div").hide();
            $(".add_div").show();

            clearInsertDiv();
        });



        $(".Project_Interest").filter('[value="1"]').prop('checked', true);
        $("#edit tbody tr").hide().removeClass("active");;
        $("#edit tbody tr:first-child").show().addClass("active");

        $(".Project_Interest").on("click", function () {

            if ($(this).val() == "1") {
                $("#section_block").show();
            } else {
                $("#section_block").hide();
            }
        });


        $("#ProjectSection").on("change", function () {

            controlSection($(this).find(":selected").val());
        })


    });
