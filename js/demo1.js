window.addEventListener('load', eventWindowLoaded, false);  
function eventWindowLoaded() {

	var J=Jx();

    var elems = ["happy1", "happy2", "happy3", "happy4", "happy5", "new1", "new2", "new3", "year1", "year2", "year3", "year4"],
    	lettersHappy=["happy1", "happy2", "happy3", "happy4", "happy5"],
    	lettersNew=["new1", "new2", "new3"],
    	lettersYear=["year1", "year2", "year3", "year4"],
    	playParam = {},
        audio = ['song1','explode1','chimes','notify','tada','logoff','Whistling','WHOOSH'];
    	animSettings = {},
    	isAnimationPlay=false;

    var	$codeblock,$status;


    function hiddenLetters (argument) {
    	for (var i = elems.length - 1; i >= 0; i--) {
    		elem = J.dom.id(elems[i]);
    		elem.classList.add('transparent');
    	};
    }


    var	effectFunctions = {
    	'flash':function(){
    		JXAnimate.flash(elems,playParam);
    	},
    	'FlipInY_Donimo':function(args){
    		hiddenLetters();
    		JXAnimate.flipInY(
    			elems,
    			{duration:'1500ms'},
    			{
    				domino:150,
    				callback:function(argument){
    					argument.elem.classList.remove('transparent');
    				}
    			}
    		);
    	},
    	'tada_sound':function (argument) {
    		JXAnimate.applyCss(
    			elems,
    			playParam,
    			{
    				name:'tada', //CSS KeyFrame Name in Animate.css
    				sound:'tada',
    				volume:'1'
    			});
    	},
    	'workflow':function (args) {
    		var callback3=function (argument) {
    				argument.elem.classList.remove('transparent');
    			},
    			anim3 = function (argument) {
					JXAnimate.applyCss(
		    			lettersYear,
		    			{duration:'800ms'},
		    			{
    						name:'fadeInUp', //CSS KeyFrame Name in Animate.css
		    				domino:150,
		    				sound:'chimes',
		    				callback:callback3
		    			}
		    		); 
    			}, 
    			callback2 = function (argument) {
    				argument.elem.classList.remove('transparent');
    				if (argument.elem.id=='new1') {
    					anim3();
    				}; 				
    			},
    			anim2 = function (argument) {
					JXAnimate.flipInX(
		    			lettersNew,
		    			{duration:'1200ms'},
		    			{
		    				domino:150,
		    				sound:'notify',
		    				callback:callback2
		    			}
		    		); 
    			}, 
    			callback1 = function (argument) {
    				argument.elem.classList.remove('transparent');
    				if (argument.elem.id=='happy1') {
    					anim2();
    				}; 				
    			},
    			anim1 = function (argument) {
					JXAnimate.flipInY(
		    			lettersHappy,
		    			{duration:'1200ms'},
		    			{
		    				domino:150,
		    				sound:'logoff',
		    				callback:callback1
		    			}
		    		); 
    			};
    		hiddenLetters();
			anim1();    			

    	},
    	'lightSpeedIn':function (argument) {
    		hiddenLetters();
    		JXAnimate.applyCss(
    			elems,
    			{duration:'500ms'},
    			{
		    		domino:250,
    				name:'lightSpeedIn', //CSS KeyFrame Name in Animate.css
    				sound:'WHOOSH',
    				volume:'0.8',
    				callback:function(args){
    					if(args.elem.id!='year4'){JXAnimate.Audio.playSound('WHOOSH');}
    					args.elem.classList.remove('transparent');
    				}
    			}
    		);

    	}
    }

    function playBegin(){
    	isAnimationPlay=true;
    	$status.classList.remove('standby');

    }
    function playFinished(){
		isAnimationPlay=false;
    	$status.classList.add('standby');
    }

    function init (argument) {
    	$codeblock = J.dom.id('code_block');
    	$status = J.dom.id('status');

    	animSettings['domino']='150';
    	playParam['duration']='1000ms';

		JXAnimate.Audio.init({path:'./sounds/'});
		JXAnimate.Audio.preload(audio,1);

    	document.addEventListener('click',function(e) {	
	        var elem = e.target, 
	        	effect = elem.getAttribute('effect'),
	        	runFunc;

	        runFunc = effectFunctions[effect];
	        if(!isAnimationPlay && runFunc && J.isFunction(runFunc)){    
	        	playBegin();    	
	        	runFunc();
	        	$codeblock.innerHTML='<pre class="brush: js;" id="animate_code">'+runFunc+'</pre>';
	        	SyntaxHighlighter.highlight(J.dom.id('animate_code'));
	        	
	        	setTimeout(playFinished,3000);
	        }
    	});
    }


    init();
}
