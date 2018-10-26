var showPenalties = true;
var simulateLunch = false;
var showOptions = false;
var dateFinal;
var timbrature;
var timeLimitIn;


(function($) {})(jQuery);

document.addEventListener('DOMContentLoaded', function() {

    $('#buttonBarDiv').show();
    $("#optionsDiv").hide();
    $('#tableDiv').show();
    $('#myBar').show();
    $("#optionsButton").css("opacity",0.5);

	loadFromLocalStorage();

	
    chrome.runtime.sendMessage({
        message: "GET_DATA"
    }, function(response) {

        if (response != undefined) {
			timbrature = response.value;
			if(timbrature!=undefined && timbrature!=null) dateFinal=calculateDateFinal(timbrature,true);
            createPopup(false, false);
        } else {
            $('#total').append("ERRORE");
        }
    });
    
    $('#appVersion').append(chrome.app.getDetails().version);

	$("#titleImg")[0].addEventListener('click', openTimbraturePage);
    $("#optionsButton")[0].addEventListener('click', optionsClickHandler);
    $("#saveOptionsButton")[0].addEventListener('click', saveOptionsClickHandler);
    $("#discardOptionsButton")[0].addEventListener('click', optionsClickHandler);
    $("#testNotificationButton")[0].addEventListener('click', testNotificationButtonClickHandler);

    if (playSoundOnNotifications == "checked") {
        $("#showSoundNotificationsCB").prop("checked", true);
    }
    
    var elements = $('[id^="tabButton"]');
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("click", function(i) {
        //window.alert("clicked "+i.currentTarget.id);

        var k, tabcontent, tablinks;

        tabcontent = document.getElementsByClassName("tabcontent");
        for (k = 0; k < tabcontent.length; k++) {
            tabcontent[k].style.display = "none";
        }

        tablinks = document.getElementsByClassName("tablinks");
        for (k = 0; k < tablinks.length; k++) {
            tablinks[k].className = tablinks[k].className.replace(" active", "");
        }

        document.getElementById(i.currentTarget.name).style.display = "block";
        evt.currentTarget.className += " active";

    });
}

});



function openTimbraturePage(e){
    var newURL = "http://remedy.gpi.it/arsys/shared/login.jsp";
    chrome.tabs.create({ url: newURL });
}


function createPopup() {

    $("#timeTable").empty();
    var dateNow = new Date();
	
	
    if (timbrature == undefined || timbrature == null || timbrature.length == 0) {
		
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			var tabURL = tabs[0].url;
			console.log(tabURL);
			
			$('#tableDiv').empty();
			$('#buttonBarDiv').empty();
			
			if(tabURL.indexOf(appUrl) !== -1){
				$('#tableDiv').append("<div style='width:95%;height:100%;padding-left: 5px;'>Aggiorna questa pagina (F5)</div>");
				$('#buttonBarDiv').append("<button id='buttonReload' class='buttonWhite' style='width:200px' id='reloadButton' value='reloadButton' style=''>ricarica pagina</button>");
				$("#buttonReload")[0].addEventListener('click', reloadPageClickHandler);				
			}else{
				$('#tableDiv').append("<div style='width:95%;height:100%;padding-left: 5px;'>Andare sulla pagina delle timbrature ed aggiornare.</div>");	
				$('#buttonBarDiv').append("<button id='navigateBtn' class='buttonWhite' style='width:200px' value='navigateBtn'>apri timbrature</button>");
				
				$("#navigateBtn")[0].addEventListener('click', openTimbraturePage);
			}
		});
		
        return;
    }

    for (var i = 0; i < timbrature.length; i++) {
        $('#timeTable').append("<tr><td width='70%' style='padding-left:5px;'> " + timbrature[i].type + "</td><td>" + pad(new Date(timbrature[i].date).getHours(), 2) + ":" + pad(new Date(timbrature[i].date).getMinutes(), 2) + "</td></tr>");
    }


	
    timeLimitIn = new Date(timbrature[0].date);
    
    $('#timeLimitInHHInput').val(timeLimitInHH);
    $('#timeLimitInMMInput').val(timeLimitInMM);
    $('#lunchBreakDurationInput').val(lunchBreakDuration);

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
            extraTimeBlocks = 1; //FIXME
        }

        var workPct = (100 * (diffMsA + diffMsB)) / (480*1000*60 + (extraTimeBlocks * 30*1000*60));
		var workPctCapped = workPct;
		
        if (workPctCapped > 100) workPctCapped = 100;
        if (workPctCapped < 0) workPctCapped = 0;

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
			$("#myBar").css("animation-name","pbwidth, pbscroll");
			$("#myBar").css("background-attachment","fixed");
        }
		
		if(timeDiff>0){

			s=$("#myBar").text()+"&nbsp;(+"+Math.floor((timeDiff / 1000) / 60)+"&nbsp;min)";			
			$("#myBar").html(s);
			$("#myBar").css("background","repeating-linear-gradient(135deg,#FF0000 0%, #FF0000 5%,#DD0000 5%,#DD0000 10%)");
			$("#myBar").css("background-attachment","fixed");
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
            $('#buttonBarDiv').append("<button id='buttonPasto' class='buttonWhite' style='width:200px' id='lunchToggle' value='aggiungiPasto' style=''>aggiungi pasto</button>");
            $("#buttonPasto")[0].addEventListener('click', pastoToggleClickHandler);
        } else {
            $("#buttonPasto").text("aggiungi pasto");
            $("#buttonPasto").attr('value', 'aggiungiPasto');
            $('#penaltyToggle').hide();
        }

        if (simulateLunch == true) {
            $("#buttonPasto").text("rimuovi pasto");
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

        $('#total').append("<p class='blacktextsmall'> - La pausa pranzo minima &egrave; di mezz'ora (+" + lunchPatch + " min).</p>");

    }

}



function penaltyToggleClickHandler(e) {
    $('#timeTable').empty();
    showPenalties = !showPenalties;
	dateFinal = new Date(calculateDateFinal(timbrature,showPenalties));
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
        $('#buttonBarDiv').hide();
        $('#tableDiv').hide();
        $('#myBar').hide();
        $("#optionsDiv").show();
		$("#optionsButton").css("opacity",1)
    } else {
        $('#buttonBarDiv').show();
        $("#optionsDiv").hide();
        $('#tableDiv').show();
        $('#myBar').show();
		$("#optionsButton").css("opacity",0.5)
        createPopup();
    }
}



function testNotificationButtonClickHandler(e){
	chrome.runtime.sendMessage({
        message: "SHOW_INFO_NOTIFICATION",
		value: "Prova!"
    }, function(response) {});
}


function saveOptionsClickHandler(e) {
    
    lunchBreakDuration = $("#lunchBreakDurationInput").val();
	localStorage.lunchBreakDuration = lunchBreakDuration;
	localStorage.timeLimitInHH= $("#timeLimitInHHInput").val();
	localStorage.timeLimitInMM= $("#timeLimitInMMInput").val();	

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