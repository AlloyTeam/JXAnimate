
/* ===========================================================================
 * JXAnimate Effects Libray
 * 
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
 * @description
 *
 */

JXAnimate.addEffects({
    pageFlipLeft : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'pageFlipLeft';

        var    frames = [
                {p:'0%',rotateY:'0deg',transformOrigin:'0% 50%'},
                {p:'100%',rotateY:'-360deg',transformOrigin:'0% 50%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },
    pageFlipRight : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'pageFlipRight';

        var    frames = [
                {p:'0%',rotateY:'0deg',transformOrigin:'100% 50%'},
                {p:'100%',rotateY:'360deg',transformOrigin:'100% 50%'}
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

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
//----------------------------------------------------------------------------

