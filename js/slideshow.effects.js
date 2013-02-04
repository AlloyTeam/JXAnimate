
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

JXAnimate.addEffects({
    /**
     * [stageAnim1 description]
     * @param  {[type]} elems       [description]
     * @param  {[type]} playParam   [description]
     * @param  {[type]} animSetting [description]
     * @return {[type]}
     */
    stageAnim1 : function(elems,playParam,animSetting){
        var animSetting = animSetting || {};

        animSetting.animType = 'stageAnim1';

        var    frames = [
                {p:'0%',transform:'perspective(1200px) rotateX(0deg) rotateY(0deg) rotateZ(360deg) translate3d(0px, 0px, -400px)'},
                //{p:'30%',transform:'perspective(1200px) rotateX(0deg)  translate3d(0px, 0px, 0px)'},
                //{p:'100%',transform:'perspective(1200px) rotateX(37deg) rotateY(0deg) rotateZ(0deg) translate3d(0px, 0px, -400px)'}
                {p:'100%',transform:'perspective(1200px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) translate3d(0px, 0px, -400px)'}
            
            ];

        this.goWithFixFrames(elems,playParam,animSetting,frames);

    },
    /**
     * [pageFlipRight description]
     * @param  {[type]} elems       [description]
     * @param  {[type]} playParam   [description]
     * @param  {[type]} animSetting [description]
     * @return {[type]}
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

