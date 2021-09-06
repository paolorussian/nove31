var showPenalties = true;
var simulateLunch = false;
var showOptions = false;
var dateFinal;
var timbrature;
var timeLimitIn;

(function($) {})(jQuery);

document.addEventListener('DOMContentLoaded', function() {

    $('#missingCongifDiv').hide();
    $('#mainDiv').show();
    $("#optionsDiv").hide();
    $("#quickLinksDiv").hide();
    $('#tabButtonMain').addClass('active');

    loadFromLocalStorage();

    console.log("POPUP: sending GET_DATA message");

    chrome.runtime.sendMessage({
        message: "GET_DATA"
    }, function(response) {

        console.log("POPUP: received GET_DATA response:");
        console.log(response);

        if (response != undefined) {
            timbrature = response.value;
            if (timbrature != undefined && timbrature != null)
                dateFinal = calculateDateFinal(timbrature, true);
            createPopup(false, false);
        } else {

            $('#tableDiv').append("ERRORE");
        }

    });

    $('#appVersion').append(chrome.app.getDetails().version);

    $("#titleDiv")[0].addEventListener('click', openTimbraturePage);
    $("#saveOptionsButton")[0].addEventListener('click', saveOptionsClickHandler);
    $("#discardOptionsButton")[0].addEventListener('click', optionsClickHandler);
    $("#testNotificationButton")[0].addEventListener('click', testNotificationButtonClickHandler);

    $("[id^='quickLink']").click(function(e) {
        
        switch (e.currentTarget.id) {
        case "quickLink1":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/GPI:Console:Timbrature/Timbrature/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        case "quickLink2":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/GPI:Console:Ferie/Controllo+assenze/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        case "quickLink3":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/GPI%3ARapportini%3AConsole/Default+Admin+View/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        case "quickLink4":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/GPI%3AConsole%3AUtente/Default+Administrator+View/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        case "quickLink5":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/VPN%3AHome/Default+Admin+View/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        case "quickLink6":
            var newURL = "https://" + baseUrl + "/arsys/forms/caleido/GPI%3AConsole%3ANoteSpesa/Default+Admin+View/";
            chrome.tabs.create({
                url: newURL
            });
            break;
        default:
            break;
        }
        
    });

    if (showChromeNotifications == "checked") {
        $("#showChromeNotificationsCB").prop("checked", true);
    }

    if (playSoundOnNotifications == "checked") {
        $("#showSoundNotificationsCB").prop("checked", true);
    }

    $('#tabButtonMain')[0].addEventListener('click', function(e) {
        if(appUrl){
            $('#mainDiv').show();
            $("#optionsDiv").hide();
            $("#quickLinksDiv").hide();
            $('#missingCongifDiv').hide();
            $('#tabButtonMain').addClass('active');
            $('#tabButtonQuickLinks').removeClass('active');
            $('#tabButtonOptions').removeClass('active');
        }
    });

    $('#tabButtonQuickLinks')[0].addEventListener('click', function(e) {
        if(appUrl){
            $('#mainDiv').hide();
            $("#optionsDiv").hide();
            $("#quickLinksDiv").show();
            $('#missingCongifDiv').hide();
            $('#tabButtonMain').removeClass('active');
            $('#tabButtonQuickLinks').addClass('active');
            $('#tabButtonOptions').removeClass('active');
        }
    });

    $('#tabButtonOptions')[0].addEventListener('click', function(e) {
        // if(appUrl){
            $('#mainDiv').hide();
            $("#optionsDiv").show();
            $("#quickLinksDiv").hide();
            $('#missingCongifDiv').hide();
            $('#tabButtonMain').removeClass('active');
            $('#tabButtonQuickLinks').removeClass('active');
            $('#tabButtonOptions').addClass('active');
       // }
    });

}
);

function openTimbraturePage(e) {
    var newURL = "https://" + baseUrl + "/arsys/shared/login.jsp";
    chrome.tabs.create({
        url: newURL
    });
}
/*
function quickLink1Handler(e) {
    var newURL = "https://"+baseUrl+"/arsys/forms/caleido/GPI:Console:Timbrature/Timbrature/";
    chrome.tabs.create({ url: newURL });
}

function quickLink2Handler(e) {
    
    var newURL = "https://"+baseUrl+"/GPI:Console:Ferie/Controllo+assenze/";
    chrome.tabs.create({ url: newURL });
}
*/

