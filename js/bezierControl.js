var _BezierControls = new function () {

    var CubicBezierCanvases = {};
    var nextCanvasId = 0;

    this.InitCubicBezierCanvases = function () {
        var cans = document.getElementsByClassName("cubicBezierTimingCanvas");
        for (var i = 0; i < cans.length; ++i)
            _BezierControls.InitCubicBezierCanvas(cans[i]);
    };

    this.InitCubicBezierCanvas = function (can) {
        if (!can.id)
            can.id = "CubicBezierCanvas" + nextCanvasId++;

        if (CubicBezierCanvases[can.id])
            return;

        CubicBezierCanvases[can.id] = {
            canvas: can,
            ctx: can.getContext("2d"),
            w: can.width,
            h: can.height,
            xscale: can.width - 10,
            yscale: can.height - 10,
            handleRadius: 4 / (can.width - 10),
            x1: 0.25,
            y1: 0.1,
            x2: 0.25,
            y2: 1.0,
            drawStep: false,

            setCPs: function (cpx1, cpy1, cpx2, cpy2) {
                this.x1 = cpx1;
                this.y1 = cpy1;
                this.x2 = cpx2;
                this.y2 = cpy2;

                this.drawStep = ((cpx1 == 0.0 && cpy1 == 1.0 && cpx2 == 0.0 && cpy2 == 1.0) || (cpx1 == 1.0 && cpy1 == 0.0 && cpx2 == 1.0 && cpy2 == 0.0));
            }
        };

        var state = CubicBezierCanvases[can.id];

        //  init the scale we're going to use to draw in a 0,1 space with 0,0 in lower left
        state.ctx.translate(0, state.h);
        state.ctx.scale(1, -1);
        state.ctx.translate(4.5, 4.5);
        state.ctx.scale(state.xscale, state.yscale);

        DrawCubicBezierCanvas(state);
        PointerDraw(can, grabPoint, dragPoint, releasePoint, null);
    };

    this.SetCPsForCanvas = function (id, cpx1, cpy1, cpx2, cpy2) {
        var state = CubicBezierCanvases[id];

        if (state) {
            state.setCPs(cpx1, cpy1, cpx2, cpy2);
            DrawCubicBezierCanvas(state);
        }
    };

    this.GetCPsForCanvas = function (id) {
        var state = CubicBezierCanvases[id];

        if (state)
            return { x1: state.x1, y1: state.y1, x2: state.x2, y2: state.y2 };

        return { x1: 0, y1: 0, x2: 0, y2: 0 };
    };

    function scaleToCanvas(state, x, y) {
        var canX = (x - 4.5) / state.xscale;
        var canY = (y * -1 + state.h - 4.5) / state.yscale;
        return { x: canX, y: canY };
    }

    function grabPoint(target, pointerId, x, y) {
        var state = CubicBezierCanvases[target.id];

        var xy = scaleToCanvas(state, x, y);

        //  figure out which control point we're closer to
        var d1 = Math.sqrt(Math.pow(state.x1 - xy.x, 2) + Math.pow(state.y1 - xy.y, 2));
        var d2 = Math.sqrt(Math.pow(state.x2 - xy.x, 2) + Math.pow(state.y2 - xy.y, 2));
        state.movingCP1 = (d1 < d2);
        state.movingCP2 = !state.movingCP1;

        dragPoint(target, pointerId, x, y);
    }

    function releasePoint(target, pointerId) {
        var state = CubicBezierCanvases[target.id];

        if (state.movingCP1 || state.movingCP2) {
            state.movingCP1 = false;
            state.movingCP2 = false;
            DrawCubicBezierCanvas(state);

            var slider = state.canvas.getAttribute("myslider");
            if (slider)
                _Slider.setValue(slider, "cubic-bezier"); // causes the setter to be called with the value
        }
    }

    function dragPoint(target, pointerId, x, y) {
        var state = CubicBezierCanvases[target.id];

        if (state.movingCP1 || state.movingCP2) {

            //	tranform mouse event coordinates
            var xy = scaleToCanvas(state, x, y);

            //	limit to valid range
            xy.x = Math.max(0, Math.min(1, xy.x));
            xy.y = Math.max(0, Math.min(1, xy.y));

            if (state.movingCP1) {
                state.x1 = xy.x;
                state.y1 = xy.y;
            }
            else {
                state.x2 = xy.x;
                state.y2 = xy.y;
            }

            state.drawStep = false;
            DrawCubicBezierCanvas(state);
        }
    }

    function DrawCubicBezierCanvas(state) {
        var ctx = state.ctx;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 1);
        ctx.lineTo(1, 1);
        ctx.lineTo(1, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.strokeStyle = "lightblue";
        ctx.lineWidth = 0.5 / state.xscale;
        ctx.stroke();

        ctx.strokeStyle = "black";

        ctx.beginPath();
        ctx.moveTo(0, 0);
        if (state.drawStep) {
            ctx.lineTo(state.x1, state.y1);
            ctx.lineTo(1, 1);
        }
        else {
            ctx.bezierCurveTo(state.x1, state.y1, state.x2, state.y2, 1, 1);
        }
        ctx.lineWidth = 2 / state.xscale;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(state.x1, state.y1);
        ctx.closePath();
        ctx.lineWidth = 0.5 / state.xscale;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(state.x1, state.y1, state.handleRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = state.movingCP1 ? "gold" : "lightblue";
        ctx.fill();
        ctx.lineWidth = 1 / state.xscale;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(state.x2, state.y2);
        ctx.closePath();
        ctx.lineWidth = 0.5 / state.xscale;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(state.x2, state.y2, state.handleRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = state.movingCP2 ? "gold" : "lightblue";
        ctx.fill();
        ctx.lineWidth = 1 / state.xscale;
        ctx.stroke();
    }

};

document.addEventListener("DOMContentLoaded", function () { _BezierControls.InitCubicBezierCanvases(); }, false);
