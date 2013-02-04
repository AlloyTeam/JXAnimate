
/* ===========================================================================
 * 幻灯片轮播图片
 *
 * @description
 * A CSS animation Engine and Library
 *
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @幻灯片轮播图片
 *
 */

Jx().$package("SlideShow", function(J){

    var $D = J.dom,
        $Anim = JXAnimate,
        _container,
        _params,
        _stage,
        _imgList,
        _imgCount,
        _cardRow,
        _cardCol,
        _cards,
        _cardNumber,
        _currImage,
        _nextImage,
        _prevImage,
        _playParam,
        _animSettings,
        _orderMethods;

    var reset = function  () {
        //初始化参数，img(800x600)，卡片大小（10，10）
        _params = {
            imgW:800,
            imgH:600,
            cardW:40,
            cardH:40
        };    
        _playParam={
            "duration" :'1s'
        };
        _animSettings={

        };
    }


    var init = function(container, params){
        reset();
        _container = document.getElementById(container);
        if(!_container){
            return;
        }
        _params = J.extend(_params,params);
        initOrderMethods();
        //遍历container中的img,放入数组，设置样式
        initImg();
        _imgCount = _imgList.length;
        if(_imgCount==0){
            return;
        }
        //生成卡片
        generateCards();
        //创建舞台stage元素div
        generateStage();
        //设置背景
        setCurrentIndex(0);
        var src = _imgList[_currImage].src;
        setCardBackground(src);
        setStageBackground(src);
    };

    var initImg=function (argument) {
        _imgList=[];
        var children = _container.children,
        node;
        for (var i = children.length - 1; i >= 0; i--) {
            node = children[i];
            if(node.tagName.toLowerCase()==='img'){
                _imgList.push(node);
            }
            $D.setClass(node,'slide_Img');
        };
    }

    var generateCards =function() {
        var card,
        x,y,w,h,
        style;
        w = _params.cardW;
        h = _params.cardH;
        _cardCol = Math.ceil(_params.imgW/w);
        _cardRow = Math.ceil(_params.imgH/h);
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
                $D.setStyle(card,'background-position-y','-'+y+'px');
                $D.setStyle(card,'background-position-x','-'+x+'px');                         
            }
        }
        _cardNumber = _cardRow * _cardCol;
    };

    var generateStage=function  (argument) {
        var w,h;
        w = _cardCol * _params.cardW;
        h = _cardRow * _params.cardH;

        _stage = document.createElement('div');
        _stage.id = 'stage';

        $D.setStyle(_stage,'width',w+'px');
        $D.setStyle(_stage,'height',h+'px');

        for (var r = 0; r < _cardRow; r++) {
            for(var c=0; c < _cardCol; c++){
                _stage.appendChild(_cards[r][c]);
            }
        }

        _container.appendChild(_stage);
    }

    var setCardBackground=function (src) {
        var card,
        x,
        y,
        style;
        for (var r = 0; r < _cardRow; r++) {
            for(var c=0; c < _cardCol; c++){
                card = _cards[r][c];
                //background position;
                //x = c*_params.cardW;
                //y = r*_params.cardH;
                $D.setStyle(card,'background-image','url('+src+')')
                //$D.setStyle(card,'top','-'+y+'px');
                //$D.setStyle(card,'left','-'+x+'px');          
            }
        }
    };
    var setStageBackground=function (src) {
        $D.setStyle(_stage,'background-image','url('+src+')')
    }
    var setCurrentIndex = function(index){
        _currImage=index;
        _nextImage=(index+1) % _imgCount;;
        _prevImage=(index+_imgCount-1) % _imgCount;;
    }

    var initOrderMethods = function (argument) {
        _orderMethods={
            'row_col': function (params) {
                var elems = [];
                for (var r = _cardRow-1; r >=0; r--) {
                    for(var c=_cardCol-1; c >=0 ; c--){
                        elems.push(_cards[r][c]);
                    }
                }

                playAnimate(elems,params);

            }
        };

    }

    var playAnimate = function (elems,params) {
        if('css' in params){
            _animSettings.name = params.css;
            JXAnimate.applyCss(elems,_playParam,_animSettings);
        }
        else if('effect' in params){
            _animSettings.name = '';
            JXAnimate[effectName].call(JXAnimate,elems,_playParam,_animSettings);

        }
    }

    var next = function  (argument) {
        var orderName;

        setCurrentIndex(_nextImage);
        var src = _imgList[_currImage].src;
        //setCardBackground(src);
        setStageBackground(src);

        orderName = 'row_col'; //for test
        
        _orderMethods[orderName]({css:'flipOutY'});

        //在结束时设置卡片的背景。需改造etamina
        //在animSettings中增加回调。
        //调整console.log。
        //
        //增加一些效果。
        //
    }

    var prev =function (argument){

    }

    this.init = init;
    this.next = next;
});
//----------------------------------------------------------------------------

