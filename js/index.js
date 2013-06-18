        window.addEventListener('load', eventWindowLoaded, false);  
        function eventWindowLoaded() {

            var audio = ['song1','explode1','chimes','notify','tada','logoff','Whistling','WHOOSH'];

            JXAnimate.Audio.init({path:'./sounds/'});
            JXAnimate.Audio.preload(audio);


            SlideShow.init('slide_contrainer',{imgW:640,imgH:400,
                num:2});
                //cardW:240,cardH:150});
                //cardW:120,cardH:75});
                //cardW:480,cardH:300});
            


            document.addEventListener("click",
                function(e) { 
                    var elem = e.target, cssName;

                    var cmd = elem.getAttribute("cmd");
                    if(cmd=='next'){
                        SlideShow.next();
                        JXAnimate.Audio.playSound('Whistling');
                    }
                    if(cmd=='prev'){
                        SlideShow.prev();
                        JXAnimate.Audio.playSound('chimes');
                    }
                }
            );


            switch_domino.addEventListener('click',
                function(e){
                    if(switch_domino.checked){
                        SlideShow.setDonimo(80);
                    }
                    else{
                        SlideShow.setDonimo(false);
                    }
                }
            );

            function playslide(){
                SlideShow.next();
                setTimeout(playslide,3000);
            };
            setTimeout(playslide,3000);


        }


