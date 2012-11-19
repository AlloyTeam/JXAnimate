
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
 * @description
 *
 */
var etamina = (function () {

    var core = {
            id: "etamina",
            name: "etamina",
            description: "A CSS animation Engine and Library",
            version: "0.1",

            prefix: "",
            prefixJS: "",

            elems: null,

            format: {},
            helper: {},
            effects: {},

            debug: true,

            originalCssClasses: {},
            AnimatingClasses: {},
            keyframeRules:{},
            doNotDeleteKeyframes:{}, //不需要删除的动画名称，一般是静态CSS文件中的动画。
            animElementList: [],

            /**
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
            /**
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
                else if ("MSAnimation" in el.style) {
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

            /**
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


            /**
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

            /**
             * Delete CSS keyframe rule
             */
            deleteCSS: function (ruleName) {
                var cssrules = (document.all) ? "rules" : "cssRules",
                    i,sheets = document.styleSheets;
                if (sheets && sheets.length) {
                    sheets:for (var j = sheets.length - 1; j >= 0; j--) {
                        if(sheets[j][cssrules].length){
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

            /**
             * Clear animation settings
             */
            clearAnimation: function (evt) {
                console.info("_clearAnimation", this, evt.srcElement.id, evt.animationName, evt.elapsedTime);

                etamina.animElementList[this.id] = false;

                //恢复元素原有的class属性。
                etamina.restoreCssClass(this);
                
                //结束时删除 动画class。 动画class也要记录。
                var classname = etamina.popAnimateClassName(this.id);
                etamina.deleteCSS(classname);


                // 删除关键帧的css。
                if(evt.animationName in etamina.doNotDeleteKeyframes){

                }
                else{
                    etamina.deleteCSS(evt.animationName);
                }



                return;
            },
            /**
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


            /**
             *生成用于在element上应用动画效果class css
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
                }
             },
             //保存与在element上应用的动画class名称，用于在动画后删除相关的css
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
             * Initialize
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

            },

            formatStep : function(step){

            }
        };

    return core;
}());

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

etamina.effects.buildframes = function(name,frames)
{
    if(!frames || frames.length<2){
        return;
    }
    var 
        transform,transformOrigin,fade,shadow,
        css;

    css = '@'+etamina.prefix+'keyframes '+  name +'{\n';

    for(var i=0, len = frames.length; i<len; i++)
    {
        var f = frames[i];
        transform = etamina.composeTransformPropery(f);
        transformOrigin = (f.transformOrigin) ? f.transformOrigin:false;
        opacity = f.opacity;
        shadow = f.shadow;

        css +=                      '\t' + f.p +'{\n';        
        css += (transform)?         '\t\t' + etamina.prefix + 'transform:' + transform + ';' + '\n' : '';
        css += (transformOrigin) ?  '\t\t' + etamina.prefix + 'transform-origin:' + transformOrigin + ';' + '\n' : '';
        css += (opacity) ?          '\t\t' + 'opacity: ' + opacity + ';' + '\n' : '';
        css += (shadow) ?           '\t\t' + etamina.prefix + 'box-shadow: ' + shadow + ';' + '\n' : '';
        css +=                      '\t' + '}' + '\n';
    }

    css += '}\n';

    return css;    
};

etamina.effects.buildUniqueKeyframeName = function(animType){

    return 'etamina-'+animType+'-'+(new Date()).getTime() + "-" + Math.floor(Math.random() * 1000);
};



etamina.effects.go = function(elems,playParam,animSetting,getKeyframe){

//还需实现保持动画后状态的方法。

//优化点、针对多个元素应用动画时keyframe的css可能相同。

    var animSetting = animSetting||{};

    var //循环变量
        elem,elemClass,keyframe,        
        elements = etamina.getHTMLelements(elems);

    playParam = etamina.initPlayParam(playParam,animSetting.animType);

    // Loop through elements
    if (elements && elements.length > 0) {
        for (i = 0; i < elements.length; i += 1) {

            elem = elements[i];
            animSetting.index = i;
            //检查并设置元素的动画状态
            if(etamina.animElementList[elem.id]){
                //忽略正在动画中的的元素。
                continue;
            }
            etamina.animElementList[elem.id] = true;



            //获取动画的具体keyframe的名称和代码。
            keyframe = getKeyframe(elem,animSetting); 
            if(animSetting.doNotDeleteKeyframe){
                etamina.doNotDeleteKeyframes[keyframe.name] = true;
            }

            //add css text into DOM style
            if(keyframe.css && keyframe.css!=''){
                if(etamina.debug){
                    console.log(keyframe.css);
                }
                etamina.insertCSS(keyframe.css);
            }

            //prepare class for element to play the animation.
            playParam.name = keyframe.name;
            elemClass = etamina.getAnimationClassRule(playParam,animSetting);
            //add css text into DOM style
            if(etamina.debug){
                console.log(elemClass.css);
            }
            if(elemClass.css && elemClass.css!=''){
                etamina.insertCSS(elemClass.css);
            }


            // Add listener to clear animation after it's done
            if (etamina.prefix == "-moz-") {
                elem.addEventListener("animationend", etamina.clearAnimation, false);
            }
            else {
                elem.addEventListener(etamina.prefixJS + "AnimationEnd", etamina.clearAnimation, false);
            }
            //TODO: 是否在动画后保留结束时的状态。

            //保存elem原有的class，用于在动画后恢复。
            etamina.saveCssClass(elem);
            etamina.pushAnimateClassName(elem.id,elemClass.name)



            //apply css animation
            elem.className += ' ' + elemClass.name;

            if(animSetting.sound && etamina.audio){

                var delayTime = etamina.format.fromTime(playParam.delay);

                if(delayTime>0){
                    setTimeout(function(){
                        etamina.audio.playSound(animSetting.sound,animSetting.volume);
                    },delayTime);
                }
                else{
                    etamina.audio.playSound(animSetting.sound,animSetting.volume);
                }
            }

            console.log(elem.className);
        }       
    }

};

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

//----------------------------------------------------------------------------

