/* ===========================================================================
 * etamina == animate
 *
 * @description
 * Etamina Audio Library. It can preload and play audio.
 * load this file before etamina.js
 *
 * @author minren 
 * ===========================================================================
 * 
 */

/**
 * @description
 *
 */
etamina.audio = (function () {



	var core = {
		MAX_SOUNDS:10,
		soundRedundancy:2,//每个声音重复加载的次数。频繁重复同一个声音时，增加冗余可以保持播放流畅。
		path:'',
		audioType:false,
		loadCount:0,
		itemsToLoadCount:0,
		itemsToLoad : new Array(),
		soundPool : new Array(),


		supportedAudioFormat : function(audio) {
			var returnExtension = "";
			if (audio.canPlayType("audio/ogg") =="probably" || audio.canPlayType("audio/ogg") == "maybe") {
				returnExtension = "ogg";
			} else if(audio.canPlayType("audio/wav") =="probably" || audio.canPlayType("audio/wav") == "maybe") {
				returnExtension = "wav";
			} else if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe") {
				returnExtension = "mp3";
			}
			
			return returnExtension;
			
		},

		init:function(params){
			params = params||{};
			if('path' in params){
				this.path = params.path;
			}
		},
		preload:function(sounds,redundancy,path){
			if(this.itemsToLoadCount>0){
				return;
			}

			if(etamina.format.isString(sounds)){
				this.preloadSound(sounds,redundancy,path);
				return;
			}
			else if(sounds.length>0){
				var fullname;
				for (var i = sounds.length - 1; i >= 0; i--) {

					var sound = sounds[i];
					
					redundancy = redundancy || this.soundRedundancy;
					path = path|| this.path;
					fullname = path+sound;
					var tempSound;
					for (var j = 0; j <redundancy; j++) {
						this.itemsToLoadCount++;
						tempSound = document.createElement("audio");
						if(!this.audioType){
							this.audioType = this.supportedAudioFormat(tempSound);
						}

						tempSound.setAttribute("src", fullname + "." + this.audioType);
						tempSound.addEventListener("canplaythrough",this.itemLoaded,false);
						document.body.appendChild(tempSound)
						this.itemsToLoad.push({name:sound, element:tempSound, type:this.audioType, played:false});
					};					
				};
			}
			


		},
		preloadSound:function(sound,redundancy,path){
			if(etamina.format.isString(sound)){
				this.preload([sound],redundancy,path);
				return;
			}
		},
		itemLoaded :  function (event) {
			//TODO：还要考虑加载失败的情况。
			var _audio = etamina.audio;
			_audio.loadCount++;
			if (_audio.loadCount >= _audio.itemsToLoadCount) {
				console.log('itemLoaded: total item is '+_audio.loadCount);
				for (var i = _audio.itemsToLoadCount - 1; i >= 0; i--) {
					item = _audio.itemsToLoad[i];
					item.element.removeEventListener("canplaythrough",_audio.itemLoaded,false);
					_audio.soundPool.push(item);
					_audio.itemsToLoad.splice(i,1);
				};
				_audio.itemsToLoadCount=0;
				_audio.loadCount = 0;
			}
		},
		playSound: function(sound,volume){
			volume = volume||1;

			var soundFound = false;
			var soundIndex = 0;
			var tempSound;
			var soundPool = this.soundPool;
			
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

	};
	return core;
}());