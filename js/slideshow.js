
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
        _currentEffect;

    var reset = function  () {
        //初始化参数，img(800x600)，卡片大小（10，10）
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
            //callback:cardCallback,
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
                css:'rotateOut'
            },
            {
                order:'random',
                css:'flipOutX'
            } 
        ];
        _currentEffect=0;
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
        setStageBackground(src);
    };

    var initImg=function (argument) {
        _imgList=[];
        var children = _container.children,
        node;
        for (var i=0; i < children.length; i ++) {
            node = children[i];
            if(node.tagName.toLowerCase()==='img'){
                _imgList.push(node);
            }
            $D.setClass(node,'slide_Img');
        };
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
                //$D.setStyle(card,'background-position-y','-'+y+'px');
                //$D.setStyle(card,'background-position-x','-'+x+'px');
                //$D.setStyle(card,'background-position',pos);
                card.style.backgroundPosition = pos; //兼容FireFox
                                       
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
                //background position;
                //x = c*_params.cardW;
                //y = r*_params.cardH;
                setBackground(card,src);
                //$D.setStyle(card,'background-image','url("'+src+'")')
                //$D.removeClass(card,'hidden');
                
                //$D.setStyle(card,'top','-'+y+'px');
                //$D.setStyle(card,'left','-'+x+'px');          
            }
        }
    };

    var setStageBackground=function (src) {
        setBackground(_stage,src);
    }
    var setBackground = function(elem,src){
        var url = 'url('+src+')';
        console.log(url);
        //$D.setStyle(_stage,'background-image',url);
        //elem.style['background-image'] = url;
        elem.style.backgroundImage = url;
    }

    var cardCallback = function (argument) {
        var card = argument.elem;
        var src = _imgList[_currImage].src;
        $D.addClass (card,'hidden');
        //$D.setStyle(card,'background-image','url('+src+')')

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
                    i=0;
                for (var c = _cardRow-1; c >=0; c--) {
                    for(var r=_cardCol-1; r >=0 ; r--){
                        elems.push({
                            card:_cards[r][c],
                            index:Math.random()
                        });
                    }
                }

                elems = elems.sort(
                    function(a,b){
                        return a.index - b.index;
                });
                for (var i = elems.length - 1; i >= 0; i--) {
                    elems[i] = elems[i].card;
                };

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

            }
        };

    }

    var playAnimate = function (elems,params) {
        var isGroup = false, //调试分组的开关。
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


        if('css' in params){
            animSetting.name = params.css;
            JXAnimate.applyCss(elems,_playParam,animSetting);
        }
        else if('effect' in params){
            animSetting.name = '';
            var effectName = params.effect;
            JXAnimate[effectName].call(JXAnimate,elems,_playParam,animSetting);

        }
    }
    var gotoWithEffect = function(index, effect){

        var orderName;
        effect = effect || _slideEffects[_currentEffect];

        var src = _imgList[_currImage].src;
        //在动画开始前，设置卡片背景为当前图片，并可见。
        setCardBackground(src);
        //翻页，设置舞台
        setCurrentIndex(index);
        src = _imgList[_currImage].src;
        setStageBackground(src);

        orderName = effect.order;

        _orderMethods[orderName](effect);
       
    }

    var next = function  (argument) {
        
        _currentEffect = (_currentEffect+1)%_slideEffects.length;

//_currentEffect=0; //test
        var orderName, 
            effect = _slideEffects[_currentEffect];

        gotoWithEffect(_nextImage,effect);


    }

    var prev =function (argument){
        _currentEffect = (_currentEffect+_slideEffects.length-1)%_slideEffects.length;

        var orderName, 
            effect = _slideEffects[_currentEffect];

        gotoWithEffect(_prevImage,effect);
    }

    var getContrainer=function(){
        return _container;
    }
    var getStage=function(){
        return _stage;
    }
    var getStageWidth = function(){
        return _stageWidth;
    }
    var getStageHeight = function(){
        return _stageHeight;
    }
    var setDonimo = function(value){
        _animSettings.domino = value;
    }

    this.init = init;
    this.next = next;
    this.prev = prev;
    this.getContrainer = getContrainer;
    this.getStage = getStage;
    this.getStageWidth = getStageWidth;
    this.getStageHeight = getStageHeight;
    this.setDonimo = setDonimo;
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
        //美化翻页按钮的样式。
