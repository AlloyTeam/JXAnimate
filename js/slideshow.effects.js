
/* ===========================================================================
 * Demo of JXAnimate Effects Libray
 * 
 *
 * @description
 * Define animations for the demo of the JXAnimation.
 * 
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @description
 *
 */

Jx().$package("SlideShow", function(J){

var $D = J.dom;

JXAnimate.addEffects({
    /**
     * [stageAnim1 description]
     * @param  {[type]} elems       [description]
     * @param  {[type]} playParam   [description]
     * @param  {[type]} animSetting [description]
     * @return {[type]}
     */
    flyOutToCenter2 : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'flyOutToCenter';

        var buildKeyframe = function(elem,setting){
            var keyframeName = this.buildUniqueKeyframeName(animSetting.animType),
                x1,y1,x2,y2,w,h,stage,stageW,stageH;

                x1 = $D.getPosX(elem);
                y1 = $D.getPosY(elem);
                w = $D.getWidth(elem);
                h = $D.getHeight(elem);

                stage = SlideShow.getStage();
                stageW = SlideShow.getStageWidth();
                stageH = SlideShow.getStageHeight();

                x2 = (stageW - w)/2;
                y2 = (stageH - h)/2;
                x2+= 'px';
                y2+= 'px';
       
                keyframeCss = '@'+this.prefix+'keyframes '+  keyframeName +'{\n'+
                    '0% {-webkit-transform: scale(1);-webkit-transform-origin:50% 50%;}100% {-webkit-transform: scale(2) ;-webkit-transform-origin:50% 50%;}\n'+
            '}';

            return {
                name:keyframeName,
                css:keyframeCss
            };
        };

        this.go(elems,playParam,animSetting,buildKeyframe);
    },
    /**
     * [flyOutToCenter description]
     * @param  {[type]} elems       [description]
     * @param  {[type]} playParam   [description]
     * @param  {[type]} animSetting [description]
     * @return {[type]}
     */
    flyOutToCenter : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};


        var buildKeyframe = function(elem,animSetting){
                var index = animSetting.index,
                    keyframeName = this.buildUniqueKeyframeName(animSetting.animType),
                    x1,y1,x2,y2,w,h,stage,stageW,stageH,styleText1,styleText2;

                    x1 = $D.getPosX(elem);
                    y1 = $D.getPosY(elem);
                    w = $D.getWidth(elem);
                    h = $D.getHeight(elem);

                    stage = SlideShow.getStage();
                    stageW = SlideShow.getStageWidth();
                    stageH = SlideShow.getStageHeight();

                    x2 = (stageW - w)/2;
                    y2 = (stageH - h)/2;
                    x1+= 'px';
                    y1+= 'px';
                    x2+= 'px';
                    y2+= 'px';

                animSetting.animType = 'flyOutToCenter2';
                styleText1 = 'top:'+y1+';left:'+x1+';z-index:100';
                styleText2 = 'top:'+y2+';left:'+x2+';z-index:100';

                var frames = [
                        {p:'0%',
                            opacity:1,
                            scale:'1',
                            transformOrigin:'50% 50%',
                            styleText:styleText1
                        },
                        {p:'100%',
                            opacity:0,
                            scale:'1.5',
                            transformOrigin:'50% 50%',
                            styleText:styleText2
                        }
                    ];



                return {
                    name:keyframeName,
                    css: this.buildframes(keyframeName,frames)
                };
            };
        
        this.go(elems,playParam,animSetting,buildKeyframe);

    },
    /**
     * [flyOutToOutside description]
     * @param  {[type]} elems       [description]
     * @param  {[type]} playParam   [description]
     * @param  {[type]} animSetting [description]
     * @return {[type]}
     */
    flyOutToOutside : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};
        animSetting.animType = 'flyOutToOutside';


        var buildKeyframe = function(elem,animSetting){
                var index = animSetting.index,
                    keyframeName = this.buildUniqueKeyframeName(animSetting.animType),
                    x1,y1,x2,y2,w,h,stage,stageW,stageH,styleText1,styleText2,
                    xC,yC,r;

                    x1 = $D.getPosX(elem);
                    y1 = $D.getPosY(elem);
                    w = $D.getWidth(elem);
                    h = $D.getHeight(elem);

                    stage = SlideShow.getStage();
                    stageW = SlideShow.getStageWidth();
                    stageH = SlideShow.getStageHeight();

                    r = 4;

                    xC = (stageW - w)/2;
                    yC = (stageH - h)/2;
                    x2 = ((r+1)*x1-xC)/r;
                    y2 = ((r+1)*y1-yC)/r;
                    x1+= 'px';
                    y1+= 'px';
                    x2+= 'px';
                    y2+= 'px';

                styleText1 = 'top:'+y1+';left:'+x1+';z-index:100';
                styleText2 = 'top:'+y2+';left:'+x2+';z-index:100';

                var frames = [
                        {p:'0%',
                            opacity:1,
                            scale:'1',
                            transformOrigin:'50% 50%',
                            styleText:styleText1
                        },
                        {p:'100%',
                            opacity:0,
                            scale:'1.5',
                            transformOrigin:'50% 50%',
                            styleText:styleText2
                        }
                    ];



                return {
                    name:keyframeName,
                    css: this.buildframes(keyframeName,frames)
                };
            };
        
        this.go(elems,playParam,animSetting,buildKeyframe);

    },
    raceFlag : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'raceFlag';

        var    frames = [
                {p:'0%',rotateX:'0deg',rotate:'-720deg',transformOrigin:'100% 0%'},
                {p:'100%',rotateX:'-360deg',rotate:'0',transformOrigin:'100% 0%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },
    raceFlag1 : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'raceFlag2';

        var    frames = [
                {p:'0%',rotateX:'0deg',rotate:'-720deg',transformOrigin:'100% 0%'},
                {p:'100%',rotateX:'-360deg',rotate:'0',transformOrigin:'100% 0%'}
            ];

        var animSetting = animSetting||{};

        animSetting.animType = 'flash';

        var buildKeyframe = function(){
            var keyframeName = this.buildUniqueKeyframeName(animSetting.animType);
       
                keyframeCss = '@'+this.prefix+'keyframes '+  keyframeName +'{\n'+
                	'0% {-webkit-transform: rotateX(0deg) rotate(-720deg);-webkit-transform-origin:100% 0%;}100% {-webkit-transform: rotateX(-360deg) rotate(0deg) ;-webkit-transform-origin:100% 0%;}\n'+
            '}';

            return {
                name:keyframeName,
                css:keyframeCss
            };
        };

        this.go(elems,playParam,animSetting,buildKeyframe);
    }
});

}); //end of package
//----------------------------------------------------------------------------

