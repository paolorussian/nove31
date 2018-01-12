var timbrature = [];


window.startObserve = function() {

  var observer = new MutationObserver(function(mutations) {
      
	  
		if(window.location.href.indexOf(appUrl) !== -1){
			
			
				
			timbrature = parseDOM();
			
			var dateFinal = calculateDateFinal(timbrature,true);
			
		
			chrome.runtime.sendMessage({
                    message: "UPDATE_TIMBRATURE_FROM_CONTENTSCRIPT",
                    value: timbrature,
				    dateFinal: dateFinal,
					playSoundOnNotifications: playSoundOnNotifications
                }, function(response) {
                   //alert("PARSED:"+timbrature.length);
                });
			
				
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1;
			var yyyy = today.getFullYear();
			today = dd + '/' + mm + '/' + yyyy;
			
			chrome.runtime.sendMessage({
                    message: "SAVE_LASTPARSE_DAY",
                    value: today
                }, function(response) {});
			
			
			
		}
		
		

  });


  var observerConfig = {
    childList: true,
    subtree: true
  };


  var targetNode = document.body;
  observer.observe(targetNode, observerConfig);
};
window.startObserve();




function parseDOM() {




    var timbrature_array = [];
    var el = $(".ardbntbTimbrature > .TableInner > .BaseTableOuter > .BaseTableInner > .BaseTable").find("tr");
    var results = el;


	

    for (var i = 1; i < results.length; i++) {


        var dateString = $($(results[i]).find("td")[0]).find("nobr").find("span").html();
        var day = dateString.split(" ")[0];
        var time = dateString.split(" ")[1];
        var date = new Date(day.split("/")[2], day.split("/")[1] - 1, day.split("/")[0], time.split(".")[0], time.split(".")[1], time.split(".")[2]);
        var type = $($(results[i]).find("td")[1]).find("nobr").find("span").html();

        var timbratura = {
			date: date.getTime(),
            type: type
        };

    
        timbrature_array.push(timbratura);
		
	
		
	}
	
	
	
	/*
		
	//	=================== DEBUG ===========================
	timbrature_array = [];

	var timbratura_dbg = {
		date: new Date().setHours(9, 31, 0),
		type: "Entrata"
	};
	timbrature_array.push(timbratura_dbg);

	timbratura_dbg = {
		date: new Date().setHours(12, 30, 0),
		type: "Uscita"
	};
	timbrature_array.push(timbratura_dbg);
	


	timbratura_dbg = {
		date: new Date().setHours(13,0,0),
		type: "Entrata"
	};
	timbrature_array.push(timbratura_dbg);
	//=====================================================================


*/



	timbrature_array.sort(function(a, b){return a.date-b.date});


    return timbrature_array;
}
