var showChromeNotifications;
var lastParse;
var timeLimitInHH;
var timeLimitInMM;
var lunchBreakDuration;
var baseUrl;
var appUrl;
var playSoundOnNotifications;
var timeLimitInHH_DEFAULT 			= 9;
var timeLimitInMM_DEFAULT 			= 30;
var lunchBreakDuration_DEFAULT		= 45;
var showChromeNotifications_DEFAULT	= "checked";
var playSoundOnNotifications_DEFAULT	= "";
var penaltyTime=0;

function pad(num, size) {
	var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function loadFromLocalStorage(){
	
	showChromeNotifications = localStorage.showChromeNotifications;
	playSoundOnNotifications= localStorage.playSoundOnNotifications;
	lastParse				= localStorage.lastParse;
	timeLimitInHH 			= localStorage.timeLimitInHH;
	timeLimitInMM 			= localStorage.timeLimitInMM;
    lunchBreakDuration 		= localStorage.lunchBreakDuration;
    baseUrl                 = localStorage.baseUrl;
	
	if(timeLimitInHH==undefined || timeLimitInHH == null || timeLimitInHH=="undefined"){
		timeLimitInHH=timeLimitInHH_DEFAULT;
	}
	if(timeLimitInMM==undefined || timeLimitInMM == null || timeLimitInMM=="undefined"){
		timeLimitInMM=timeLimitInMM_DEFAULT;
	}
	
	if (lunchBreakDuration == null || lunchBreakDuration == undefined || lunchBreakDuration == "undefined") {
        lunchBreakDuration = lunchBreakDuration_DEFAULT;
    }

    if (showChromeNotifications == null || showChromeNotifications == undefined || showChromeNotifications == "undefined") {
        showChromeNotifications = showChromeNotifications_DEFAULT;

    }
	
    if (playSoundOnNotifications == null || playSoundOnNotifications == undefined || playSoundOnNotifications == "undefined") {
        playSoundOnNotifications = playSoundOnNotifications_DEFAULT;

    }

    if (baseUrl != null) {
        appUrl = baseUrl+"/arsys/forms/caleido/Home+Page/Default+Admin+View/?cacheid";

    }
}

function calculateDateFinal(timb_array, showPenalties) {

    var dateFinal;
    var dateNow = new Date();
    //var noPenalties = true;



    if (timb_array.length == 3) {

        var diffMsA = timb_array[1].date - timb_array[0].date;
        //var diffMinsA = Math.floor((diffMsA / 1000) / 60);



        var diffMsLunchTime = timb_array[2].date - timb_array[1].date;
        //var diffMinsLunchTime = Math.floor((diffMsLunchTime / 1000) / 60);

        var lunchPatch = 0;
        if (diffMsLunchTime < 30*1000*60) lunchPatch = 30*1000*60 - diffMsLunchTime;

        var diffMsB = dateNow - timb_array[2].date;
        //var diffMinsB = Math.floor((diffMsB / 1000) / 60);



        //var minutesToWork = 480 - diffMinsA - diffMsB*1000*60 + lunchPatch;
		var millisecondsToWork = (480*1000*60 - diffMsA - diffMsB + lunchPatch);

        var msFinal = timb_array[2].date + diffMsB + millisecondsToWork;
        dateFinal = new Date(msFinal);


        var minutesRemaining = ((new Date((dateFinal.getTime() - dateNow.getTime())) / 1000) / 60);



        var penalty = false;
		
		var delayTimeBlocks = 0;
        var extraTimeBlocks = 0;
	
		timeLimitIn = new Date(new Date().setHours(timeLimitInHH, timeLimitInMM, 0));
       
    	var isLate = (timb_array[0].date - timeLimitIn.getTime() > 0);


        if (showPenalties && isLate) {

            penalty = true;
			
            var delay = timb_array[0].date - timeLimitIn.getTime();
            //var delayMins = Math.ceil((delay / 1000) / 60);

			delayTimeBlocks = Math.ceil(delay/(15*60*1000));  // xe de 15
			
			extraTimeBlocks = Math.ceil(delayTimeBlocks/2);   // malamente de 30

            dateFinal = new Date(dateFinal.getTime() + (extraTimeBlocks * 30 * 60 * 1000));

			
            //dateFinal = new Date(penaltyTime);
            var minutesRemaining = ((new Date((dateFinal.getTime() - dateNow.getTime())) / 1000) / 60);

        }

    }



    if (dateFinal != undefined)
        return dateFinal.getTime();
    else
        return null;


}

/*
function calculateDateFinal(timb_array) {

    var dateFinal;
    var dateNow = new Date();
    var noPenalties = true;



    if (timb_array.length == 3) {

        var diffMsA = timb_array[1].date - timb_array[0].date;
        var diffMinsA = Math.floor((diffMsA / 1000) / 60);



        var diffMsLunchTime = timb_array[2].date - timb_array[1].date;
        var diffMinsLunchTime = Math.floor((diffMsLunchTime / 1000) / 60);

        var lunchPatch = 0;
        if (diffMinsLunchTime < 30) lunchPatch = 30 - diffMinsLunchTime;

        var diffMsB = dateNow - timb_array[2].date;
        var diffMinsB = Math.floor((diffMsB / 1000) / 60);



        var minutesToWork = 480 - diffMinsA - diffMinsB + lunchPatch;

        var msFinal = timb_array[2].date + diffMsB + (minutesToWork * 60 * 1000);
        dateFinal = new Date(msFinal);


        var minutesRemaining = ((new Date((dateFinal.getTime() - dateNow.getTime())) / 1000) / 60);



        var penalty = false;
        var extraTimeBlocks = 0;

	
		timeLimitIn = new Date(new Date().setHours(timeLimitInHH, timeLimitInMM, 0));
       
    	var isLate = (timb_array[0].date - timeLimitIn.getTime() > 0);




        if (noPenalties == false && isLate) {

            penalty = true;
            var ritardo = timb_array[0].date - timeLimitIn.getTime();
            var ritardoMins = Math.floor((ritardo / 1000) / 60);

            extraTimeBlocks = Math.floor(ritardoMins / 30) + 1;


            var penaltyTime = new Date(dateFinal.getTime() + (extraTimeBlocks * 30 * 60 * 1000));



            dateFinal = new Date(penaltyTime);
            var minutesRemaining = ((new Date((dateFinal.getTime() - dateNow.getTime())) / 1000) / 60);




        }

    }



    if (dateFinal != undefined)
        return dateFinal.getTime();
    else
        return null;


}

*/