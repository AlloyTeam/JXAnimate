/* ===========================================================================
 * etamina == animate
 *
 * @description
 * A CSS animation Engine and Library
 *
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @description JX.Animate主文件
 * @module JXAnimate
 */

Jx().$package("JXAnimate", function(J){

    var $Audio;

    var etamina = (function () {

        var core = {
                id: "etamina",
                name: "etamina",
                description: "A CSS animation Engine and Library",
                version: "1.0",

                prefix: "",
                prefixJS: "",

                elems: null,

                format: {},
                helper: {},
                effects: {},

                debug: true,

                originalCssClasses: {},
                //保存在element上应用的动画class名称，用于在动画后删除相关的css
                AnimatingClasses: {},
                keyframeRules:{},
                doNotDeleteKeyframes:{}, //不需要删除的动画名称，一般是静态CSS文件中的动画。
                //存放bool值，表示元素是否正在播放动画。
                animElementList: [],
                //保存每个元素在动画播放完毕之后的回调函数,以元素id为索引
                animCallbackList:[],
                //保存domino效果中每一个合并元素组。
                donimoElementGroups:{},

                /*
                 * Returns array of HTML elements by string, HTML elements or string array.
                 */
                getHTMLelements: function (params) {
                    var elems = [],
                        each = function (arr, func) {
                            Array.prototype.forEach.apply(arr, [func]);
                        },
                        push = function (v) {
                            elems.push(v);
                        },
                        lookup = function (query) {
                            if (typeof query != 'string') return [];
                            var result = document.getElementById(query);
                            return result ? [result] : document.querySelectorAll(query);
                        };

                    if (typeof params === "string") {
                        each(lookup(params), push);
                    }
                    else if (params.length === undefined) {
                        elems.push(params); // myElem1
                    }
                    else {
                        each(params, function(param) {
                            if (param.nodeType && param.nodeType !== 3) {
                                elems.push(param);
                            }
                            else {
                                each(lookup(param), push);
                            }
                        });
                    }
                    each(elems,function(elem){
                        if(!elem.id || elem.id == '' || elem.id === undefined){
                            elem.id = elem.type + '_' + (new Date()).getTime();
                        }
                    });

                    return elems;
                },
                /*
                 * Set browser css & JS prefix
                 */
                initPrefix: function () {
                    var el = document.createElement("div");

                    // Safari 4+, iOS Safari 3.2+, Chrome 2+, and Android 2.1+
                    if ("webkitAnimation" in el.style) {
                        this.prefix = "-webkit-";
                        this.prefixJS = "webkit";
                    }
                    // Firefox 5+
                    else if ("MozAnimation" in el.style) {
                        this.prefix = "-moz-";
                        this.prefixJS = "Moz";
                    }
                    // Internet Explorer 10+
                    else if ("msAnimation" in el.style) {
                        this.prefix = "-ms-";
                        this.prefixJS = "MS";
                    }
                    // Opera 12+
                    else if ("OAnimation" in el.style || "OTransform" in el.style) {
                        this.prefix = "-o-";
                        this.prefixJS = "O";
                    }
                    else {
                        this.prefix = "";
                        this.prefixJS = "";
                    }

                    if (this.debug) {
                        console.log("prefix=" + this.prefix, "prefixJS=" + this.prefixJS);
                    }

                    return;
                },

                /*
                 * Get the document height
                 */
                docHeight: function () {
                    var D = document;

                    return Math.max(
                        Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), 
                        Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), 
                        Math.max(D.body.clientHeight, D.documentElement.clientHeight)
                        );
                },


                /*
                 * Insert CSS keyframe rule
                 */
                insertCSS: function (rule) {
                    var sheets = document.styleSheets;

                    if (sheets && sheets.length) {
                        for (var i = sheets.length - 1; i >= 0; i--) {
                            try {
                                sheets[i].insertRule(rule, 0);
                                break;
                            }
                            catch (ex) {
                                console.warn(ex.message, rule);
                            }
                        };
                    }
                    else {
                        var style = document.createElement("style");
                        style.innerHTML = rule;
                        document.head.appendChild(style);
                    }

                    return;
                },

                /*
                 * Delete CSS keyframe rule
                 */
                deleteCSS: function (ruleName) {
                    //TODO:当HTML中没有Style节点时，会出现Bug。
                    var cssrules = (document.all) ? "rules" : "cssRules",
                        i,sheets = document.styleSheets;
                    if (sheets && sheets.length) {
                        sheets:for (var j = sheets.length - 1; j >= 0; j--) {
                            if(sheets[j][cssrules] &&
                                sheets[j][cssrules].length>0){
                                rules:for (i = 0; i < sheets[j][cssrules].length; i += 1) {
                                    var rule = sheets[j][cssrules][i];
                                    if (rule.name === ruleName || rule.selectorText === '.'+ruleName) {
                                        sheets[j].deleteRule(i);
                                        if (this.debug) {
                                            console.log("Deleted keyframe: " + ruleName);
                                        }
                                        break sheets;
                                        break rules;
                                    }                            
                                }
                            }
                        }
                    }

                    return;
                },

                /*
                 * 动画结束时的统一回调参数。
                 * Clear animation settings
                 */
                clearAnimation: function (elem,evt) {
                    if(this.debug){
                        //TODO: //evt.srcElement 属性在FF中不支持。
                        //console.info("_clearAnimation", elem, evt.srcElement.id, evt.animationName, evt.elapsedTime);
                    }
                    etamina.animElementList[elem.id] = false;

                    //恢复元素原有的class属性。
                    etamina.restoreCssClass(elem);
                    
                    //结束时删除 动画class。 动画class也要记录。
                    var classname = etamina.popAnimateClassName(elem.id);
                    //etamina.deleteCSS(classname);


                    // 删除关键帧的css。
                    if(evt.animationName in etamina.doNotDeleteKeyframes){

                    }
                    else{
                        //etamina.deleteCSS(evt.animationName);
                    }

                    var callbackObj = etamina.animCallbackList[elem.id];

                    if(callbackObj && callbackObj.hasCallback){
                        //向回调中传入动画元素和事件参数。
                        callbackObj.params = J.extend(
                            {
                                elem : elem,
                                event : evt
                            },
                            callbackObj.params);

                        callbackObj.method(callbackObj.params);
                    }

                    return;
                },
                onDonimoGroupAnimationEnd:function(evt) {
                    if(this.debug){
                        console.info("_onDonimoGroupAnimationEnd", this, evt.srcElement.id, evt.animationName, evt.elapsedTime);
                    }
                    var group = etamina.donimoElementGroups[this.id],
                        length;
                    if(J.isArray(group)){
                        length = group.length;
                        for (var i =0; i < length; i++) {
                            etamina.clearAnimation(group[i],evt);
                        };

                    }
                    delete etamina.donimoElementGroups[this.id];
                },
                onAnimationEnd:function(evt){
                    etamina.clearAnimation(this,evt);
                },

                /*
                 * initialize animation playing param
                 */
                initPlayParam: function(params,animType){

                    var animType = animType || 'Any',
                        params = params || {};

                    params.animType = params.animType||animType;                
                    params.delay = params.delay || '0ms';
                    params.duration = params.duration || '1s';
                    params.timing = params.timing || 'linear';
                    params.iteration = params.iteration || '1';
                    params.direction = params.direction || 'normal';
                    params.playstate = params.playstate || "running";

                    params.perspective = params.perspective || "1000px";
                    params.perspectiveOrigin = params.perspectiveOrigin || "50% 50%";
                    params.backfaceVisibility = params.backfaceVisibility || "visible";
                    return params;
                },


                /*
                 *生成用于在element上应用动画效果class css
                 *在此处应用多米诺效果
                 */
                getAnimationClassRule: function(params,animSetting){
                    var 
                    className = params.animType + '-' +(new Date()).getTime() + "-" + Math.floor(Math.random() * 1000),
                    css='',domino,dominoDelay=0,newDelay;

                    if(params.toDelete && params.toDelete.length>0){
                        for(var i=0,len = params.toDelete.length;i<len;i++)
                        {
                            var attr = params.toDelete[i];
                            delete params[attr];
                        }
                    }
                    
                    newDelay = etamina.format.fromTime(params.delay);

                    if(animSetting.domino){
                        domino = etamina.format.fromTime(animSetting.domino);
                        dominoDelay = domino * animSetting.index;
                        newDelay+= dominoDelay;
                    }

                    newDelay = etamina.format.toMilliSecond(newDelay);

                    css += '.'+className+'{'+'\n';

                    css += '\t'+etamina.prefix+'animation-name:'+params.name+';\n';
                    if ('delay' in params) {
                        css += '\t'+etamina.prefix+'animation-delay:'+newDelay+';\n';
                    }
                    if ('duration' in params) {
                        css += '\t'+etamina.prefix+'animation-duration:'+params.duration+';\n';
                    }
                    if ('timing') {
                        css += '\t'+etamina.prefix+'animation-timing-function:'+params.timing+';\n';
                    }
                    if ('iteration' in params) {
                        css += '\t'+etamina.prefix+'animation-iteration-count:'+params.iteration+';\n';
                    }
                    if ('direction' in params) {
                        css += '\t'+etamina.prefix+'animation-direction:'+params.direction+';\n';
                    }
                    if('perspective' in params){
                        css += '\t'+etamina.prefix+'perspective:'+params.perspective+';\n';
                    }
                    if('perspectiveOrigin' in params){
                        css += '\t'+etamina.prefix+'perspective-origin:'+params.perspectiveOrigin+';\n';
                    }
                    if('backfaceVisibility' in params){
                        css += '\t'+etamina.prefix+'backface-visibility:'+params.backfaceVisibility+';\n';
                    }

                    css += '}\n' ;

                    return {
                        name:className,
                        css:css
                    };
                 },

                saveCssClass : function(elem){
                    if(elem && elem.id && elem.id!=''){
                        this.originalCssClasses[elem.id] = elem.className;
                    }
                 },
                restoreCssClass : function(elem){
                    if(elem && elem.id && elem.id!=''){
                        elem.className = this.originalCssClasses[elem.id];
                        if(etamina.debug){
                            console.log('restore #'+elem.id+' to '+elem.className+'\n');
                        }
                    }
                 },
                 //保存在element上应用的动画class名称，用于在动画后删除相关的css
                pushAnimateClassName : function(id, className){
                    if(id && id!='' && className){
                        this.AnimatingClasses[id] = className;
                    }
                 },
                popAnimateClassName : function(id){
                    if(id && id!=''){
                        var name = this.AnimatingClasses[id];
                        delete this.AnimatingClasses[id];

                        return name;
                    }
                 },
                /**
                 * HTML5 CSS3关键帧动画引擎。每个动画效果都包装为一个方法，在方法中可以指定动画的播放时长、重复次数等选项。
                 * 也可以通过指定Ruler的名称，播放CSS文件中预定义的动画效果。
                 * @class JX.Animate
                 * @constructor
                 * @param {object} params 初始化参数{elems:HTML对象数组}
                 */
                init: function (params) {
                    console.info("Initializing " + this.name + " (" + this.description + ") " + this.version);

                    this.initPrefix();

                    if (params && params.elems) {
                        this.elems = this.elements(params.elems);
                        //console.log(this.elems);
                    }

                    return core.effects;
                },
                composeTransformPropery : function(params){
                    if(!params){
                        return;
                    }
                    var transform = '',val;

                    for(p in params){
                        switch(p){
                            case 'transform':
                                transform += params.transform;
                                break;
                            case 'perspective':
                                val = etamina.format.toPixel(params.perspective);
                                transform +='perspective(' + val + ')' + ' ';
                                break;
                            case 'translateX':
                                val = etamina.format.toPixel(params.translateX);
                                transform +='translateX(' + val + ')' + ' ';    
                                break;
                            case 'translateY':
                                val = etamina.format.toPixel(params.translateY);
                                transform +='translateY(' + val + ')' + ' ';
                                break;
                            case 'scaleX':
                                val = params.scaleX;
                                transform +='scaleX(' + val + ')' + ' ';
                                break;
                            case 'scaleY':
                                val = params.scaleY;
                                transform +='scaleY(' + val + ')' + ' ';
                                break;
                            case 'scale':
                                val = params.scale;
                                transform +='scale(' + val + ')' + ' ';
                                break;
                            case 'skewX':
                                val = etamina.format.toDegree(params.skewX);
                                transform +='skewX(' + val + ')' + ' ';
                                break;
                            case 'skewY':
                                val = etamina.format.toDegree(params.skewY);
                                transform +='skewY(' + val + ')' + ' ';
                                break;
                            case 'rotate':
                                val = etamina.format.toDegree(params.rotate);
                                transform +='rotate(' + val + ')' + ' ';
                                break;
                            case 'rotateX':
                                val = etamina.format.toDegree(params.rotateX);
                                transform +='rotateX(' + val + ')' + ' ';
                                break;
                            case 'rotateY':
                                val = etamina.format.toDegree(params.rotateY);
                                transform +='rotateY(' + val + ')' + ' ';
                                break;
                       }

                    }
                    if(transform.length>0){
                        return transform;
                    }
                    else{
                        return false;
                    };

                }
            };

        return core;
    }());


    var onDonimoGroupAnimationEnd =function(evt) {

    };




    etamina.format = {
        isNumber : function(o) {
            return (o === 0 || o) && o.constructor === Number;
        },
        isString : function(o) {
            return (o === "" || o) && (o.constructor === String);
        },
        trim : function(string){
            return String(string).replace(/^\s+|\s+$/g, '');
        },
        toPixel : function(param){
            var val = etamina.format.fromPixel(param);
            return val+'px';
        },
        fromPixel : function(param){
            var pxStr,
                parseNum = function (num) {
                    return num;
                },
                parseStr = function (str) {
                    var val;
                    if (str.indexOf("px") > -1) {
                        val = parseInt(str, 10); // "1000ms", "1500ms"
                    }
                    else {
                        val = parseInt(str, 10); // "1000"
                    }
                    return val;
                };


            switch (typeof param) {
            case "number":
                pxStr = parseNum(param);
                break;
            case "string":
                pxStr = parseStr(param);
                break;
            default:
                pxStr = parseStr(param);
            }
            return pxStr;
        },
        toDegree : function(param){
            var degStr = etamina.format.fromDegree(param);
            return degStr+'deg';
        },
        fromDegree : function(param){
            var degStr,
                parseNum = function (num) {
                    return num;
                },
                parseStr = function (str) {
                    var val;
                    if (str.indexOf("deg") > -1) {
                        val = parseInt(str, 10); // "1000ms", "1500ms"
                    }
                    else {
                        val = parseInt(str, 10); // "1000"
                    }
                    return val;
                };


            switch (typeof param) {
            case "number":
                degStr = parseNum(param);
                break;
            case "string":
                degStr = parseStr(param);
                break;
            default:
                degStr = parseStr(param);
            }
            return degStr;
        },

        fromTime : function(param){
        
            //console.info("duration", params, typeof params);
            var dur,
                parseNum = function (num) {
                    return num;
                },
                parseStr = function (str) {
                    var val;
                    if (str.indexOf("ms") > -1) {
                        val = parseInt(str, 10); // "1000ms", "1500ms"
                    }
                    else if (str.indexOf("s") > -1) {
                        val = parseFloat(str, 10) * 1000; // "1s", "1.5s"
                    }
                    else {
                        val = parseInt(str, 10); // "1000"
                    }
                    return val;
                },
                parseObj = function (obj) {
                    var val;
                    if (obj.value) {
                        if (typeof obj.value === "string") {
                            val = parseStr(obj.value);
                        }
                        else {
                            val = parseNum(obj.value); // {value: 2000}
                        }
                    }
                    return val;
                };

            switch (typeof param) {
            case "number":
                dur = parseNum(param);
                break;
            case "string":
                dur = parseStr(param);
                break;
            case "object":
                dur = parseObj(param);
                break;
            default:
                dur = param;
            }

            //console.log("duration:", "dur=" + dur);
            return dur;
        },
        toMilliSecond:function(param){
            var val = etamina.format.fromTime(param);
            return val+'ms';
        }
    };

    /**
     * 生成关键帧动画的CSS样式字符串。
     * @method buildframes
     * @param  {string} name   [关键帧动画的名称]
     * @param  {array} frames [关键帧数组]
     * @return {void}
     */
    etamina.effects.buildframes = function(name,frames)
    {
        if(!frames || frames.length<2){
            return;
        }
        var 
            transform,transformOrigin,fade,shadow,styleText,
            css;

        css = '@'+etamina.prefix+'keyframes '+  name +'{\n';

        for(var i=0, len = frames.length; i<len; i++)
        {
            var f = frames[i];
            transform = etamina.composeTransformPropery(f);
            transformOrigin = (f.transformOrigin) ? f.transformOrigin:false;
            opacity = f.opacity;
            shadow = f.shadow;
            styleText=f.styleText;

            css +=                      '\t' + f.p +'{\n';    
            css += (styleText)?         '\t\t' + f.styleText+';\n':'';
            css += (transform)?         '\t\t' + etamina.prefix + 'transform:' + transform + ';' + '\n' : '';
            css += (transformOrigin) ?  '\t\t' + etamina.prefix + 'transform-origin:' + transformOrigin + ';' + '\n' : '';
            css += ('opacity' in f) ?   '\t\t' + 'opacity: ' + opacity + ';' + '\n' : '';
            css += (shadow) ?           '\t\t' + etamina.prefix + 'box-shadow: ' + shadow + ';' + '\n' : '';
            css +=                      '\t' + '}' + '\n';
        }

        css += '}\n';

        return css;    
    };

    /**
     * 返回唯一的关键帧的名称
     * @method buildUniqueKeyframeName
     * @param  {string} animType 动画类型的名称
     * @return {void}          唯一的关键帧名称
     */
    etamina.effects.buildUniqueKeyframeName = function(animType){

        return 'etamina-'+animType+'-'+(new Date()).getTime() + "-" + Math.floor(Math.random() * 1000);
    };



    /**
     * 开始播放元素对应的CSS动画
     * @method go
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @param  {function} getKeyframe 获取动画的具体keyframe的名称和代码的函数
     * @return {void}             
     */
    etamina.effects.go = function(elems,playParam,animSetting,getKeyframe){

    //还需实现保持动画后状态的方法。

    //优化点、针对多个元素应用动画时keyframe的css可能相同。

    //2013/09/13 发现一个问题，这个方法执行的时间越来越长
    /*
        优化思路：
            1. 插入css时，现有的css越多，插入时间越长。
            创建一个style节点，每次修改innerHTML属性，并在动画结束后清空改节点。

            2. 每个go方法，对应一个style节点。
             管理一个go方法的生命周期。

            3. 创建一个style pool，循环利用。或者go pool。

            4. GoLifecycle = {
                styleNode,
                name,
                elems:{
                    originalCssClass,
                    anmiationCssClass, 
                    keyframeRule,
                    doNotDeleteKeyframe, //不需要删除的动画名称，一般是静态CSS文件中的动画。
                    isAnimating,
                    animationEndCallback,//保存每个元素在动画播放完毕之后的回调函数                   
                }
                animatingCounter,//等于0时，释放style
            }

    */

    var     t = new Date().getTime(),
            timecounter = ['etamina.effects.go'],
            t1,t2,
            timecounter1,loopSum;



        playParam = etamina.initPlayParam(playParam,animSetting.animType);
        if(playParam.iteration<1){
            return;
        }

        var animSetting = animSetting||{},
            /*
             * domino效果中事件太多，浏览器响应不过来，
             * 可以将邻近的domino元素的动画结束事件合并到一个元素中。
             * 此变量中保存用于处理合并事件的元素id。
             * @type {[type]}
             */
            groupEventElems = animSetting.dominoGroupEventElements,
            tempEventElemGroup=[];

        var //循环变量
            elem,elemClass,keyframe, animClassName,       
            elements = etamina.getHTMLelements(elems);


        timecounter.push(new Date().getTime()-t);
        // Loop through elements
        if (elements && elements.length > 0) {
            for (i = 0; i < elements.length; i += 1) {

                t1 = new Date().getTime()
                timecounter1 = [];

                elem = elements[i];
                animSetting.index = i;

                //设置动画的回调
                etamina.animCallbackList[elem.id] = 
                    J.isFunction(animSetting.callback)?
                        {
                            hasCallback:true,
                            method:animSetting.callback,
                            params:animSetting.callbackParam
                        }
                        :false;


                //检查并设置元素的动画状态
                if(etamina.animElementList[elem.id]){
                    //忽略正在动画中的的元素。
                    continue;
                }
                etamina.animElementList[elem.id] = true;

                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;


                //获取动画的具体keyframe的名称和代码。
                keyframe = getKeyframe.call(this,elem,animSetting); 

                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;
                
                if(animSetting.doNotDeleteKeyframe){
                    etamina.doNotDeleteKeyframes[keyframe.name] = true;
                }

                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;

                //add css text into DOM style
                if(keyframe.css && keyframe.css!=''){
                    if(etamina.debug){
                        console.log(keyframe.css);
                    }
                    //TODO:这个方法中会随着运行次数增加，耗时也增加。
                    etamina.insertCSS(keyframe.css);
                }

                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;

                //prepare class for element to play the animation.
                //多米诺domino效果在此处应用。
                playParam.name = keyframe.name;
                elemClass = etamina.getAnimationClassRule(playParam,animSetting);
                //add css text into DOM style
                if(etamina.debug){
                    console.log(elemClass.css);
                }
                if(elemClass.css && elemClass.css!=''){
                    etamina.insertCSS(elemClass.css);
                }

                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;

                // Add listener to clear animation after it's done
                //如果针对了domino效果设置了事件优化
                if(animSetting.domino &&
                    J.isArray(groupEventElems)){

                    tempEventElemGroup.push(elem);

                    if(groupEventElems.indexOf(elem.id)>-1){

                        etamina.donimoElementGroups[elem.id] = tempEventElemGroup;
                        tempEventElemGroup=[];

                        //设置合并组的动画结束的回调事件。
                        if (etamina.prefix == "-moz-") {
                            elem.addEventListener("animationend", etamina.onDonimoGroupAnimationEnd, false);
                        }
                        else {
                            elem.addEventListener(etamina.prefixJS + "AnimationEnd", etamina.onDonimoGroupAnimationEnd, false);
                        }

                    }
                    else{
                    }
                }
                else{
                    etamina.donimoElementGroups[elem.id] = null;
                    //设置动画结束的回调事件。
                    if (etamina.prefix == "-moz-") {
                        elem.addEventListener("animationend", etamina.onAnimationEnd, false);
                    }
                    else {
                        elem.addEventListener(etamina.prefixJS + "AnimationEnd", etamina.onAnimationEnd, false);
                    }

                }
                //TODO: 是否在动画后保留结束时的状态。
                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;

                //保存elem原有的class，用于在动画后恢复。
                etamina.saveCssClass(elem);
                etamina.pushAnimateClassName(elem.id,elemClass.name)



                //apply css animation
                
                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;

                if(J.isString(animSetting.additionalClass)){
                    animClassName = elemClass.name + ' ' + animSetting.additionalClass;                   
                }
                else{
                    animClassName = elemClass.name
                }
                //J.dom.addClass(elem,animClassName);
                elem.className += ' ' + animClassName;
                log(elem.className);

                //播放声音
                if(animSetting.sound && JXAnimate.Audio){

                    var delayTime = etamina.format.fromTime(playParam.delay);

                    if(delayTime>0){
                        setTimeout(function(){
                            JXAnimate.Audio.playSound(animSetting.sound,animSetting.volume);
                        },delayTime);
                    }
                    else{
                        JXAnimate.Audio.playSound(animSetting.sound,animSetting.volume);
                    }
                }
                t2=new Date().getTime();
                timecounter1.push(t2-t1);
                t1=t2;


                if(loopSum){
                    for(var p = timecounter1.length-1;p>-0;p--){
                        loopSum[p]+=timecounter1[p];
                    }
                }
                else{
                    loopSum=[];
                    var len = timecounter1.length;

                    for (var p = 0;p<len;p++) {
                        loopSum.push(timecounter1[p]);
                    };
                }




            }  
                timecounter.push(loopSum);
        }
                console.log(window.JSON.stringify(timecounter));
    };

    /**
     * 根据自定义的关键帧生成动画，并播放。
     * @method goWithFixFrames
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @param  {array} frames      关键帧数组
     * @return {void}             
     */
    etamina.effects.goWithFixFrames = function(elems,playParam,animSetting,frames){

        var buildKeyframe = function(elem,animSetting){
                var index = animSetting.index;
                var keyframeName = etamina.effects.buildUniqueKeyframeName(animSetting.animType);
                return {
                    name:keyframeName,
                    css: etamina.effects.buildframes(keyframeName,frames)
                };
            };
        
        etamina.effects.go(elems,playParam,animSetting,buildKeyframe);
    };

    /**
     * 播放CSS文件中预定义的关键帧动画
     * @method applyCss
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    etamina.effects.applyCss = function(elems,playParam,animSetting){
        var animSetting = animSetting||{};
        var keyframeName;
        //字符串，表示关键帧的名字
        if(animSetting.constructor === String && animSetting.length>0){
            keyframeName = animSetting;
            animSetting = {};
            animSetting.name = keyframeName;
        }
        //对象格式，读取name属性
        else if('name' in animSetting && animSetting.name.length>0){
            keyframeName = animSetting.name;
        }
        else{
            return;
        }

        animSetting.animType = 'applyCss';
        animSetting.doNotDeleteKeyframe = true;

        var buildKeyframe = function(){
            return {name:keyframeName};
        };

        etamina.effects.go(elems,playParam,animSetting,buildKeyframe);
    }

    /**
     * 闪烁效果，内置Demo动画，代码演示了通过CSS样式字符串的形式定义动画。
     * @method flash
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    etamina.effects.flash = function(elems,playParam,animSetting){

        var animSetting = animSetting||{};

        animSetting.animType = 'flash';

        var buildKeyframe = function(){
            var keyframeName = etamina.effects.buildUniqueKeyframeName(animSetting.animType);
       
                keyframeCss = '@'+etamina.prefix+'keyframes '+  keyframeName +'{\n'+
                '0%, 50%, 100% {opacity: 1;} \n' +
                '25%, 75% {opacity: 0;}\n' +
            '}';

            return {
                name:keyframeName,
                css:keyframeCss
            };
        };

        etamina.effects.go(elems,playParam,animSetting,buildKeyframe);

    };

    /**
     * 水平3D翻转，内置Demo动画，代码演示了通过Frame数组形式定义动画。
     * @method flipInY
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    etamina.effects.flipInY = function(elems,playParam,animSetting){
        var animSetting = animSetting || {}
            playParam = playParam||{};
        animSetting.animType = 'flipInY';
        playParam.toDelete = ['perspective'];

        var    frames = [
                {p:'0%',rotateY:'90deg',perspective:400,opacity:'0'},
                {p:'40%',rotateY:'-10',perspective:400},
                {p:'70%',rotateY:'10',perspective:400},
                {p:'100%',rotateY:0,perspective:400,opacity:'1'}
            ];

        etamina.effects.goWithFixFrames(elems,playParam,animSetting,frames);


    };
    /**
     * 竖直3D翻转，内置Demo动画，代码演示了通过Frame数组形式定义动画。
     * @method flipInX
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    etamina.effects.flipInX = function(elems,playParam,animSetting){
        var animSetting = animSetting || {};
        animSetting.animType = 'flipInX';

        var    frames = [
                {p:'0%',rotateX:'90deg',perspective:400,opacity:'0'},
                {p:'40%',rotateX:'-10',perspective:400},
                {p:'70%',rotateX:'10',perspective:400},
                {p:'100%',rotateX:0,perspective:400,opacity:'1'}
            ];

        etamina.effects.goWithFixFrames(elems,playParam,animSetting,frames);
    };


    /**
     * 添加自定义动画效果
     * @method addEffects
     * @param  {array} effectArray 动画效果函数数组，请参考flash,flipInX，flipInY函数编写自定义动画。
     * @return {void}             
     */
    this.addEffects = function  (effectArray) {
        
        if(J.isObject(effectArray)){
            var p,
            effect;
            for (p in effectArray){
                effect = effectArray[p];
                if(J.isFunction(effect)){
                    this[p] = effect;
                }
            };
        }
        else{
            return;
        }

    };


    var innerAnim = etamina.init(),
        _debug=false;

    var debugOn=function () {
        _debug = true;
        etamina.debug = true;
    }
    var debugOff=function () {
        _debug = false;
        etamina.debug = false;
    }
    var log = function (argument) {
        if(_debug == false){
            return;
        }
        console.log(argument);
    }
    debugOff();

    J.extend(this,innerAnim);
    /**
     * 浏览器的CSS3 样式的前缀
     * @property {string} prefix 
     */
    this.prefix = etamina.prefix;
    /**
     * 浏览器的CSS3 JS方法的前缀
     * @property {string} prefixJS 
     */
    this.prefixJS = etamina.prefixJS;
    this.debugOn = debugOn;
    this.debugOff = debugOff;


