
var _Slider = new function () {

    var template = '\
    	<div class="sliderLeftReadout"></div>\
		<div class="sliderMinusCell">\
			<a class="sliderMinus" href="javascript:_Slider.DecreaseValueByStep({sliderID});"></a>\
		</div>\
		<div class="sliderScaleCell" mySlider={sliderID} >\
			<div class="sliderScale"></div>\
			<a class="sliderThumbWrap" ondblclick="_Slider.RestoreValue(event, {sliderID});" onkeydown="_Slider.KeyThumb(event, {sliderID});" href="javascript:_Slider.IncreaseOrDecrease();"><div class="sliderThumb"></div></a>\
		</div>\
		<div class="sliderPlusCell">\
			<a class="sliderPlus" href="javascript:_Slider.IncreaseValueByStep({sliderID});"></a>\
		</div>\
		<div class="sliderRightReadout"></div>\
';

    function sliderOptions(initString) {
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.readout = "left";      // or "none"; "right"
        this.readoutalign = "all";  // or string name of group to align with
        this.value = Number.NaN;
        this.units = "";
        this.labels = "none";       // or "top"; "bottom"
        this.ticks = "none";        // or "above"; "below"; "cross"
        this.values = [];           // or array of string values
        this.plusminus = "display"; // or "none"
        this.animateclick = true;   // or false 
        this.setter = null;         // or function name we'll call with formattedValue as its parameter
        this.zero = null;           // a way to change zero to a string such as "auto" or "normal"

        this.formattedValue = function () {
            if (this.zero && this.value == 0)
                return this.zero;

            return (this.values.length > 0 ? this.values[this.value] : this.value.toString()) + this.units;
        };

        if (initString) {
            var initParts = initString.split(";");

            for (var i = 0; i < initParts.length; ++i) {
                var keyValue = initParts[i];
                if (keyValue.length > 3) {
                    var keyValueMatch = keyValue.match(/^(.+?)[:=](.+?)$/);

                    if (keyValueMatch) {
                        var key = keyValueMatch[1];
                        var value = keyValueMatch[2];
                        if (value.match(/^(true|false)$/i) != null)
                            value = (value == "true");
                        else if (value.match(/^-?\d+$/) != null)
                            value = parseInt(value);
                        else if (value.match(/^-?\d+\.\d+$/) != null)
                            value = parseFloat(value);
                        else if (value.match(/^[ \w\-#]+(\s*[,\|]\s*[ \w\-#]+)+$/) != null) {
                            value = value.split(/\s*[,|]\s*/);
                        }

                        if (typeof this[key] != 'undefined') {
                            this[key] = value;
                        }
                        else {
                            if (window.console)
                                window.console.log("Unknown option '" + key + "'");
                        }
                    }
                }
            }
        }

        if (this.values.length > 0) {
            this.min = 0;
            this.max = this.values.length - 1;
            this.step = 1;
            this.animateclick = false;
            if (isNaN(this.value) || this.value < this.min || this.max < this.value)
                this.value = 0;
        }

        if (isNaN(this.value)) {
            this.value = Math.round((this.min + this.max) / 2 * (1 / this.step)) / (1 / this.step);
        }

        this.originalValue = this.value;
    }

    var optionsBySlider = {};
    var nextSliderID = 0;

    this.init = function () {
        InitThese("*.sliderControl");
    };

    this.initUnder = function (selector) {
        InitThese(selector + " *.sliderControl");
    };

    function InitThese(selector) {
        var sliders = document.querySelectorAll(selector);
        for (var i = 0; i < sliders.length; ++i) {
            InitOneSlider(sliders[i]);
        }

        AlignReadoutGroups();
    }

    function InitOneSlider(slider) {
        if (!slider.id)
            slider.id = "_sliderControl" + nextSliderID++;

        var sliderID = slider.id;

        if (optionsBySlider[sliderID])
            return;

        slider.innerHTML = template.replace(/{sliderID}/g, "'" + sliderID + "'");

        optionsBySlider[sliderID] = new sliderOptions(slider.getAttribute("slideroptions"));

        optionsBySlider[sliderID].sliderControlElement = slider; // save reference to top-level element
        slider.setAttribute("value", optionsBySlider[sliderID].formattedValue());

        InitReadout(sliderID);
        InitSlider(sliderID);

        //  use PointerDraw.js to handle the pointer/touch/mouse interaction
        PointerDraw(document.querySelectorAll("[mySlider='" + sliderID + "']")[0], pointerMove, pointerMove, null);
    };

    this.DecreaseValueByStep = function (sliderID) {
        var options = optionsBySlider[sliderID];

        if (options.min < options.value)
            ChangeValueTo(sliderID, Math.max(options.value - options.step, options.min));
    };

    this.IncreaseValueByStep = function (sliderID) {
        var options = optionsBySlider[sliderID];

        if (options.value < options.max)
            ChangeValueTo(sliderID, Math.min(options.value + options.step, options.max));
    };

    function CancelEvent(e) {
        //  both needed?
        if (e.stopPropagation)
            e.stopPropagation();
        if (e.preventDefault)
            e.preventDefault();
        return false;
    }

    this.RestoreValue = function (e, sliderID) {
        ChangeValueTo(sliderID, optionsBySlider[sliderID].originalValue);
    };

    this.RestoreAllValues = function () {
        for (var sliderID in optionsBySlider) {
            ChangeValueTo(sliderID, optionsBySlider[sliderID].originalValue);
        }
    };

    //  init the left adjust to half the difference between the browser's client area and the body width.
    //  this is a hack because the test drive demos' body element is centered with the html element and
    //  this appears to be the best "same markup" way to adjust for this.
    function getLeftAdjust(relativeTo) {

        var leftAdjust = 0; // Math.floor((window.innerWidth - document.body.offsetWidth) / 2);
        for (var offsetElement = relativeTo; offsetElement != null; offsetElement = offsetElement.offsetParent) {
            leftAdjust += offsetElement.offsetLeft;
        }
        return leftAdjust;
    }

    this.ScaleClick = function (e, sliderID) {
        var options = optionsBySlider[sliderID];

        var leftAdjust = getLeftAdjust(options.sliderScaleCell);
        var range = options.sliderScale.offsetWidth;
        var posx = Math.max(0, Math.min(range, e.pageX - (6) /* sliderScaleCell padding-left */ - leftAdjust));
        var newValue = options.min + posx / (range / (options.max - options.min));

        if (options.animateclick && Math.abs(newValue - options.value) > options.step) {
            var aniStep = Math.abs(newValue - options.value) / 20;
            aniStep = Math.round(aniStep * (1 / options.step)) / (1 / options.step);
            if (aniStep == 0)
                aniStep = options.step;

            function animateTowardNewValue() {
                if (options.value < newValue - aniStep)
                    ChangeValueTo(sliderID, options.value + aniStep);
                else if (options.value > newValue + aniStep)
                    ChangeValueTo(sliderID, options.value - aniStep);

                if (Math.abs(newValue - options.value) > aniStep) {
                    if (window.msRequestAnimationFrame)
                        window.msRequestAnimationFrame(animateTowardNewValue);
                    else
                        setTimeout(animateTowardNewValue, Math.floor(1000 / 60));
                } else
                    ChangeValueTo(sliderID, newValue);
            }

            animateTowardNewValue();
        }
        else {
            ChangeValueTo(sliderID, newValue);
        }

        return CancelEvent(e);
    };

    function pointerMove(target, pointerId, x, y) {
        var sliderID = target.getAttribute("mySlider");
        var options = optionsBySlider[sliderID];
        var range = options.sliderScale.offsetWidth;
        var posx = Math.max(0, Math.min(range, x - (6) /* sliderScaleCell padding-left */));
        var newValue = options.min + posx / (range / (options.max - options.min));
        ChangeValueTo(sliderID, newValue);
    }

    this.KeyThumb = function (e, sliderID) {
        if (e.keyCode == 38 || e.keyCode == 39) {
            this.IncreaseValueByStep(sliderID);  // up or right
        }
        else if (e.keyCode == 40 || e.keyCode == 37) {
            this.DecreaseValueByStep(sliderID);  // down or left
        }

        if (e.charCode == '\t') // or keyCode == 9
            return true;

        return CancelEvent(e);
    };

    this.IncreaseOrDecrease = function () {
        //  dummy function for use in thumb's href
        return;
    };

    this.setValue = function (sliderID, newValue, /*bool*/setInitial) {

        if (typeof newValue == 'string') {
            var options = optionsBySlider[sliderID];

            var m = newValue.match(new RegExp("^[\\+\\-]?(\\d*(\\.\\d*)?)" + options.units + "$"));
            if (m != null) {
                newValue = parseFloat(m[1]);
            }
            else {
                for (var i = 0; i < options.values.length; ++i) {
                    if (options.values[i] == newValue) {
                        newValue = i;
                        break;
                    }
                }
            }
        }

        ChangeValueTo(sliderID, newValue);

        if (setInitial)
            optionsBySlider[sliderID].originalValue = optionsBySlider[sliderID].value;
    };

    function RoundToStep(options, newValue) {
        return Math.round(newValue * (1 / options.step)) / (1 / options.step);
    }

    function ChangeValueTo(sliderID, newValue) {
        var options = optionsBySlider[sliderID];

        newValue = Math.max(options.min, Math.min(options.max, newValue));
        options.value = RoundToStep(options, newValue);

        var stringValue = options.formattedValue();

        if (options.readoutElement)
            options.readoutElement.innerHTML = stringValue;

        UpdateSlider(sliderID);

        options.sliderControlElement.setAttribute("value", stringValue);

        if (options.setter && typeof window[options.setter] == 'function')
            window[options.setter](stringValue, options.sliderControlElement);
    }

    var widthsByGroupAndString = {};

    function InitReadout(sliderID) {
        var options = optionsBySlider[sliderID];

        var leftReadout = document.querySelectorAll("#" + sliderID + " div.sliderLeftReadout")[0];
        var rightReadout = document.querySelectorAll("#" + sliderID + " div.sliderRightReadout")[0];

        if (options.readout == "left") {
            options.readoutElement = leftReadout;
        }
        else {
            leftReadout.style.display = "none";
        }

        if (options.readout == "right") {
            options.readoutElement = rightReadout;
        }
        else {
            rightReadout.style.display = "none";
        }

        if (options.readoutElement) {
            var readout = options.readoutElement;

            var values = options.values.length > 0 ? options.values : [options.min, RoundToStep(options, options.min + options.step), options.value, RoundToStep(options, options.max - options.step), options.max];
            options.readoutWidth = 0;
            for (var i = 0; i < values.length; ++i) {
                var valueString = values[i].toString() + options.units;
                var valueStringWidthKey = options.readoutalign + '-' + valueString;

                if (typeof widthsByGroupAndString[valueStringWidthKey] == 'undefined') {
                    readout.innerHTML = valueString;
                    widthsByGroupAndString[valueStringWidthKey] = Math.ceil(readout.offsetWidth);
                }

                options.readoutWidth = Math.max(options.readoutWidth, widthsByGroupAndString[valueStringWidthKey]);
            }

            readout.style.width = options.readoutWidth.toString() + "px";
            readout.innerHTML = options.formattedValue();
        }
    }

    function AlignReadoutGroups() {
        var maxWidths = [];
        var i, options;

        for (i in optionsBySlider) {
            options = optionsBySlider[i];

            if (options.readoutElement) {
                maxWidths[options.readoutalign] = maxWidths[options.readoutalign] ? Math.max(maxWidths[options.readoutalign], options.readoutWidth) : options.readoutWidth;
            }
        }

        for (i in optionsBySlider) {
            options = optionsBySlider[i];

            if (options.readoutElement) {
                var maxWidthString = maxWidths[options.readoutalign].toString() + "px";

                if (options.readoutElement.style.width != maxWidthString)
                    options.readoutElement.style.width = maxWidthString;
            }
        }
    }

    function InitSlider(sliderID) {
        var options = optionsBySlider[sliderID];

        options.sliderScaleCell = document.querySelectorAll("#" + sliderID + " div.sliderScaleCell")[0];
        options.sliderScale = document.querySelectorAll("#" + sliderID + " div.sliderScale")[0];
        options.sliderThumbWrap = document.querySelectorAll("#" + sliderID + " a.sliderThumbWrap")[0];

        UpdateSlider(sliderID);
    }

    function UpdateSlider(sliderID) {
        var options = optionsBySlider[sliderID];
        var range = options.sliderScale.offsetWidth - 1;
        var newPosition = (options.value - options.min) * range / (options.max - options.min);
        //  the (6 - 4) represents the 6 pixels of spacing to the left of the scale and 4 pixels of black to the left of the indicator
        options.sliderThumbWrap.style.left = (newPosition - (6 - 4)).toString() + "px";

        //DebugLog("value = " + options.value + ", slider at " + slider.style.left);
    }

};

document.addEventListener("DOMContentLoaded", _Slider.init, false);
