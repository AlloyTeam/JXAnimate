/** ===========================================================================
 * @module JXAnimate.Audio
 * @description
 * Etamina Audio Library. It can preload and play audio.
 * load this file before etamina.js
 *
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @class JXAnimate.Audio
 * @description
 *
 */
Jx().$package("JXAnimate.Audio", function(J){

	var 
		MAX_SOUNDS=10,
		soundRedundancy = 2,//每个声音重复加载的次数。频繁重复同一个声音时，增加冗余可以保持播放流畅。
		path = '',
		audioType = false;

	var	loadCount = 0;
	var	itemsToLoadCount = 0,
		itemsToLoad = new Array(),
		soundPool = new Array();

	var onLoadProgressUpdated;


	var supportedAudioFormat = function(audio) {
		var returnExtension = "";
		if (audio.canPlayType("audio/ogg") =="probably" || audio.canPlayType("audio/ogg") == "maybe") {
			returnExtension = "ogg";
		} else if(audio.canPlayType("audio/wav") =="probably" || audio.canPlayType("audio/wav") == "maybe") {
			returnExtension = "wav";
		} else if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe") {
			returnExtension = "mp3";
		}
		
		return returnExtension;
		
	};

	var onItemLoaded = function(event){
		if(J.isFunction(onLoadProgressUpdated)){
			onLoadProgressUpdated(event);
		}
	}
	var itemLoaded =  function (event) {
		//TODO：还要考虑加载失败的情况。
		//var _audio = etamina.audio;
		loadCount++;
		//raise 
		onItemLoaded(J.extend(event,{'loadCount':loadCount,'itemsToLoadCount':itemsToLoadCount}));
		var item;
		if (loadCount >= itemsToLoadCount) {
			console.log('itemLoaded: total item is '+loadCount);
			for (var i = itemsToLoadCount - 1; i >= 0; i--) {
				item = itemsToLoad[i];
				item.element.removeEventListener("canplaythrough",itemLoaded,false);
				soundPool.push(item);
				itemsToLoad.splice(i,1);
			};
			itemsToLoadCount=0;
			loadCount = 0;
		}
	}

	//添加一个事件，当声音加载进度更新时触发。
	this.addListenerForLoadProgressUpdated = function(func){
		onLoadProgressUpdated = func;
	};
	/**
	 * 获取当前浏览器所支持的音频文件格式
	 * @method getAudioType
	 * @param  {AudioElement} audio [HTML5中的audio元素]
	 * @return {string}       [所支持音频格式的扩展名，不包括"."]
	 *
	 */
	this.getAudioType = function(audio){
		if(!audioType){
			if(audio==null){
				return false;
			}
			audioType = supportedAudioFormat(audio);
			return audioType;
		}
		return audioType;
	};

	/**
	 * 初始化音频引擎
	 * @method init
	 * @param  {object} params 初始化参数（path：声音文件的默认路径）
	 * @return {void}        
	 */
	this.init=function(params){
		params = params||{};
		if(J.isObject(params) && 'path' in params){
			this.path = params.path;
		}
	};
	/**
	 * 预加载一个或多个声音
	 * @method preload
	 * @param  {Array} sounds     声音URL的字符串或字符串数组
	 * @param  {int} redundancy 每个声音的冗余数
	 * @param  {string} path       相对路径
	 * @return {void}
	 */
	this.preload=function(sounds,redundancy,path){
		if(itemsToLoadCount>0){
			return;
		}

		if(J.isString(sounds)){
			this.preloadSound(sounds,redundancy,path);
			return;
		}
		else if(J.isArray(sounds) && sounds.length>0){
			var fullname;
			for (var i = sounds.length - 1; i >= 0; i--) {

				var sound = sounds[i];
				
				redundancy = redundancy || soundRedundancy;
				path = path|| this.path;
				fullname = path+sound;
				var tempSound;
				for (var j = 0; j <redundancy; j++) {
					itemsToLoadCount++;
					tempSound = document.createElement("audio");

					tempSound.setAttribute("src", fullname + "." + this.getAudioType(tempSound));
					tempSound.addEventListener("canplaythrough",itemLoaded,false);
					document.body.appendChild(tempSound)
					itemsToLoad.push({name:sound, element:tempSound, type:this.getAudioType(), played:false});
				};					
			};
		}
	};

	/**
	 * 预加载一个声音文件
	 * @method preloadSound
	 * @param  {string} sound      声音文件URL
	 * @param  {int} redundancy 每个声音的冗余数
	 * @param  {string} path       相对路径
	 * @return {void}            
	 */
	this.preloadSound=function(sound,redundancy,path){
		if(J.isString(sound)){
			this.preload([sound],redundancy,path);
			return;
		}
	};

	/**
	 * 播放声音
	 * @method playSound
	 * @param  {string} sound  声音的文件名
	 * @param  {float} volume 音量,0到1之间
	 * @return {void}        
	 */
	this.playSound= function(sound,volume){
		volume = volume||1;

		var soundFound = false;
		var soundIndex = 0;
		var tempSound;
		//var soundPool = this.soundPool;
		
		if (soundPool.length > 0) {
			console.log('play:'+sound+',pool length='+soundPool.length)
			while (!soundFound && soundIndex < soundPool.length) {
			
				var tSound = soundPool[soundIndex];
				if ((tSound.element.ended || !tSound.played) && tSound.name == sound) {
					soundFound = true;
					tSound.played = true;
				} else {
					soundIndex++;
				}
		
			}
		}
		if (soundFound) {
			tempSound = soundPool[soundIndex].element;
			tempSound.volume = volume;
			tempSound.play();
			
		} else if (soundPool.length < this.MAX_SOUNDS){  //在运行时加载声音，可能会导致停顿。
			/*
			tempSound = document.createElement("audio");
			tempSound.setAttribute("src", sound + "." + this.audioType);
			tempSound.volume = volume;
			tempSound.play();
			soundPool.push({name:sound, element:tempSound, type:this.audioType, played:true});
			*/
		}
	}

});