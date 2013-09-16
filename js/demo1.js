window.addEventListener('load', eventWindowLoaded, false);  
function eventWindowLoaded() {

	var J=Jx();

    var elems = ["happy1", "happy2", "happy3", "happy4", "happy5", "new1", "new2", "new3", "year1", "year2", "year3", "year4"],
    	playParam = {},
    	animSettings = {};


    function hiddenLetters (argument) {
    	for (var i = elems.length - 1; i >= 0; i--) {
    		elem = J.dom.id(elems[i]);
    		elem.classList.add('transparent');
    	};
    }

    document.addEventListener("click",
	    function(e) { 
	        var elem = e.target, 
	        	cssName,
	        	id = elem.id;
	        //alert(id);
	        switch(id){
	        	case 'happy1':
	        		JXAnimate.flash(elems,playParam);
	        	break;
	        	case 'happy2':
	        		hiddenLetters();
	        		JXAnimate.flipInY(elems,{duration:'1500ms'},
	        			{
	        				domino:150,
	        				callback:function(argument){
	        					argument.elem.classList.remove('transparent');
	        				}
	        			}
	        			);
	        	break;
	        }
	    }
    );

    function init (argument) {
    	animSettings['domino']='150';
    	playParam['duration']='1000ms';
    }


    init();

}
