var lastUrl;
var timbrature;
var dateFinal;
var limitInHH;
var limitInMM;


function getNow(){
    return new Date();
}

chrome.runtime.onInstalled.addListener(function(details){
	
    if(details.reason == "install"){
        // first install
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
    }
	var newURL = "changelog.html";
	chrome.tabs.create({ url: newURL });
	
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

    chrome.tabs.getSelected(null, function(tab) {
	
		if(localStorage.showChromeNotifications==undefined || localStorage.showChromeNotifications == "undefined"){
			loadFromLocalStorage();
		}
		
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;


        //se l'ultima parsata è stata fatta in un giorno diverso invalida la lista delle timbrature
        if (localStorage.lastParse != today) {
            timbrature = [];
            showNOInitError();
            return;
        }


        if (lastUrl != tab.url) {
            if (timbrature == undefined || timbrature.length == 0 || timbrature.length == 2) {
                if (tab.url.indexOf(appUrl) == -1) {
                    showClockingWarning();
                }
            } else if (!isNaN(dateFinal) && (new Date(dateFinal) - getNow() < 1 && timbrature.length == 3)) {
                showTimeUpWarning(); 
            }

            lastUrl = tab.url;
        }
    });
});

function showInfoNotification(text) {

	if(localStorage.playSoundOnNotifications=="checked"){
		var yourSound = new Audio('alert5.mp3');
		yourSound.play();
	}

    chrome.notifications.create(
        'clockingReminder', {
            type: 'basic',
            iconUrl: 'images/info.png',
            title: "Informazione",
            message: text
        },
        function() {}
    );

}


function showClockingWarning() {

    if (localStorage.showChromeNotifications) {
        var today = new Date();
        if (today.getDay() == 6 || today.getDay() == 0) { //sabato e domenica no se lavora
            return;
        }
		
		if(localStorage.playSoundOnNotifications=="checked"){
			var yourSound = new Audio('alert5.mp3');
			yourSound.play();
		}

        chrome.notifications.create(
            'clockingReminder', {
                type: 'basic',
                iconUrl: 'images/warning.png',
                title: "ATTENZIONE",
                message: "Hai timbrato l'entrata?"
            },
            function() {}
        );
    }
}

function showTimeUpWarning() {

    if (localStorage.showChromeNotifications) {
        var timeDiff = getNow() - new Date(dateFinal);

	    if(timeDiff>0){

        chrome.notifications.create(
            'clockingReminder', {
                type: 'basic',
                iconUrl: 'images/warning.png',
                title: "ATTENZIONE",
                message: "Timbra l'uscita! (+" + Math.floor((timeDiff / 1000) / 60) + " minuti)"
            },

            function() {}

            );
        }
    }
}


function showNOInitError() {

    if (localStorage.showChromeNotifications) {
        chrome.notifications.create(
            'clockingReminder', {
                type: 'basic',
                iconUrl: 'images/cross.png',
                title: "ATTENZIONE",
                message: "Le timbrature non ci sono oppure non sono state lette"
            },
            function() {}
        );
    }
}

function showTUpdateNotification() {

    if (localStorage.showChromeNotifications) {
        chrome.notifications.create(
            'clockingReminder', {
                type: 'basic',
                iconUrl: 'images/okay.png',
                title: "Okay",
                message: "Timbrature aggiornate"
            },
            function() {}
        );
    }
}

chrome.runtime.onMessage.addListener(

    function(request, sender, sendResponse) {
        
        
        if (request.method == "getBaseUrl") {
            sendResponse({baseUrl: localStorage['baseUrl']});
        } else if (request.message == "UPDATE_TIMBRATURE_FROM_POPUP") { //deprecaterrimo
            timbrature = request.value;
        } else if (request.message == "UPDATE_TIMBRATURE_FROM_CONTENTSCRIPT") {
            timbrature = request.value;
            dateFinal = request.dateFinal;
            showTUpdateNotification();
        } else if (request.message == "GET_DATA") {
            // richiesta dati dal popup.js
            sendResponse({
                message: "OK",
                value: timbrature,
                dateFinal: dateFinal
            });

        } else if (request.message == "T_SET_PREVIEW") {
            dateFinal = new Date(request.value);
        } else if (request.message == "SAVE_LASTPARSE_DAY") {
            localStorage.lastParse = request.value;
        } else if (request.message == "CALCULATE_DATE_FINAL") {
            sendResponse({
                message: "OK",
                value: calculateDateFinal(request.value,true)
            });
        } else if (request.message == "SHOW_INFO_NOTIFICATION") {
            showInfoNotification(request.value);
        }
    });
