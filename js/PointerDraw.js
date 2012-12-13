"use strict";

//  this javascript function abstracts mouse, pointer, and touch events
//
//  invoke with:
//      target - the HTML element object which is the target of the drawing
//      startDraw - a function called with four parameters (target, pointerId, x, y) when the drawing begins. x and y are guaranteed to be within target's rectange
//      extendDraw - a function called with four parameters (target, pointerId, x, y) when the drawing is extended. x and y are guaranteed to be within target's rectange
//      endDraw - a function called with two parameters (target, pointerId) when the drawing is ended
//      logMessage - a function called with one parameter (string message) that can be logged as the caller desires. multiple line strings separated by \n may be sent
//
//  all parameters expect target are optional
//
//  target element cannot move within the document during drawing
//
function PointerDraw(target, startDraw, extendDraw, endDraw, logMessage) {

    var lastXYById = {};

    //  an audit function to see if we're keeping lastXYById clean
    if (logMessage) {
        window.setInterval(function() {
            var logthis = false;
            var msg = "lastXYById contains";

            for (var key in lastXYById) {
                logthis = true;
                msg += " " + key;
            }

            if (logthis) {
                logMessage(msg);
            }
        }, 1000);
    }

    //  Opera doesn't have Object.keys so we use this wrapper
    function NumberOfKeys(theObject) {
        if (Object.keys)
            return Object.keys(theObject).length;

        var n = 0;
        for (var key in theObject)
            ++n;

        return n;
    }

    //  IE10's implementation in the Windows Developer preview requires doing all of this
    function PreventDefaultManipulationAndMouseEvent(evtObj) {
        if (evtObj.preventDefault)
            evtObj.preventDefault();

        if (evtObj.preventManipulation)
            evtObj.preventManipulation();

        if (evtObj.preventMouseEvent)
            evtObj.preventMouseEvent();
    }

    //  we send target-relative coordinates to the draw functions
    //  this calculates the offset needed to convert pageX/Y to offsetX/Y, which don't exist in the TouchEvent object or in Firefox's MouseEvent object
    function ComputeDocumentToElementDelta(theElement) {
        var elementLeft = 0;
        var elementTop = 0;

        for (var offsetElement = theElement; offsetElement != null; offsetElement = offsetElement.offsetParent) {
            elementLeft += offsetElement.offsetLeft;
            elementTop += offsetElement.offsetTop;
        }

        return { x: elementLeft, y: elementTop };
    }

    var documentToTargetDelta = ComputeDocumentToElementDelta(target);

    function DoEvent(theEvtObj) {

        //  functions to convert document-relative coordinates to target-relative and constraint them to be within the target
        function targetRelativeX() { return Math.max(0, Math.min(pageX - documentToTargetDelta.x, target.offsetWidth)); };
        function targetRelativeY() { return Math.max(0, Math.min(pageY - documentToTargetDelta.y, target.offsetHeight)); };

        PreventDefaultManipulationAndMouseEvent(theEvtObj);

        var pointerList = theEvtObj.changedTouches ? theEvtObj.changedTouches : [theEvtObj];
        for (var i = 0; i < pointerList.length; ++i) {
            var pointerObj = pointerList[i];
            var pointerId = (typeof pointerObj.identifier != 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId != 'undefined') ? pointerObj.pointerId : 1;

            //  use the pageX/Y coordinates to compute target-relative coordinates
            var pageX = pointerObj.pageX;
            var pageY = pointerObj.pageY;

            if (theEvtObj.type.match(/(start|down)$/i)) {
                //  clause for processing MSPointerDown, touchstart, and mousedown
                
                //  protect against failing to get an up or end on this pointerId
                if (lastXYById[pointerId]) {
                    if (endDraw)
                        endDraw(target, pointerId);
                    delete lastXYById[pointerId];
                    if (logMessage)
                        logMessage("Ended draw on pointer " + pointerId + " in " + theEvtObj.type);
                }

                //  refresh the document-to-target delta each start event in case the target has moved relative to document
                //  note: this function expects the target element to not move or change size during drawing. if it can, move this above the for loop so it's calc'd on every event
                documentToTargetDelta = ComputeDocumentToElementDelta(target);

                if (startDraw)
                    startDraw(target, pointerId, targetRelativeX(), targetRelativeY());

                //  init last page positions for this pointer
                lastXYById[pointerId] = { x: pageX, y: pageY };

                //  in the Microsoft pointer model, set the capture for this pointer
                //  in the mouse model, set the capture or add a document-level event handlers if this is our first down point
                //  nothing is required for the iOS touch model because capture is implied on touchstart
                if (target.msSetPointerCapture)
                    target.msSetPointerCapture(pointerId);
                else if (theEvtObj.type == "mousedown" && NumberOfKeys(lastXYById) == 1) {
                    if (useSetReleaseCapture)
                        target.setCapture(true);
                    else {
                        document.addEventListener("mousemove", DoEvent, false);
                        document.addEventListener("mouseup", DoEvent, false);
                    }
                }
            }
            else if (lastXYById[pointerId] && !(lastXYById[pointerId].x == pageX && lastXYById[pointerId].y == pageY)) {
                //  clause handles events other than down/start when the pointer position has moved
                //  the condition above filters out mousemove when the mouse is up and redundant touch events
                
                if (extendDraw)
                    extendDraw(target, pointerId, targetRelativeX(), targetRelativeY());

                //  update last page positions for this pointer
                lastXYById[pointerId].x = pageX;
                lastXYById[pointerId].y = pageY;
            }

            if (lastXYById[pointerId] && theEvtObj.type.match(/(up|end|cancel)$/i)) {
                //  clause handles up/end/cancel
                
                if (endDraw)
                    endDraw(target, pointerId);

                //  delete last page positions for this pointer
                delete lastXYById[pointerId];

                //  in the Microsoft pointer model, release the capture for this pointer
                //  in the mouse model, release the capture or remove document-level event handlers if there are no down points
                //  nothing is required for the iOS touch model because capture is implied on touchstart
                if (target.msReleasePointerCapture)
                    target.msReleasePointerCapture(pointerId);
                else if (theEvtObj.type == "mouseup" && NumberOfKeys(lastXYById) == 0) {
                    if (useSetReleaseCapture)
                        target.releaseCapture();
                    else {
                        document.removeEventListener("mousemove", DoEvent, false);
                        document.removeEventListener("mouseup", DoEvent, false);
                    }
                }
            }
        }
    }

    var useSetReleaseCapture = false;

    if (window.navigator.msPointerEnabled) {
        //  Microsoft pointer model
        target.addEventListener("MSPointerDown", DoEvent, false);
        target.addEventListener("MSPointerMove", DoEvent, false);
        target.addEventListener("MSPointerUp", DoEvent, false);

        if (typeof target.style.msTouchAction != 'undefined')
            target.style.msTouchAction = "none";

        if (logMessage)
            logMessage("Using Microsoft pointer model");
    }
    else {
        //  iOS touch model
        target.addEventListener("touchstart", DoEvent, false);
        target.addEventListener("touchmove", DoEvent, false);
        target.addEventListener("touchend", DoEvent, false);
        target.addEventListener("touchcancel", DoEvent, false);

        //  mouse model
        target.addEventListener("mousedown", DoEvent, false);

        //  mouse model with capture
        //  rejecting gecko because, unlike ie, firefox does not send events to target when the mouse is outside target
        if (target.setCapture && !window.navigator.userAgent.match(/\bGecko\b/)) {
            useSetReleaseCapture = true;
            
            target.addEventListener("mousemove", DoEvent, false);
            target.addEventListener("mouseup", DoEvent, false);

            if (logMessage)
                logMessage("Using mouse model with capture");
        }
    }

}