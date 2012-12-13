

/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.7.1 - Last updated: 2010.10.08
 * 
 */

Jx().$package(function(J){
/**
 * iPad 的自定义滚动条
 * @class 
 * @memberOf ui
 * @name iScroll
 * @constructor
 * @param {HTMLElement} el
 * @param {Object} options
 * 
 * @since version 1.0
 */
function iScroll (el, options) {
    var that = this, i;
    that.element = typeof el == 'object' ? el : document.getElementById(el);
    that.wrapper = that.element.parentNode;

    that.element.style.webkitTransitionProperty = '-webkit-transform';
    that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
    that.element.style.webkitTransitionDuration = '0';
    that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;

    // Default options
    that.options = {
        bounce: has3d,
        momentum: has3d,
        checkDOMChanges: true,
        topOnDOMChanges: false,
        hScrollbar: has3d,
        vScrollbar: has3d,
        fadeScrollbar: isIthing || !isTouch,
        shrinkScrollbar: isIthing || !isTouch,
        desktopCompatibility: false,
        overflow: 'auto',
        snap: false,
        bounceLock: false,
        scrollbarColor: 'rgba(0,0,0,0.5)',
        /** @ignore */
        onScrollEnd: function () {}
    };
    
    // User defined options
    if (typeof options == 'object') {
        for (i in options) {
            that.options[i] = options[i];
        }
    }

    if (that.options.desktopCompatibility) {
        that.options.overflow = 'hidden';
    }
    
    that.onScrollEnd = that.options.onScrollEnd;
    delete that.options.onScrollEnd;
    
    that.wrapper.style.overflow = that.options.overflow;
    
    that.refresh();

    window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);

    if (isTouch || that.options.desktopCompatibility) {
        that.element.addEventListener(START_EVENT, that, false);
        that.element.addEventListener(MOVE_EVENT, that, false);
        that.element.addEventListener(END_EVENT, that, false);
    }
    
    if (that.options.checkDOMChanges) {
        that.element.addEventListener('DOMSubtreeModified', that, false);
    }
}


iScroll.prototype = 
/**
 * @lends ui.iScroll.prototype
 */
{
    x: 0,
    y: 0,
    enabled: true,
    /** @ignore */
    handleEvent: function (e) {
        var that = this;
        
        switch (e.type) {
            case START_EVENT:
                that.touchStart(e);
                break;
            case MOVE_EVENT:
                that.touchMove(e);
                break;
            case END_EVENT:
                that.touchEnd(e);
                break;
            case 'webkitTransitionEnd':
                that.transitionEnd();
                break;
            case 'orientationchange':
            case 'resize':
                that.refresh();
                break;
            case 'DOMSubtreeModified':
                that.onDOMModified(e);
                break;
        }
    },
    /** @ignore */
    onDOMModified: function (e) {
        var that = this;

        // (Hopefully) execute onDOMModified only once
        if (e.target.parentNode != that.element) {
            return;
        }

        setTimeout(function () { that.refresh(); }, 0);

        if (that.options.topOnDOMChanges && (that.x!=0 || that.y!=0)) {
            that.scrollTo(0,0,'0');
        }
    },
    /**
     * 刷新滚动条
     */
    refresh: function () {
        var that = this,
            resetX = that.x, resetY = that.y,
            snap;
        
        that.scrollWidth = that.wrapper.clientWidth;
        that.scrollHeight = that.wrapper.clientHeight;
        that.scrollerWidth = that.element.offsetWidth;
        that.scrollerHeight = that.element.offsetHeight;
        that.maxScrollX = that.scrollWidth - that.scrollerWidth;
        that.maxScrollY = that.scrollHeight - that.scrollerHeight;
        that.directionX = 0;
        that.directionY = 0;

        if (that.scrollX) {
            if (that.maxScrollX >= 0) {
                resetX = 0;
            } else if (that.x < that.maxScrollX) {
                resetX = that.maxScrollX;
            }
        }
        if (that.scrollY) {
            if (that.maxScrollY >= 0) {
                resetY = 0;
            } else if (that.y < that.maxScrollY) {
                resetY = that.maxScrollY;
            }
        }

        // Snap
        if (that.options.snap) {
            that.maxPageX = -Math.floor(that.maxScrollX/that.scrollWidth);
            that.maxPageY = -Math.floor(that.maxScrollY/that.scrollHeight);

            snap = that.snap(resetX, resetY);
            resetX = snap.x;
            resetY = snap.y;
        }

        if (resetX!=that.x || resetY!=that.y) {
            that.setTransitionTime('0');
            that.setPosition(resetX, resetY, true);
        }
        
        that.scrollX = that.scrollerWidth > that.scrollWidth;
        that.scrollY = !that.options.bounceLock && !that.scrollX || that.scrollerHeight > that.scrollHeight;

        // Update horizontal scrollbar
        if (that.options.hScrollbar && that.scrollX) {
            that.scrollBarX = that.scrollBarX || new scrollbar('horizontal', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
            that.scrollBarX.init(that.scrollWidth, that.scrollerWidth);
        } else if (that.scrollBarX) {
            that.scrollBarX = that.scrollBarX.remove();
        }

        // Update vertical scrollbar
        if (that.options.vScrollbar && that.scrollY && that.scrollerHeight > that.scrollHeight) {
            that.scrollBarY = that.scrollBarY || new scrollbar('vertical', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
            that.scrollBarY.init(that.scrollHeight, that.scrollerHeight);
        } else if (that.scrollBarY) {
            that.scrollBarY = that.scrollBarY.remove();
        }
    },
    /** @ignore */
    setPosition: function (x, y, hideScrollBars) {
        var that = this;
        
        that.x = x;
        that.y = y;

        that.element.style.webkitTransform = translateOpen + that.x + 'px,' + that.y + 'px' + translateClose;

        // Move the scrollbars
        if (!hideScrollBars) {
            if (that.scrollBarX) {
                that.scrollBarX.setPosition(that.x);
            }
            if (that.scrollBarY) {
                that.scrollBarY.setPosition(that.y);
            }
        }
    },
    
    /*
    getPosition: function () {
        var that = this;
        return that.element.style.webkitTransform;
    },
    */
    /**
     * 设置滚动的动画时间
     * @param {Number} time
     */
    setTransitionTime: function(time) {
        var that = this;
        
        time = time || '0';
        that.element.style.webkitTransitionDuration = time;
        
        if (that.scrollBarX) {
            that.scrollBarX.bar.style.webkitTransitionDuration = time;
            that.scrollBarX.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
        }
        if (that.scrollBarY) {
            that.scrollBarY.bar.style.webkitTransitionDuration = time;
            that.scrollBarY.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
        }
    },
    /** @ignore */
    touchStart: function(e) {
        var that = this,
            matrix;
        
        if (!that.enabled) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        
        that.scrolling = true;      // This is probably not needed, but may be useful if iScroll is used in conjuction with other frameworks

        that.moved = false;
        that.distX = 0;
        that.distY = 0;

        that.setTransitionTime('0');

        // Check if the scroller is really where it should be
        if (that.options.momentum || that.options.snap) {
            matrix = new WebKitCSSMatrix(window.getComputedStyle(that.element).webkitTransform);
            if (matrix.e != that.x || matrix.f != that.y) {
                document.removeEventListener('webkitTransitionEnd', that, false);
                that.setPosition(matrix.e, matrix.f);
                that.moved = true;
            }
        }

        that.touchStartX = isTouch ? e.changedTouches[0].pageX : e.pageX;
        that.scrollStartX = that.x;

        that.touchStartY = isTouch ? e.changedTouches[0].pageY : e.pageY;
        that.scrollStartY = that.y;

        that.scrollStartTime = e.timeStamp;

        that.directionX = 0;
        that.directionY = 0;
    },
    /** @ignore */
    touchMove: function(e) {
        if (!this.scrolling) {
            return;
        }

        var that = this,
            pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
            pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
            leftDelta = that.scrollX ? pageX - that.touchStartX : 0,
            topDelta = that.scrollY ? pageY - that.touchStartY : 0,
            newX = that.x + leftDelta,
            newY = that.y + topDelta;

        //e.preventDefault();
        e.stopPropagation();    // Stopping propagation just saves some cpu cycles (I presume)

        that.touchStartX = pageX;
        that.touchStartY = pageY;

        // Slow down if outside of the boundaries
        if (newX >= 0 || newX < that.maxScrollX) {
            newX = that.options.bounce ? Math.round(that.x + leftDelta / 3) : (newX >= 0 || that.maxScrollX>=0) ? 0 : that.maxScrollX;
        }
        if (newY >= 0 || newY < that.maxScrollY) { 
            newY = that.options.bounce ? Math.round(that.y + topDelta / 3) : (newY >= 0 || that.maxScrollY>=0) ? 0 : that.maxScrollY;
        }

        if (that.distX + that.distY > 5) {          // 5 pixels threshold

            // Lock scroll direction
            if (that.distX-3 > that.distY) {
                newY = that.y;
                topDelta = 0;
            } else if (that.distY-3 > that.distX) {
                newX = that.x;
                leftDelta = 0;
            }

            that.setPosition(newX, newY);
            that.moved = true;
            that.directionX = leftDelta > 0 ? -1 : 1;
            that.directionY = topDelta > 0 ? -1 : 1;
        } else {
            that.distX+= Math.abs(leftDelta);
            that.distY+= Math.abs(topDelta);
//          that.dist+= Math.abs(leftDelta) + Math.abs(topDelta);
        }
    },
    /** @ignore */
    touchEnd: function(e) {
        if (!this.scrolling) {
            return;
        }

        var that = this,
            time = e.timeStamp - that.scrollStartTime,
            point = isTouch ? e.changedTouches[0] : e,
            target, ev,
            momentumX, momentumY,
            newDuration = 0,
            newPositionX = that.x, newPositionY = that.y,
            snap;

        that.scrolling = false;

        if (!that.moved) {
            that.resetPosition();

            if (isTouch) {
                // Find the last touched element
                target = point.target;
                while (target.nodeType != 1) {
                    target = target.parentNode;
                }

                // Create the fake event
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent('click', true, true, e.view, 1,
                    point.screenX, point.screenY, point.clientX, point.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    0, null);
                ev._fake = true;
                target.dispatchEvent(ev);
            }

            return;
        }

        if (!that.options.snap && time > 250) {         // Prevent slingshot effect
            that.resetPosition();
            return;
        }

        if (that.options.momentum) {
            momentumX = that.scrollX === true
                ? that.momentum(that.x - that.scrollStartX,
                                time,
                                that.options.bounce ? -that.x + that.scrollWidth/5 : -that.x,
                                that.options.bounce ? that.x + that.scrollerWidth - that.scrollWidth + that.scrollWidth/5 : that.x + that.scrollerWidth - that.scrollWidth)
                : { dist: 0, time: 0 };

            momentumY = that.scrollY === true
                ? that.momentum(that.y - that.scrollStartY,
                                time,
                                that.options.bounce ? -that.y + that.scrollHeight/5 : -that.y,
                                that.options.bounce ? (that.maxScrollY < 0 ? that.y + that.scrollerHeight - that.scrollHeight : 0) + that.scrollHeight/5 : that.y + that.scrollerHeight - that.scrollHeight)
                : { dist: 0, time: 0 };

            newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);        // The minimum animation length must be 1ms
            newPositionX = that.x + momentumX.dist;
            newPositionY = that.y + momentumY.dist;
        }

        if (that.options.snap) {
            snap = that.snap(newPositionX, newPositionY);
            newPositionX = snap.x;
            newPositionY = snap.y;
            newDuration = Math.max(snap.time, newDuration);
        }

        that.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
    },
    /** @ignore */
    transitionEnd: function () {
        var that = this;
        document.removeEventListener('webkitTransitionEnd', that, false);
        that.resetPosition();
    },
    /**
     * 重置滚动条的位置
     */
    resetPosition: function () {
        var that = this,
            resetX = that.x,
            resetY = that.y;

        if (that.x >= 0) {
            resetX = 0;
        } else if (that.x < that.maxScrollX) {
            resetX = that.maxScrollX;
        }

        if (that.y >= 0 || that.maxScrollY > 0) {
            resetY = 0;
        } else if (that.y < that.maxScrollY) {
            resetY = that.maxScrollY;
        }
        
        if (resetX != that.x || resetY != that.y) {
            that.scrollTo(resetX, resetY);
        } else {
            if (that.moved) {
                that.onScrollEnd();     // Execute custom code on scroll end
                that.moved = false;
            }

            // Hide the scrollbars
            if (that.scrollBarX) {
                that.scrollBarX.hide();
            }
            if (that.scrollBarY) {
                that.scrollBarY.hide();
            }
        }
    },
    
    snap: function (x, y) {
        var that = this, time;

        if (that.directionX > 0) {
            x = Math.floor(x/that.scrollWidth);
        } else if (that.directionX < 0) {
            x = Math.ceil(x/that.scrollWidth);
        } else {
            x = Math.round(x/that.scrollWidth);
        }
        that.pageX = -x;
        x = x * that.scrollWidth;
        if (x > 0) {
            x = that.pageX = 0;
        } else if (x < that.maxScrollX) {
            that.pageX = that.maxPageX;
            x = that.maxScrollX;
        }

        if (that.directionY > 0) {
            y = Math.floor(y/that.scrollHeight);
        } else if (that.directionY < 0) {
            y = Math.ceil(y/that.scrollHeight);
        } else {
            y = Math.round(y/that.scrollHeight);
        }
        that.pageY = -y;
        y = y * that.scrollHeight;
        if (y > 0) {
            y = that.pageY = 0;
        } else if (y < that.maxScrollY) {
            that.pageY = that.maxPageY;
            y = that.maxScrollY;
        }

        // Snap with constant speed (proportional duration)
        time = Math.round(Math.max(
                Math.abs(that.x - x) / that.scrollWidth * 500,
                Math.abs(that.y - y) / that.scrollHeight * 500
            ));
            
        return { x: x, y: y, time: time };
    },
    /**
     * 滚动到指定位置
     * @param {Number} destX
     * @param {Number} destY
     * @param {Number} runtime 滚动动画的执行时间
     */
    scrollTo: function (destX, destY, runtime) {
        var that = this;

        if (that.x == destX && that.y == destY) {
            that.resetPosition();
            return;
        }

        that.moved = true;
        that.setTransitionTime(runtime || '350ms');
        that.setPosition(destX, destY);

        if (runtime==='0' || runtime=='0s' || runtime=='0ms') {
            that.resetPosition();
        } else {
            document.addEventListener('webkitTransitionEnd', that, false);  // At the end of the transition check if we are still inside of the boundaries
        }
    },
    /**
     * 按页滚动
     * @param {Number} pageX
     * @param {Number} pageY
     * @param {Number} runtime 滚动动画的执行时间
     */
    scrollToPage: function (pageX, pageY, runtime) {
        var that = this, snap;

        if (!that.options.snap) {
            that.pageX = -Math.round(that.x / that.scrollWidth);
            that.pageY = -Math.round(that.y / that.scrollHeight);
        }

        if (pageX == 'next') {
            pageX = ++that.pageX;
        } else if (pageX == 'prev') {
            pageX = --that.pageX;
        }

        if (pageY == 'next') {
            pageY = ++that.pageY;
        } else if (pageY == 'prev') {
            pageY = --that.pageY;
        }

        pageX = -pageX*that.scrollWidth;
        pageY = -pageY*that.scrollHeight;

        snap = that.snap(pageX, pageY);
        pageX = snap.x;
        pageY = snap.y;

        that.scrollTo(pageX, pageY, runtime || '500ms');
    },
    /**
     * 滚动到指定节点处
     * @param {HTMLElement} el
     * @param {Number} runtime 滚动动画的执行时间
     */
    scrollToElement: function (el, runtime) {
        el = typeof el == 'object' ? el : this.element.querySelector(el);

        if (!el) {
            return;
        }

        var that = this,
            x = that.scrollX ? -el.offsetLeft : 0,
            y = that.scrollY ? -el.offsetTop : 0;

        if (x >= 0) {
            x = 0;
        } else if (x < that.maxScrollX) {
            x = that.maxScrollX;
        }

        if (y >= 0) {
            y = 0;
        } else if (y < that.maxScrollY) {
            y = that.maxScrollY;
        }

        that.scrollTo(x, y, runtime);
    },
    
    momentum: function (dist, time, maxDistUpper, maxDistLower) {
        var friction = 2.5,
            deceleration = 1.2,
            speed = Math.abs(dist) / time * 1000,
            newDist = speed * speed / friction / 1000,
            newTime = 0;

        // Proportinally reduce speed if we are outside of the boundaries 
        if (dist > 0 && newDist > maxDistUpper) {
            speed = speed * maxDistUpper / newDist / friction;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower) {
            speed = speed * maxDistLower / newDist / friction;
            newDist = maxDistLower;
        }
        
        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;

        return { dist: Math.round(newDist), time: Math.round(newTime) };
    },
    /**
     * 销毁
     */
    destroy: function (full) {
        var that = this;

        window.removeEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);      
        that.element.removeEventListener(START_EVENT, that, false);
        that.element.removeEventListener(MOVE_EVENT, that, false);
        that.element.removeEventListener(END_EVENT, that, false);
        document.removeEventListener('webkitTransitionEnd', that, false);

        if (that.options.checkDOMChanges) {
            that.element.removeEventListener('DOMSubtreeModified', that, false);
        }

        if (that.scrollBarX) {
            that.scrollBarX = that.scrollBarX.remove();
        }

        if (that.scrollBarY) {
            that.scrollBarY = that.scrollBarY.remove();
        }
        
        if (full) {
            that.wrapper.parentNode.removeChild(that.wrapper);
        }
        
        return null;
    }
};
/**
 * @ignore
 */
function scrollbar (dir, wrapper, fade, shrink, color) {
    var that = this,
        doc = document;
    
    that.dir = dir;
    that.fade = fade;
    that.shrink = shrink;
    that.uid = ++uid;

    // Create main scrollbar
    that.bar = doc.createElement('div');

    that.bar.style.cssText = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:' + color + ';' +
        '-webkit-transform:' + translateOpen + '0,0' + translateClose + ';' +
        (dir == 'horizontal' ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px');

    // Create scrollbar wrapper
    that.wrapper = doc.createElement('div');
    that.wrapper.style.cssText = '-webkit-mask:-webkit-canvas(scrollbar' + that.uid + that.dir + ');position:absolute;z-index:10;pointer-events:none;overflow:hidden;opacity:0;-webkit-transition-duration:' + (fade ? '300ms' : '0') + ';-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
        (that.dir == 'horizontal' ? 'bottom:2px;left:2px;right:7px;height:5px' : 'top:2px;right:2px;bottom:7px;width:5px;');

    // Add scrollbar to the DOM
    that.wrapper.appendChild(that.bar);
    wrapper.appendChild(that.wrapper);
}
/**
 * @ignore
 */
scrollbar.prototype = 
/**
 * @ignore
 */
{
    init: function (scroll, size) {
        var that = this,
            doc = document,
            pi = Math.PI,
            ctx;

        // Create scrollbar mask
        if (that.dir == 'horizontal') {
            if (that.maxSize != that.wrapper.offsetWidth) {
                that.maxSize = that.wrapper.offsetWidth;
                ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, that.maxSize, 5);
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.beginPath();
                ctx.arc(2.5, 2.5, 2.5, pi/2, -pi/2, false);
                ctx.lineTo(that.maxSize-2.5, 0);
                ctx.arc(that.maxSize-2.5, 2.5, 2.5, -pi/2, pi/2, false);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            if (that.maxSize != that.wrapper.offsetHeight) {
                that.maxSize = that.wrapper.offsetHeight;
                ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, 5, that.maxSize);
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.beginPath();
                ctx.arc(2.5, 2.5, 2.5, pi, 0, false);
                ctx.lineTo(5, that.maxSize-2.5);
                ctx.arc(2.5, that.maxSize-2.5, 2.5, 0, pi, false);
                ctx.closePath();
                ctx.fill();
            }
        }

        that.size = Math.max(Math.round(that.maxSize * that.maxSize / size), 6);
        that.maxScroll = that.maxSize - that.size;
        that.toWrapperProp = that.maxScroll / (scroll - size);
        that.bar.style[that.dir == 'horizontal' ? 'width' : 'height'] = that.size + 'px';
    },
    
    setPosition: function (pos) {
        var that = this;
        
        if (that.wrapper.style.opacity != '1') {
            that.show();
        }

        pos = Math.round(that.toWrapperProp * pos);

        if (pos < 0) {
            pos = that.shrink ? pos + pos*3 : 0;
            if (that.size + pos < 7) {
                pos = -that.size + 6;
            }
        } else if (pos > that.maxScroll) {
            pos = that.shrink ? pos + (pos-that.maxScroll)*3 : that.maxScroll;
            if (that.size + that.maxScroll - pos < 7) {
                pos = that.size + that.maxScroll - 6;
            }
        }

        pos = that.dir == 'horizontal'
            ? translateOpen + pos + 'px,0' + translateClose
            : translateOpen + '0,' + pos + 'px' + translateClose;
        that.bar.style.webkitTransform = pos;
    },
    
    

    show: function () {
        if (has3d) {
            this.wrapper.style.webkitTransitionDelay = '0';
        }
        this.wrapper.style.opacity = '1';
    },

    hide: function () {
        if (has3d) {
            this.wrapper.style.webkitTransitionDelay = '350ms';
        }
        this.wrapper.style.opacity = '0';
    },
    
    remove: function () {
        this.wrapper.parentNode.removeChild(this.wrapper);
        return null;
    }
};

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
    // Device sniffing
    isIthing = (/iphone|ipad/gi).test(navigator.appVersion),
    isTouch = ('ontouchstart' in window),
    // Event sniffing
    START_EVENT = isTouch ? 'touchstart' : 'mousedown',
    MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
    END_EVENT = isTouch ? 'touchend' : 'mouseup',
    // Translate3d helper
    translateOpen = 'translate' + (has3d ? '3d(' : '('),
    translateClose = has3d ? ',0)' : ')',
    // Unique ID
    uid = 0;

// Expose iScroll to the world
J.ui = J.ui || {};
J.ui.iScroll = iScroll;



});