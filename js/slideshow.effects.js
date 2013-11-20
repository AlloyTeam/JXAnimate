
/**
 * @module JXAnimate.Demo
 * @subModule SlideShow
 * @requires JXAnimate.Animate
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
     * 卡片飞向舞台中心的效果。
     * @method flyOutToCenter
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
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
     * 卡片飞向舞台中心的效果。
     * @method flyOutToOutside
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
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

    }
});

}); //end of package
//----------------------------------------------------------------------------

