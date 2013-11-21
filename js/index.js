        window.addEventListener('load', eventWindowLoaded, false);  
        function eventWindowLoaded() {

            _Slider.init();

            var audio = ['song1','explode1','chimes','notify','tada','logoff','Whistling','WHOOSH'],
                cardnum=8,
                autoplay_interval=4000,
                default_domino = 900/cardnum/cardnum;


            JXAnimate.Audio.init({path:'./sounds/'});
            JXAnimate.Audio.preload(audio,1);


            SlideShow.init('slide_contrainer',{imgW:640,imgH:400,
                num:cardnum});
                //cardW:240,cardH:150});
                //cardW:120,cardH:75});
                //cardW:480,cardH:300});
            SlideShow.setDonimo(default_domino);

            //添加更多图片
            SlideShow.addImgByUrl('style/images/m2.jpg');
            SlideShow.addImgByUrl('style/images/m3.jpg');
            SlideShow.addImgByUrl('style/images/m4.jpg');
            SlideShow.addImgByUrl('style/images/m5.jpg');
            SlideShow.addImgByUrl('style/images/m6.jpg');
            SlideShow.addImgByUrl('style/images/m7.jpg');
            SlideShow.addImgByUrl('style/images/m8.jpg');

            //翻页按钮
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

            //切换domino开关
            switch_domino.addEventListener('click',
                function(e){
                    if(switch_domino.checked){
                        SlideShow.setDonimo(default_domino);
                    }
                    else{
                        SlideShow.setDonimo(false);
                    }
                }
            );

            //播放幻灯片，自动播放控制
            function playslide(){
                if(switch_autoplay.checked){
                    SlideShow.next();
                    setTimeout(playslide,autoplay_interval);
                }
            };
            switch_autoplay.addEventListener('click',
                function(e){
                    playslide();
                }
            );

            setTimeout(playslide,autoplay_interval);






        }
        function SetCardNumber (newValue) {
            initSlideShow(newValue);
        }

        function initSlideShow (num) {

            var cardnum = num;
            var default_domino = 900/cardnum/cardnum;
            SlideShow.init('slide_contrainer',{imgW:640,imgH:400,
                num:cardnum});      
            SlideShow.setDonimo(default_domino);
      
        }
