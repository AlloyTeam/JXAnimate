
/* ===========================================================================
 * JX.Animate Effects Libray
 * @module JXAnimate.effects
 * 
 * @description
 * A CSS animation Engine and Library
 * Using addEffects method to add new effect functions into Animation Library.
 *
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @class JX.Animate
 */

JXAnimate.addEffects({
    /**
     * 向左翻页的效果，内置Demo动画，代码演示了通过Frame数组形式定义动画。
     * @method pageFlipLeft
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    pageFlipLeft : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'pageFlipLeft';

        var    frames = [
                {p:'0%',rotateY:'0deg',transformOrigin:'0% 50%'},
                {p:'100%',rotateY:'-360deg',transformOrigin:'0% 50%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },
    /**
     * 向右翻页的效果，内置Demo动画，代码演示了通过Frame数组形式定义动画。
     * @method pageFlipLeft
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    pageFlipRight : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'pageFlipRight';

        var    frames = [
                {p:'0%',rotateY:'0deg',transformOrigin:'100% 50%'},
                {p:'100%',rotateY:'360deg',transformOrigin:'100% 50%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },

    /**
     * 摇旗子的效果，内置Demo动画，代码演示了通过Frame数组形式定义动画。
     * @method raceFlag
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    raceFlag : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'raceFlag';

        var    frames = [
                {p:'0%',rotateX:'0deg',rotate:'-720deg',transformOrigin:'100% 0%'},
                {p:'100%',rotateX:'-360deg',rotate:'0',transformOrigin:'100% 0%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },
    /**
     * 摇旗子的效果，内置Demo动画，代码演示了通过CSS样式字符串的形式定义动画。
     * @method raceFlag1
     * @param  {array} elems       HTML元素id的集合
     * @param  {object} playParam   播放参数，时长、延时、重复等
     * @param  {animSetting} animSetting 动画参数，多米诺效果、回调、声音等
     * @return {void}             
     */
    raceFlag1 : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'raceFlag2';


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
//----------------------------------------------------------------------------

