
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
//----------------------------------------------------------------------------

