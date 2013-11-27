
/**
 * JX.Animate Demo库
 * 幻灯片轮播图片
 * @module JXAnimate.Demo
 * @subModule SlideShow
 * @requires JXAnimate.Animate
 * @description
 * 幻灯片轮播图片
 *
 * @author minren 
 * 
 */

/*
 * @幻灯片轮播图片
 *
 */

Jx().$package("SlideShow", function(J){

    var $D = J.dom,
        $E = J.event,
        $Anim = JXAnimate,
        _container,
        _params,
        _stage,
        _stageWidth,
        _stageHeight,
        _imgList,
        _imgCount,
        _cardRow,
        _cardCol,
        _cards,
        _cardNumber,
        _cardGroupIndex,
        _currImage,
        _nextImage,
        _prevImage,
        _playParam,
        _animSettings,
        _orderMethods,
        _slideEffects,
        _currentEffect,
        _supportCanvas,
        _stageCanvas,
        _stageContext,
        _isPictureMoving,
        _MovingPause=false,
        _zoomMove;

    var addSlideShowCSS=function(){

    };
    //动画需要用Canvas显示，如果不支持Canvas则用div显示静态图片
    function canvasSupport (){
        return !!document.createElement('canvas').getContext;
    }


    var reset = function  () {
        _supportCanvas=canvasSupport();
        //初始化参数，img(800x600)，卡片维度 5x5
        _params = {
            imgW:800,
            imgH:600,
            num:5
            //cardW:40,
            //cardH:40
        };    
        _playParam={
            "duration" :'600ms'
        };
        _animSettings={
            additionalClass:'visible',
            domino:100
        };
        _slideEffects = [
            {
                order:'random',
                css:'hinge'
            },
            {
                order:'random',
                effect:'flyOutToCenter'
            },
            {
                order:'row_col',
                effect:'flyOutToOutside'
            },
            {
                order:'row_col',
                css:'flipOutY'
            },
            {
                order:'col_row',
                css:'flipOutX'
            },
            {
                order:'random',
                css:'flipOutY'
            },
            {
                order:'random',
                css:'rotateOut'
            },
            {
                order:'random',
                css:'flipOutX'
            } 
        ];
        _currentEffect=0;
        _zoomMove={
            'name':'zoom',
            'speed':2,
            'originX':0.5,
            'originY':0.5,
            'x':0,
            'y':0,
            'w':0,
            'h':0,
        }
        _zoomMove.draw=function(context,img)
        {
            var startX=0,
                startY=0,
                originX=_zoomMove.originX,
                originY=_zoomMove.originY,
                speed = _zoomMove.speed;

            _zoomMove.w+=speed;
            _zoomMove.h+=speed;
            _zoomMove.x= startX - (_zoomMove.w - img.width)*originX;
            _zoomMove.y= startY - (_zoomMove.h - img.height)*originY;

            context.drawImage(img,_zoomMove.x,_zoomMove.y,_zoomMove.w,_zoomMove.h);
        }
    }

    /**
     * 幻灯片播放类
     * @class SlideShow
     * @constructor
     * @param  {string} container 包含img元素的容器的id
     * @param  {object} params    幻灯片参数，imgW,imgH,图片的大小，num卡片的数量。
     * @return {[type]}           [description]
     */
    var init = function(container, params){

        reset();
        _container = document.getElementById(container);
        if(!_container){
            return;
        }
        _params = J.extend(_params,params);

        _container.style.width=_params.imgW+'px';

        initOrderMethods();
        //遍历container中的img,放入数组，设置样式
        initImg();
        _imgCount = _imgList.length;
        if(_imgCount==0){
            return;
        }

        //生成卡片
        generateCards();

        _animSettings.domino = 200;// Math.floor(2000/_cardNumber);
        _cardGroupIndex=[];
        //根据列数指定分组
        for (var i = 0; i < _cardRow; i++) {
            _cardGroupIndex.push((i+1)*_cardCol - 1);
        };

        //根据给定的数字进行分组。
        var capacity = 2,tmp = 0;
        for (var i = 0; i < _cardNumber; i++) {
            tmp++;
            if(tmp==capacity || i == _cardNumber-1){
                _cardGroupIndex.push(i);
                tmp=0;
            }
        };      


        //创建舞台stage元素div
        generateStage();
        //设置背景
        setCurrentIndex(0);
        var src = _imgList[_currImage].src;
        setCardBackground(src);
        setStageBackground(_imgList[_currImage]);

        startPictureMoveing();
        gameLoop();
    };

    var initImg=function (argument) {
        _imgList=[];
        var children = _container.children,
            node;
        for (var i=0; i < children.length; i ++) {
            node = children[i];
            if(node.tagName.toLowerCase()==='img'){
                _imgList.push(node);
                //$D.setClass(node,'slide_Img');
                node.style['display']='none';
            }
        };
    }
    
    var addImgByUrl=function(src){
        var img;
        img = document.createElement('img');
        img.setAttribute('isLoading');
        img.onload=function(args){
            img.removeAttribute('isLoading');
            _imgList.push(img);
            _imgCount = _imgList.length;
            setCurrentIndex(_currImage);
        };
        $D.setClass(img,'slide_Img');
        _container.appendChild(img);
        img.src=src;
    }

    var calculateNumber = function(){
        var w,h;

        if(_params.num||_params.numX||_params.numY){
            _cardCol = _params.num||_params.numX;
            _cardRow = _params.num||_params.numY;
            _params.cardW = Math.ceil(_params.imgW/_cardCol);
            _params.cardH = Math.ceil(_params.imgH/_cardRow);
            return;
        }
        else //if(_params.cardW || _params.cardH)
        {
            w = _params.cardW;
            h = _params.cardH;
            _cardCol = Math.ceil(_params.imgW/w);
            _cardRow = Math.ceil(_params.imgH/h);
            return;
        }


    }
    var generateCards =function() {
        var card,
        x,y,w,h,pos,
        style;
        calculateNumber();
        w = _params.cardW;
        h = _params.cardH;

        _cards = [];
        for (var r = 0; r < _cardRow; r++) {
            _cards[r]=[];
            for(var c = 0; c < _cardCol; c++){
                card =document.createElement('div');
                card.id = 'r'+r+'c'+c;
                $D.setClass(card,'card_piece');
                _cards[r][c]= card;
                //set size
                $D.setStyle(card,'width',w+'px');
                $D.setStyle(card,'height',h+'px');
                //set position;
                x = c*_params.cardW;
                y = r*_params.cardH;
                $D.setStyle(card,'top',y+'px');
                $D.setStyle(card,'left',x+'px');  
                //background position
                pos = '-'+x+'px -'+y+'px'
                card.style.backgroundPosition = pos; //兼容FireFox
                                       
            }
        }
        _cardNumber = _cardRow * _cardCol;
    };

    var generateStage=function  (argument) {
        var w,h;
        w = _cardCol * _params.cardW;
        h = _cardRow * _params.cardH;


        _stage = document.getElementById('stage');

        if(_stage && _stage.parentNode===_container){
            _stage.innerHTML = '';
        }
        else{
            _stage = document.createElement('div');
        }

        _stage.id = 'stage';
        
        $D.setStyle(_stage,'width',w+'px');
        $D.setStyle(_stage,'height',h+'px');

        if (_supportCanvas) {
            _stageCanvas = document.createElement('canvas');
            _stageContext=_stageCanvas.getContext('2d');
            _stageCanvas.width=w;
            _stageCanvas.height=h;
            _stage.appendChild(_stageCanvas);
        }

        for (var r = 0; r < _cardRow; r++) {
            for(var c=0; c < _cardCol; c++){
                _stage.appendChild(_cards[r][c]);
            }
        }

        _container.appendChild(_stage);
        _stageWidth = $D.getWidth(_stage);
        _stageHeight = $D.getHeight(_stage);


    }

    var setCardBackground=function (src) {
        var card,
        x,
        y,
        style;
        for (var r = 0; r < _cardRow; r++) {
            for(var c=0; c < _cardCol; c++){
                card = _cards[r][c];
                setBackground(card,src);
            }
        }
    };

    var setStageBackground=function (img) {
        if (_supportCanvas) {
            _stageContext.drawImage(img,0,0,_stageWidth,_stageHeight);
            if (_isPictureMoving) {
                //开始播放动画

            }
        }
        else{
            setBackground(_stage,img.src);
        }
    }
    var setBackground = function(elem,src){
        var url = 'url('+src+')';
        //console.log(url);
        elem.style.backgroundImage = url;
    }

    var setCurrentIndex = function(index){
        index = index<0?0:index;
        _currImage=index % _imgCount;
        _nextImage=(index+1) % _imgCount;
        _prevImage=(index+_imgCount-1) % _imgCount;

    }

    /**
     * 定义一系列获得卡片顺序的函数
     * @param  {[type]} argument [description]
     * @return {[type]}          [description]
     */
    var initOrderMethods = function (argument) {
        _orderMethods={
            'row_col': function (params) {
                var elems = [];
                for (var r = 0; r < _cardRow;r++) {
                    for(var c= 0; c < _cardCol;c++){
                        elems.push(_cards[r][c]);
                    }
                }

                playAnimate(elems,params);

            },
            'row_col_rev': function (params) {
                var elems = [];
                for (var r = _cardRow-1; r >=0; r--) {
                    for(var c=_cardCol-1; c >=0 ; c--){
                        elems.push(_cards[r][c]);
                    }
                }

                playAnimate(elems,params);
            },

            'col_row': function (params) {
                var elems = [];
                for (var c = 0; c < _cardRow;c++) {
                    for(var r= 0; r < _cardCol;r++){
                        elems.push(_cards[r][c]);
                    }
                }

                playAnimate(elems,params);

            },
            'col_row_rev': function (params) {
                var elems = [];
                for (var c = _cardRow-1; c >=0; c--) {
                    for(var r=_cardCol-1; r >=0 ; r--){
                        elems.push(_cards[r][c]);
                    }
                }

                playAnimate(elems,params);

            },
            'random': function (params) {
                var elems = [],
                    t = new Date().getTime(),
                    timecounter = [];
                    i=0;

                for (var c = _cardRow-1; c >=0; c--) {
                    for(var r=_cardCol-1; r >=0 ; r--){
                        elems.push({
                            card:_cards[r][c],
                            index:Math.random()
                        });
                    }
                }
                timecounter.push(new Date().getTime() - t);
                elems = elems.sort(
                    function(a,b){
                        return a.index - b.index;
                });
                timecounter.push(new Date().getTime() - t);

                for (var i = elems.length - 1; i >= 0; i--) {
                    elems[i] = elems[i].card;
                };
                timecounter.push(new Date().getTime() - t);
                /*
                 *此处可以覆盖全局的动画设定参数。
                 *
                params.animSetting = J.extend(params.animSetting,
                    {
                        domino:150
                    }
                );
                */
                playAnimate(elems,params);

                timecounter.push(new Date().getTime() - t);
                console.log(window.JSON.stringify(timecounter));
            }
        };

    }

    var playAnimate = function (elems,params) {
        var isGroup = false, //调试分组的开关。
            t = new Date().getTime(),
            timecounter = ['playAnimate'],
            animSetting,tempSetting;

        params = params || {};
        animSetting = params.animSetting ||{};
        tempSetting = J.clone(_animSettings);
        animSetting = J.extend(tempSetting,animSetting);

        animSetting.test = true;

        if(isGroup){
            //设置donimo元素分组
            animSetting.dominoGroupEventElements=[];
            var idx;
            for (var i in _cardGroupIndex) {
                idx = _cardGroupIndex[i];
                animSetting.dominoGroupEventElements.push(elems[idx].id);
            };
        }
        else{
            animSetting.dominoGroupEventElements=null;
        }
                timecounter.push(new Date().getTime() - t);

        if('css' in params){
            animSetting.name = params.css;
            JXAnimate.applyCss(elems,_playParam,animSetting);
        }
        else if('effect' in params){
            animSetting.name = '';
            var effectName = params.effect;
            JXAnimate[effectName].call(JXAnimate,elems,_playParam,animSetting);

        }
                timecounter.push(new Date().getTime() - t);
                console.log(window.JSON.stringify(timecounter));
    }
    var gotoWithEffect = function(index, effect){
        
        _MovingPause=true; //切换时暂停，还要用canvas图片设置卡片。

        var orderName;
        effect = effect || _slideEffects[_currentEffect];

        var src = _imgList[_currImage].src;
        //在动画开始前，设置卡片背景为当前图片，并可见。

        setCardBackground(src);
        //翻页，设置舞台
        setCurrentIndex(index);
        //src = _imgList[_currImage].src;
        setStageBackground(_imgList[_currImage]);

        orderName = effect.order;

        _orderMethods[orderName](effect);

        if(_isPictureMoving && _MovingPause){
            _zoomMove.w = _imgList[_currImage].width;
            _zoomMove.h = _imgList[_currImage].height;
            setTimeout(function(){
                _MovingPause=false;
            },1000);
        }

       
    }

    /**
     * 播放下一张幻灯片
     * @method next
     * @return {[type]}          [description]
     */
    var next = function  (argument) {
        
        _currentEffect = (_currentEffect+1)%_slideEffects.length;

//_currentEffect=1; //test
        var orderName, 
            effect = _slideEffects[_currentEffect];

        gotoWithEffect(_nextImage,effect);


    }

    /**
     * 播放前一张幻灯片
     * @return {[type]}          [description]
     */
    var prev =function (argument){
        _currentEffect = (_currentEffect+_slideEffects.length-1)%_slideEffects.length;

        var orderName, 
            effect = _slideEffects[_currentEffect];

        gotoWithEffect(_prevImage,effect);
    }

    /**
     * 获得幻灯片的容器对象
     * @method getContainer
     * @return {DOM} 容器对象
     */
    var getContainer=function(){
        return _container;
    }
    /**
     * 获得幻灯片的舞台对象
     * @method getStage
     * @return {DOM} 容器对象
     */
    var getStage=function(){
        return _stage;
    }
    /**
     * 获得幻灯片的舞台宽度
     * @method getStageWidth
     * @return {int} 舞台宽度
     */
    var getStageWidth = function(){
        return _stageWidth;
    }
    /**
     * 获得幻灯片的舞台高度
     * @method getStageHeight
     * @return {int} 舞台高度
     */
    var getStageHeight = function(){
        return _stageHeight;
    }
    /**
     * 设置幻灯片播放多米诺效果的延时
     * @method setDonimo
     * @param {int} value 多米诺效果的延时时间
     */
    var setDonimo = function(value){
        _animSettings.domino = value;
    }

    var startPictureMoveing = function(){
        _isPictureMoving=true;
        _MovingPause=false;
    }
    var gameLoop = function () {
        window.setTimeout(gameLoop, 20);
        drawScreen();
    }

    var drawScreen = function(){
        if (!_supportCanvas || !_isPictureMoving || _MovingPause) {
            return;
        };
        var movement=_zoomMove;

        movement.draw(_stageContext,_imgList[_currImage]);


    }




    this.init = init;
    this.next = next;
    this.prev = prev;
    this.getContainer = getContainer;
    this.getStage = getStage;
    this.getStageWidth = getStageWidth;
    this.getStageHeight = getStageHeight;
    this.setDonimo = setDonimo;
    this.addImgByUrl = addImgByUrl;
});
//----------------------------------------------------------------------------
        //在结束时设置卡片的背景。需改造etamina √
        //在animSettings中增加回调。√
        //调整console.log。√
        //
        //增加一些效果：
        //随机顺序 √
        //所有CSS的效果列表
        //向中间飞入，向四周飞出。√
        //闪烁问题的优化：
        //JxAnimation中定义了分组donimo的方法，
        //可以将邻近的动画元素合并到一个onAnimationEnd事件中处理，但是效果不好。
        //依旧有闪烁。调用方法参考playAnimation
        //
        //添加声音。 √
        //美化翻页按钮的样式。√