function createPopup() {

    $("#timeTable").empty();
    var dateNow = new Date();

    $('#timeLimitInHHInput').val(timeLimitInHH);
    $('#timeLimitInMMInput').val(timeLimitInMM);
    $('#lunchBreakDurationInput').val(lunchBreakDuration);
    $('#baseUrlInput').val(baseUrl);
    $('#showChromeNotificationsCB').ch

    if(!appUrl){
        $('#missingCongifDiv').show();
        $('#mainDiv').hide();
        $("#optionsDiv").hide();
        $("#quickLinksDiv").hide();
        return;
    }

    /*
    if(baseUrl) {
        appUrl = baseUrl + "/arsys/forms/caleido/Home+Page/Default+Admin+View/?cacheid";
    }
    */

    
    if (timbrature == undefined || timbrature == null || timbrature.length == 0) {

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            var tabURL = tabs[0].url;

            $('#tableDiv').empty();
            $('#buttonBarDiv').empty();

            if(appUrl){

                if (tabURL.indexOf(appUrl) !== -1) {
                    $('#tableDiv').append("<div style='width:95%;height:100%;padding-left: 5px;'>"+
                    "Nessuna timbratura rilevata, prova ad aggionare questa pagina (F5)</div>");
                    $('#buttonBarDiv').append("<button id='buttonReload' class='buttonWhite' style='width:228px' id='reloadButton' value='reloadButton' style=''>ricarica pagina</button>");
                    $("#buttonReload")[0].addEventListener('click', reloadPageClickHandler);
                } else {
                    $('#tableDiv').append("<div style='width:95%;height:100%;padding-left: 5px;'>"
                    +"Andare sulla pagina delle timbrature ed aggiornare."
                    +"</div>");
                    $('#buttonBarDiv').append("<button id='navigateBtn' class='buttonWhite' style='width:228px' value='navigateBtn'>apri timbrature</button>");
                    $("#navigateBtn")[0].addEventListener('click', openTimbraturePage);
                }
            } else {
                $('#tableDiv').append("<div style='width:95%;height:100%;padding-left: 5px;'>L'url del sito delle presenze non e' definita :(</div>");
            }
        });

        return;
    }

    for (var i = 0; i < timbrature.length; i++) {
        $('#timeTable').append("<tr><td width='74%' style='padding-left:5px;'> " + timbrature[i].type + "</td><td>" + pad(new Date(timbrature[i].date).getHours(), 2) + ":" + pad(new Date(timbrature[i].date).getMinutes(), 2) + "</td></tr>");
    }

    timeLimitIn = new Date(timbrature[0].date);

    timeLimitIn = new Date(timeLimitIn.setHours(timeLimitInHH, timeLimitInMM, 0));
    var isLate = (timbrature[0].date - timeLimitIn.getTime() > 0);

    if (timbrature.length == 3) {

        var dateFinalBkp = dateFinal;
        $('#timeTable').append("<tr><td class='' style='padding-left:5px;'>Uscita</td><td id='finalTime' class=''>" + pad(new Date(dateFinal).getHours(), 2) + ":" + pad(new Date(dateFinal).getMinutes(), 2) + "</td></tr>");
        if (isLate == true) {
            $('#finalTime').text($('#finalTime').text() + "*");
        }
        dateFinal = dateFinalBkp;

        ///////////////////// PROGRESS BAR ////////////////////////////////
        var diffMsA = timbrature[1].date - timbrature[0].date;
        var diffMsB = dateNow - timbrature[2].date;
        var extraTimeBlocks = 0;

        if (isLate && showPenalties) {
            extraTimeBlocks = 1;
            //FIXME
        }

        var workPct = (100 * (diffMsA + diffMsB)) / (480 * 1000 * 60 + (extraTimeBlocks * 30 * 1000 * 60));
        var workPctCapped = workPct;

        if (workPctCapped > 100)
            workPctCapped = 100;
        if (workPctCapped < 0)
            workPctCapped = 0;

        if (simulateLunch == true) {
            $('#progressBarDiv').hide();
        } else {
            $('#progressBarDiv').show();
        }

        var timeDiff = new Date() - new Date(dateFinal);

        if ($('#myProgress').length == 0) {
            $('#progressBarDiv').append("<div id='myProgress'><div id='myBar' style='width:" + Math.floor(workPctCapped) + "%'>" + Math.floor(workPct) + "%</div></div>");

        } else {
            $("#myBar").text(" " + Math.floor(workPct) + "% ");
            $("#myBar").css("width", Math.floor(workPct) + "%");
            $("#myBar").css("animation-name", "pbwidth, pbscroll");
            $("#myBar").css("background-attachment", "fixed");
        }

        if (timeDiff > 0) {

            s = $("#myBar").text() + "&nbsp;(+" + Math.floor((timeDiff / 1000) / 60) + "&nbsp;min)";
            $("#myBar").html(s);
            $("#myBar").css("background", "repeating-linear-gradient(135deg,#FF0000 0%, #FF0000 5%,#DD0000 5%,#DD0000 10%)");
            $("#myBar").css("background-attachment", "fixed");
        }

        $('#penaltyToggle').show();

    } else if (timbrature.length == 1) {

        ////// SIMULA PAUSA PRANZO //////////////////////////////////////////////////////////////////////////////////

        timbrature_sim = [];

        if (simulateLunch == true) {

            var lunchDate = new Date().setHours(12, 30, 0);

            var timbratura_dbg = {
                date: lunchDate,
                fake: true,
                type: "Uscita"
            };

            timbrature_sim.push(timbratura_dbg);

            timbratura_dbg = {
                date: lunchDate + (lunchBreakDuration * 60 * 1000),
                fake: true,
                type: "Entrata"
            };
            timbrature_sim.push(timbratura_dbg);
        }

        for (var i = 0; i < timbrature_sim.length; i++) {
            $('#timeTable').append("<tr><td width='70%' style='padding-left:5px;'> " + timbrature_sim[i].type + "</td><td>" + pad(new Date(timbrature_sim[i].date).getHours(), 2) + ":" + pad(new Date(timbrature_sim[i].date).getMinutes(), 2) + "</td></tr>");
        }

        if (simulateLunch == true) {
            // chiedighe a content de calcolarte la data final
            chrome.runtime.sendMessage({
                message: "CALCULATE_DATE_FINAL",
                value: timbrature.concat(timbrature_sim)
            }, function(response) {

                if (response != undefined) {
                    dateFinal = response.value;

                    if (isLate && showPenalties) {
                        dateFinal = dateFinal + 30 * 60 * 1000;
                    }

                    $('#timeTable').append("<tr><td class='' style='padding-left:5px;'>Uscita</td><td id='finalTime' class=''>" + pad(new Date(dateFinal).getHours(), 2) + ":" + pad(new Date(dateFinal).getMinutes(), 2) + "</td></tr>");

                    if (isLate == true) {
                        $('#finalTime').text($('#finalTime').text() + "*");
                    }

                }
            });
        }

        if ($('#buttonPasto').length == 0) {
            $('#buttonBarDiv').append("<button id='buttonPasto' class='buttonWhite' style='width:228px' id='lunchToggle' value='aggiungiPasto' style=''>aggiungi simulazione pasto</button>");
            $("#buttonPasto")[0].addEventListener('click', pastoToggleClickHandler);
        } else {
            $("#buttonPasto").text("aggiungi simulazione pasto");
            $("#buttonPasto").attr('value', 'aggiungiPasto');
            $('#penaltyToggle').hide();
        }

        if (simulateLunch == true) {
            $("#buttonPasto").text("rimuovi simulazione pasto");
            $("#buttonPasto").attr('value', 'rimuoviPasto');

        }

    }

    /////////////////////////////////////////////////////////////////////////////////////////	

    if ((simulateLunch && isLate) || (isLate && timbrature.length == 3)) {

        $('#penaltyToggle').show();
        if ($('#penaltyToggle').length == 0) {

            $('#buttonBarDiv').append("<button class='buttonPenalty' style='width:200px' id='penaltyToggle' value='rimuovi'> * rimuovi minuti di recupero </button>");
            $("#penaltyToggle")[0].addEventListener('click', penaltyToggleClickHandler);

        }

        if (showPenalties == true) {

            $('#penaltyToggle').attr('value', 'rimuovi');
            $('#penaltyToggle').text(' * rimuovi minuti di recupero ');

        } else {

            $('#penaltyToggle').attr('value', 'aggiungi');
            $('#penaltyToggle').text(' * aggiungi minuti di recupero ');

        }

    }

    var lunchPatch = 0;
    if (lunchPatch > 0) {

        $('#tableDiv').append("<p class='blacktextsmall'> - La pausa pranzo minima &egrave; di mezz'ora (+" + lunchPatch + " min).</p>");

    }

}

