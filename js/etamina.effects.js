
/* ===========================================================================
 * etamina Effects Libray
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


etamina.effects.pageFlipLeft = function(elems,playParam,animSetting){
    var animSetting = animSetting || {};

    animSetting.animType = 'pageFlipLeft';

    var    frames = [
            {p:'0%',rotateY:'0deg',transformOrigin:'0% 50%'},
            {p:'100%',rotateY:'-360deg',transformOrigin:'0% 50%'}
        ];

    etamina.effects.goWithFixFrames(elems,playParam,animSetting,frames);

};
etamina.effects.pageFlipRight = function(elems,playParam,animSetting){
    var animSetting = animSetting || {};

    animSetting.animType = 'pageFlipRight';

    var    frames = [
            {p:'0%',rotateY:'0deg',transformOrigin:'100% 50%'},
            {p:'100%',rotateY:'360deg',transformOrigin:'100% 50%'}
        ];

    etamina.effects.goWithFixFrames(elems,playParam,animSetting,frames);

};

etamina.effects.raceFlag = function(elems,playParam,animSetting){
    var animSetting = animSetting || {};

    animSetting.animType = 'raceFlag';

    var    frames = [
            {p:'0%',rotateX:'0deg',rotate:'-720deg',transformOrigin:'100% 0%'},
            {p:'100%',rotateX:'-360deg',rotate:'0',transformOrigin:'100% 0%'}
        ];

    etamina.effects.goWithFixFrames(elems,playParam,animSetting,frames);

};
etamina.effects.raceFlag1 = function(elems,playParam,animSetting){
    var animSetting = animSetting || {};

    animSetting.animType = 'raceFlag2';

    var    frames = [
            {p:'0%',rotateX:'0deg',rotate:'-720deg',transformOrigin:'100% 0%'},
            {p:'100%',rotateX:'-360deg',rotate:'0',transformOrigin:'100% 0%'}
        ];

    var animSetting = animSetting||{};

    animSetting.animType = 'flash';

    var buildKeyframe = function(){
        var keyframeName = etamina.effects.buildUniqueKeyframeName(animSetting.animType);
   
            keyframeCss = '@'+etamina.prefix+'keyframes '+  keyframeName +'{\n'+
            	'0% {-webkit-transform: rotateX(0deg) rotate(-720deg);-webkit-transform-origin:100% 0%;}100% {-webkit-transform: rotateX(-360deg) rotate(0deg) ;-webkit-transform-origin:100% 0%;}\n'+
        '}';

        return {
            name:keyframeName,
            css:keyframeCss
        };
    };

    etamina.effects.go(elems,playParam,animSetting,buildKeyframe);
};
//----------------------------------------------------------------------------

