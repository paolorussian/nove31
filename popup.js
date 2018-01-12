var showPenalties = true;
var simulateLunch = false;
var showOptions = false;
var dateFinal;
var timbrature;
var timeLimitIn;


(function($) {})(jQuery);


//function nodeInsertedCallback(event) {
//    console.log(event);
//};


document.addEventListener('DOMContentLoaded', function() {



    //lunchBreakDuration = localStorage.lunchBreakDuration;
	loadFromLocalStorage();



    $('#total').append("<div id='titleDiv' class='titleDiv'><img class='optionsButton' id='optionsButton' src='cog.png' title='Opzioni'/><img id='titleImg' class='titleImg' src='title.png'/></div>");

	$("#titleImg")[0].addEventListener('click', openTimbraturePage);
	

    $("#optionsButton")[0].addEventListener('click', optionsClickHandler);

    $('#total').append("<div id='tableDiv' class='tableDiv'></div>");
    $('#tableDiv').append("<table id='timeTable' class='clockerTable'></table>");


    $('#total').append("<div id='progressBarDiv' class='progressBarDiv'></div>");

    $('#total').append("<div id='buttonBarDiv' class='buttonBarDiv'></div>");


	
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

	
	
	


});




function openTimbraturePage(e){
	
	 var newURL = "http://remedy.gpi.it/arsys/shared/login.jsp";
     chrome.tabs.create({ url: newURL });
	
}


function createPopup() {


    $("#timeTable").empty();

    var dateNow = new Date();
	//dateNow = new Date(new Date().setHours(17,0));

    ////////////////////////////////////////////////////////////////////////////////////////////


		

	
	
	
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
	//timeLimitInHH = localStorage.timeLimitInHH;
	//timeLimitInMM = localStorage.timeLimitInMM;
    timeLimitIn = new Date(timeLimitIn.setHours(timeLimitInHH, timeLimitInMM, 0));
    var isLate = (timbrature[0].date - timeLimitIn.getTime() > 0);

    if (timbrature.length == 3) {


	
        var dateFinalBkp = dateFinal;
	/*		
        if (isLate && showPenalties) {
            dateFinal = dateFinal + 30 * 60 * 1000;
        }
*/
        $('#timeTable').append("<tr><td class='' style='padding-left:5px;'>Uscita</td><td id='finalTime' class=''>" + pad(new Date(dateFinal).getHours(), 2) + ":" + pad(new Date(dateFinal).getMinutes(), 2) + "</td></tr>");

        if (isLate == true) {
            $('#finalTime').text($('#finalTime').text() + "*");
        }

        dateFinal = dateFinalBkp;



        ///////////////////// PROGRESS BAR ////////////////////////////////

        var diffMsA = timbrature[1].date - timbrature[0].date;
//        var diffMinsA = Math.floor((diffMsA / 1000) / 60);
        var diffMsB = dateNow - timbrature[2].date;
//        var diffMinsB = Math.floor((diffMsB / 1000) / 60);
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
			//$("#myBar").css("background-color","#4CAF50");
			$("#myBar").css("animation-name","pbwidth, pbscroll");
			$("#myBar").css("background-attachment","fixed");
			//$("#myBar").css("repeating-linear-gradient","repeating-linear-gradient(45deg,#FFc274 0%, #FFc274 5%,#FFb85c 5%,#FFb85c 10%)");
        }
		
		if(timeDiff>0){
			//var s=$("#myBar").text() + " (+"+Math.floor((timeDiff / 1000) / 60)+" min)";
			s=$("#myBar").text()+"&nbsp;(+"+Math.floor((timeDiff / 1000) / 60)+"&nbsp;min)";			
			$("#myBar").html(s);
			
			  $("#myBar").css("background","repeating-linear-gradient(135deg,#FF0000 0%, #FF0000 5%,#DD0000 5%,#DD0000 10%)");
			  $("#myBar").css("background-attachment","fixed");
			//$("#myBar").css("animation-name","pbwidth, pbscrollRed");
			//$("#myBar").css("background-color","#FF0000");
		}
		

        ////////////////////////////////////////////////////////////////////

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


        //$('#penaltyToggle').hide();

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

    //if (isLate) {
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
        showOptionsPage();
    } else {
        $('#buttonBarDiv').show();
        $("#optionsDiv").hide();
        $('#tableDiv').show();
        $('#myBar').show();
		$("#optionsButton").css("opacity",0.5)
        createPopup();
    }

}


function showOptionsPage() {

	
	

    if ($('#optionsDiv').length == 0) {
        $('#total').append("<div id='optionsDiv' class='optionsDiv'></div>");

		
        $('#optionsDiv').append("<p>Versione: " + chrome.app.getDetails().version + "</p>");
        $('#optionsDiv').append("</br>");

		
		$('#optionsDiv').append("Ora limite entrata ");
        $('#optionsDiv').append(" <input type='text' id='timeLimitInHHInput' value='" + timeLimitInHH + "' style='width: 18px;'/>:<input type='text' id='timeLimitInMMInput' value='" + timeLimitInMM + "' style='width: 18px;'/></br>");
		
		$('#optionsDiv').append("</br>");
        $('#optionsDiv').append("Durata pausa pranzo simulata:");
        $('#optionsDiv').append(" <input type='text' id='lunchBreakDurationInput' value='" + lunchBreakDuration + "' style='width: 20px;'/> min");

        $('#optionsDiv').append("</br></br>");
        $('#optionsDiv').append("<p>Mostra notifiche: <input id='showChromeNotificationsCB' type='checkbox'></input><input id='testNotificationButton' type='button' value='test'></input></p>");
        if (showChromeNotifications == "checked") {
            $("#showChromeNotificationsCB").prop("checked", true);
        }
		
		$("#testNotificationButton")[0].addEventListener('click', testNotificationButtonClickHandler);
		
		
		$('#optionsDiv').append("<p>Notifiche sonanti: <input id='showSoundNotificationsCB' type='checkbox'></input></p>");
        if (playSoundOnNotifications == "checked") {
            $("#showSoundNotificationsCB").prop("checked", true);
        }

		

        $('#optionsDiv').append("<button class='buttonGreen' style='width:99px' id='saveOptionsButton' value='salva'>Salva</button><button class='buttonYellow' style='width:99px;margin-left:2px;' id='discardOptionsButton' value='annulla'>Annulla</button>");

        $("#saveOptionsButton")[0].addEventListener('click', saveOptionsClickHandler);
        $("#discardOptionsButton")[0].addEventListener('click', optionsClickHandler);


    }


}


function testNotificationButtonClickHandler(e){
	
	
	chrome.runtime.sendMessage({
        message: "SHOW_INFO_NOTIFICATION",
		value: "Prova!"
    }, function(response) {
       
    });
	
	
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
	
	
	
//	loadFromLocalStorage()
    window.close();
}


function reloadPageClickHandler(e) {

    chrome.tabs.reload();
    window.close();

}