function penaltyToggleClickHandler(e) {
    $('#timeTable').empty();
    showPenalties = !showPenalties;
    dateFinal = new Date(calculateDateFinal(timbrature, showPenalties));
    createPopup();
}

function pastoToggleClickHandler(e) {

    $('#timeTable').empty();
    simulateLunch = !simulateLunch;
    if (simulateLunch) {
        showPenalties = true;
    }
    createPopup();
}

function optionsClickHandler(e) {
    showOptions = !showOptions;
    if (showOptions == true) {
        $('#mainDiv').hide();
        $("#optionsDiv").show();
        //$('#buttonBarDiv').hide();
        //$('#myBar').hide();
        //$("#optionsButton").css("opacity",1)
    } else {

        $("#optionsDiv").hide();
        $('#tableDiv').show();
        // $('#buttonBarDiv').show();
        // $('#myBar').show();
        //$("#optionsButton").css("opacity",0.5)
        // createPopup();
    }
}

function testNotificationButtonClickHandler(e) {
    chrome.runtime.sendMessage({
        message: "SHOW_INFO_NOTIFICATION",
        value: "Prova!"
    }, function(response) {});
}

function saveOptionsClickHandler(e) {

    lunchBreakDuration = $("#lunchBreakDurationInput").val();
    localStorage.lunchBreakDuration = lunchBreakDuration;
    localStorage.timeLimitInHH = $("#timeLimitInHHInput").val();
    localStorage.timeLimitInMM = $("#timeLimitInMMInput").val();
    localStorage.baseUrl = $("#baseUrlInput").val();

    showChromeNotifications = $("#showChromeNotificationsCB").prop("checked");
    if (showChromeNotifications) {
        localStorage.showChromeNotifications = "checked";
    } else {
        localStorage.showChromeNotifications = "";
    }

    playSoundOnNotifications = $("#showSoundNotificationsCB").prop("checked");
    if (playSoundOnNotifications) {
        localStorage.playSoundOnNotifications = "checked";
    } else {
        localStorage.playSoundOnNotifications = "";
    }

    //window.close();
}

function reloadPageClickHandler(e) {
    chrome.tabs.reload();
    window.close();
}