/*
    this.initAudio = function (params) {
        $Audio = JXAnimate.Audio;
        $Audio.init(params);
        this.preloadAudio = $Audio.preload;
    }
*/
});
//----------------------------------------------------------------------------

    /**
     * 动画设置参数
    animSetting{
        domino: 100 , // 设置domino中间的间隔时间。 数字或字符串。100或‘100ms’
        animType: 'rotateOut', //动画类型，内部用。
        index: 1,               //序列号，内部用。
        dominoGroupEventElements: [], //保存用于处理合并事件的元素id
        callback: method,       //每个元素动画结束后的回调。
        callbackParam: object,  //回调的参数。
        doNotDeleteKeyframe: true,  //标识动画结束后是否删除关键帧CSS。
        additionalClass: 'className', //设置动画时可以同时附加其他的css类。
        sound:'soundName',              //播放声音的名称。
        volume: '',                     //声音音量。
    }
     * @class animSetting
     */
    /**
     * 设置domino中间的间隔时间。 数字或字符串。100或‘100ms’
     * @property {int} domino 
     */
    /**
     * 动画类型
     * @property {string} animType 
     * @private
     */
    /**
     * 序列号，用于设置domino顺序
     * @property {int} index 
     * @private
     */
    /**
     * 保存用于处理合并事件的元素id
     * @property {array} dominoGroupEventElement 
     */
    /**
     * 每个元素动画结束后的回调。
     * @property {function} callback 
     */
    /**
     * 回调参数
     * @property {object} callbackParam 
     */
    /**
     * 标识动画结束后保留关键帧CSS
     * @property {bool} doNotDeleteKeyframe
     */
    /**
     * 设置动画时可以同时附加其他的css类，动画结束后删除
     * @property {string} additionalClass 
     */
    /**
     * 播放声音的名称。
     * @property {string} sound 
     */
    /**
     * 声音音量。
     * @property {float} volume 
     */
    /**
     * CSS文件中关键帧动画的名称，尽在applyCSS方法中有效。
     * @property {string} name 
     */











