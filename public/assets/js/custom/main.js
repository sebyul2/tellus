(function($, win) {
	'use strict';
	var _ = win.BlueHole.Util;

	if ('undefined' === typeof win.BlueHole.UI) win.BlueHole.UI = {};
	if ('undefined' === typeof win.BlueHole.UI.Main) win.BlueHole.UI.Main = {};

	win.BlueHole.UI.Main.TopBg = (function() {
		var defParams = {
				durTime : 1500, visual : '.visual', videoCnt : '._videoCnt',
				header : '#header', slideCnt : '._slideCnt'
		};
		return { 
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));

				this.tid = 0;
				this.header = this.container.find(this.opts.header);
				this.visual = this.container.find(this.opts.visual);
				this.videoCnt = this.visual.find(this.opts.videoCnt);
				this.slideCnt = this.visual.find(this.opts.slideCnt);
				this.lis = this.slideCnt.find('li');
				this.maxSeq = this.lis.size() - 1;
				this.lis.eq(1).css({ zIndex : -3 });
				this.lis.not(':eq(0),:eq(1)').css({ zIndex : -4 });
				$(win).on('orientationchange', $.proxy(this.orientationchange, this));
				
				this.videoRatio = {
					bMaxWidth : 1600, bMinWidth : 1100, maxHeight : 900, minHeight : 500
				};

				var tag = $('<script src="https://www.youtube.com/iframe_api"></script>');
				tag.insertBefore($('script').eq(0));				
				win.onYouTubeIframeAPIReady = $.proxy(this.onYouTubeIframeAPIReady, this);
									
				var orientation = $.event.special.orientationchange.orientation();
				this.orientationchange({ orientation : orientation });						
				this.resize();
				$(win).resize($.proxy(this.resize, this));
			},
			onYouTubeIframeAPIReady : function() {
				var vbmaxh = this.videoRatio.bMaxWidth, vbminh = this.videoRatio.bMinWidth,
				vmaxh = this.videoRatio.maxHeight, vminh = this.videoRatio.minHeight,
				ww = _.winWidth(), brw = Math.max(Math.min(ww, vbmaxh), vbminh),
				vh = Math.max(Math.min(vmaxh - ((vbmaxh - brw) / 2), vmaxh), vminh),
				vw = (16 * vh) / 9;

				if (vw < ww) {
					vh = (9 * ww) / 16;
					vw = (16 * vh) / 9;
				}

				// this.visual.height(vh);
				var videoId = this.videoCnt.data('src');
				this.mainPlayer = new win.YT.Player('mainVideoPlayer', {
					width : vw, height : vh, videoId : videoId,
					playerVars : {
						autoplay : 1, controls: 0, wmode : 'transparent', showinfo : 0
					},
					events : {
						onReady : $.proxy(this.onPlayerReady, this),
						onStateChange : $.proxy(this.onPlayerStateChange, this)
					}
				});
			},
			onPlayerReady : function(e) {
				var frm = $(e.target.getIframe());
				if ('mainVideoPlayer' === frm.attr('id')) this.mainPlayer.mute();
			},
			onPlayerStateChange : function(e) {
				var frm = $(e.target.getIframe());
				if (e.data === win.YT.PlayerState.ENDED) {
					if ('mainVideoPlayer' === frm.attr('id')) {
						this.mainPlayer.playVideo();
					}
				}
			},
			videoFit : function() {
				var vbmaxh = this.videoRatio.bMaxWidth, vbminh = this.videoRatio.bMinWidth,
				vmaxh = this.videoRatio.maxHeight, vminh = this.videoRatio.minHeight,
				ww = _.winWidth(), brw = Math.max(Math.min(ww, vbmaxh), vbminh),
				vh = Math.max(Math.min(vmaxh - ((vbmaxh - brw) / 2), vmaxh), vminh),
				rw = (16 * vh) / 9;

				if (rw < ww) {
					vh = (9 * ww) / 16;
					rw = (16 * vh) / 9;
				}

				this.visual.height(vh);
				this.videoCnt.find('#mainVideoPlayer').attr({
					width : rw, height : vh
				}).css({ 'margin-left' : -(rw / 2), 'margin-top' : -(vh / 2) });
			},
			resize : function(){
				var ww = _.winWidth();
				if (ww <= win.BlueHole.BASIS_WIN_SIZE) {					
					if (!this.tid) this.startTimer();
				}else{
					clearTimeout(this.tid);
					this.tid = 0;
					this.videoFit();
				}
			},
			orientationchange : function(e) {
				var brwh = Math.min(_.winHeight() - this.header.height(), 622),
				orientation = e.orientation;
				if ('portrait' != orientation) brwh = 450;

				this.visual.height(brwh);
			},
			startTimer : function() {
				var self = this;
				this.tid = setTimeout(function() {
					if (self.tid) {
						clearTimeout(self.tid);
						self.tid = 0;
					}

					var seq = self.lis.filter('.active').index();
					seq = Math.min(Math.max(seq, 0), self.maxSeq) + 1;
					if (self.maxSeq < seq) seq = 0;

					self.lis.eq(seq).addClass('active').css({ opacity : 0, display : 'block' })
					.animate({ opacity : 1, zIndex : 0 }, self.opts.durTime);

					self.lis.not(':eq(' + seq + ')').removeClass('active')
					.animate({ opacity : 0, zIndex : -1 }, self.opts.durTime);
					self.startTimer();
				}, 4500);
			}
		};
	})();
	
	win.BlueHole.UI.Main.Story = (function() {
		var defParams = { };
		return { 
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));

				this._sigletone();
				this.resize();
				$(win).resize($.proxy(this.resize, this));
			},
			_sigletone : function() {
				if (this.swiper) return this.swiper;

				var self = this;
				(function() {
					new win.Swiper('._story', {
						loop : true, slidesPerView : 1,					
						calculateHeight : true, pagination : '.pagination',
						onInit : function(swiper) {
							self.swiper = swiper;
						}
					});
				})();
				return this.swiper;
			},
			resize : function() {
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {
					if (this.swiper) this.swiper.reInit(true);
				}
			},
		};
	})();
	
	win.BlueHole.UI.Main.Game = (function() {
		var defParams = {
			wrap : '._game',
			layerWrap : '._layer', layer : '.detail_layer',
			next : '.btn_next', prev : '.btn_prev'
		};

		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				
				this.cnt = 2;
				this.perView = 3;
				this._sigletone();

				this.wrap = this.container.find(this.opts.wrap);
				this.slider = this.container.find('._slider');
				this.viewDetail = this.wrap.find('._viewDetail');
				this.viewDetail.click($.proxy(this.viewGameDetail, this));
				this.layerWrap = this.wrap.find(this.opts.layerWrap);
				this.layerWrap.find('._closeBtn').click($.proxy(this.closeGameDetail, this));
				this.layerWrap.hide();
				
				this.btnPrev = this.wrap.find(this.opts.prev);
				this.btnNext = this.wrap.find(this.opts.next);
				this.btnPrev.click($.proxy(this.prev, this));
				this.btnNext.click($.proxy(this.next, this));

				this.resize();
				$(win).resize($.proxy(this.resize, this));
			},
			_sigletone : function() {
				if (this.swiper) return this.swiper;
				var self = this;
				(function() {
					var w = _.winWidth(), params
					, slide_count = parseInt(self.opts.slide_count)+1;

					if (w <= win.BlueHole.BASIS_WIN_SIZE) {
						self.perView = 1;
						params = { slidesPerGroup : 1, slidesPerView : self.perView };
					} else if (w > win.BlueHole.BASIS_WIN_SIZE && w <= win.BlueHole.SECOND_BASIS_WIN_SIZE) {
						var cnt = 0;
						for(var i=0; i<slide_count; i++){
							var num = slide_count - i;
							if(num >= 2) cnt ++;
						}
						self.cnt = cnt;
						self.perView = 2;
						params = { slidesPerGroup : 1, slidesPerView : self.perView };
					} else {
						var cnt = 0;
						for(var i=0; i<slide_count; i++){
							var num = slide_count - i;
							if(num >= 3) cnt ++;
						}
						self.cnt = cnt;
						self.perView = 3;
						params = { slidesPerGroup : 1, slidesPerView : self.perView };
					}

					params.pagination = '.pagination2';
					params.paginationElement = 'button';
					params.paginationClickable = true;
					params.calculateHeight = true;
					params.onInit = function(swiper) {
						self.swiper = swiper;
						self.curIdx = swiper.activeIndex;
					};
					params.onSlideChangeEnd = function(swiper) {
						self.btnPrev.show();
						self.btnNext.show();
						
						if(swiper.activeIndex === 0){
							//disable left
							self.btnPrev.addClass('disabled');
							self.btnPrev.attr('disabled',true);
							if(self.btnNext.hasClass('disabled')){
								self.btnNext.removeClass('disabled');
								self.btnNext.attr('disabled',false);
							}
							
						}else if(swiper.activeIndex == self.cnt-1){
							//disable right
							self.btnNext.addClass('disabled');
							self.btnNext.attr('disabled',true);
							if(self.btnPrev.hasClass('disabled')){
								self.btnPrev.removeClass('disabled');
								self.btnPrev.attr('disabled',false);
							}
							
						}else{
							self.wrap.find('button').removeClass('disabled');
							self.wrap.find('button').attr('disabled',false);
						}
						
						self.curIdx = swiper.activeIndex;
						var seq = self.layerWrap.index(self.layerWrap.filter(':visible'));

						if(self.perView != 1){
							var page = swiper.activeIndex
							, preNum = 0 + page
							, nextNum = (self.perView-1) + page;
						
							if(seq == nextNum){
//								self.btnNext.addClass('disabled');
//								self.btnNext.attr('disabled',true);
								self.btnNext.hide();
									
							}else if(seq == preNum){
//								self.btnPrev.addClass('disabled');
//								self.btnPrev.attr('disabled',true);
								self.btnPrev.hide();
							}
						}
					};
					new win.Swiper(self.opts.wrap, params);
				})();
				return this.swiper;
			},
			viewGameDetail : function(e) {
				e.preventDefault();
				var tg = e.currentTarget, seq = this.viewDetail.index(tg);
				
				if(this.perView != 1){
					var page = this.curIdx
					, preNum = 0 + page
					, nextNum = (this.perView-1) + page;

					if(seq == nextNum){
//						this.btnNext.addClass('disabled');
//						this.btnNext.attr('disabled',true);
						this.btnNext.hide();
							
					}else if(seq == preNum){
//						this.btnPrev.addClass('disabled');
//						this.btnPrev.attr('disabled',true);
						this.btnPrev.hide();
					}
				}
				
				this.slider.removeClass('on');
				this.slider.eq(seq).addClass('on');
				this.layerWrap.filter(':visible').hide();
				this.layerWrap.eq(seq).show();
			},
			closeGameDetail : function(e) {
				e.preventDefault();
				
				if(this.perView != 1){
					var seq = this.layerWrap.index(this.layerWrap.filter(':visible'))
					, page = this.curIdx
					, preNum = 0 + page
					, nextNum = (this.perView-1) + page;

					if(seq == nextNum){
						this.btnNext.show();
					}else if(seq == preNum){
						if(page != 0){
							this.btnPrev.show();
						}
					}
				}

				this.layerWrap.hide();
			},
			prev : function() {
				if (this.swiper) {
					this.swiper.swipePrev();
				}
			},
			next : function() {
				if (this.swiper) {
					this.swiper.swipeNext();
				}
			},
			resize : function() {
				var w = _.winWidth(), params, self=this
				, slide_count = parseInt(self.opts.slide_count)+1;;

				if (w <= win.BlueHole.BASIS_WIN_SIZE) {
					self.perView = 1;
					params = {
						slidesPerGroup : 1, slidesPerView : self.perView, pagination : '.pagination2',
						paginationElement:'button', paginationClickable:true
					};
				} else if (w > win.BlueHole.BASIS_WIN_SIZE &&
						w <= win.BlueHole.SECOND_BASIS_WIN_SIZE) {
					var cnt = 0;
					for(var i=0; i<slide_count; i++){
						var num = slide_count - i;
						if(num >= 2) cnt ++;
					}
					
					self.cnt = cnt;
					self.perView = 2;
					params = { slidesPerGroup : 1, slidesPerView : self.perView };
				} else {
					var cnt = 0;
					for(var i=0; i<slide_count; i++){
						var num = slide_count - i;
						if(num >= 3) cnt ++;
					}
					
					self.cnt = cnt;
					self.perView = 3;
					params = { slidesPerGroup : 1, slidesPerView : self.perView };
				}
				
				params.onInit = function(swiper) {
					self.swiper = swiper;
					self.curIdx = swiper.activeIndex;
					
					if(swiper.activeIndex === 0){
						self.btnPrev.addClass('disabled');
						self.btnPrev.attr('disabled',true);
						if(self.btnNext.hasClass('disabled')){
							self.btnNext.removeClass('disabled');
							self.btnNext.attr('disabled',false);
						}
						
					}else if(swiper.activeIndex === self.cnt-1){
						//disable right
						self.btnNext.addClass('disabled');
						self.btnNext.attr('disabled',true);
						if(self.btnPrev.hasClass('disabled')){
							self.btnPrev.removeClass('disabled');
							self.btnPrev.attr('disabled',false);
						}
						
					}else{
						self.wrap.find('button').removeClass('disabled');
						self.wrap.find('button').attr('disabled',false);
					}
					
					
					var seq = self.layerWrap.index(self.layerWrap.filter(':visible'))
					, page = swiper.activeIndex
					, preNum = 0 + page
					, nextNum = (self.perView-1) + page;
										
					if(seq == nextNum){
						self.btnNext.addClass('disabled');
						self.btnNext.attr('disabled',true);
					}else if(seq == preNum){
						self.btnPrev.addClass('disabled');
						self.btnPrev.attr('disabled',true);
					}
				};
				params.onSlideChangeEnd = function(swiper) {
					self.btnPrev.show();
					self.btnNext.show();
					
					if(swiper.activeIndex === 0){
						//disable left
						self.btnPrev.addClass('disabled');
						self.btnPrev.attr('disabled',true);
						if(self.btnNext.hasClass('disabled')){
							self.btnNext.removeClass('disabled');
							self.btnNext.attr('disabled',false);
						}
						
					}else if(swiper.activeIndex === self.cnt-1){
						//disable right
						self.btnNext.addClass('disabled');
						self.btnNext.attr('disabled',true);
						if(self.btnPrev.hasClass('disabled')){
							self.btnPrev.removeClass('disabled');
							self.btnPrev.attr('disabled',false);
						}
						
					}else{
						self.wrap.find('button').removeClass('disabled');
						self.wrap.find('button').attr('disabled',false);
					}

					self.curIdx = swiper.activeIndex;
					var seq = self.layerWrap.index(self.layerWrap.filter(':visible'));
					if(self.perView != 1){
						var page = swiper.activeIndex
						, preNum = 0 + page
						, nextNum = (self.perView-1) + page;
						
						if(seq == nextNum){
							self.btnNext.hide();
								
						}else if(seq == preNum){
							self.btnPrev.hide();
						}
					}
				};
				
				if (self.swiper) {
					self.swiper.params = _.def(self.swiper.params, params);
					self.swiper.reInit(true);
					self.curIdx = self.swiper.activeIndex;
				}
			}
		};
	})();
	
	win.BlueHole.UI.Main.Recruit = (function() {
		var defParams = { wrap : '._recruitWrap', cnt : '._recruitCnt', prev : '._prev', next : '._next'};
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				this.wrap = this.container.find(this.opts.wrap);
				this.cnt = this.container.find(this.opts.cnt);
				this.prevBtn = this.wrap.find(this.opts.prev);
				this.nextBtn = this.wrap.find(this.opts.next);
				
				this._sigletone();
				
				$(win).resize($.proxy(this.resize, this));
				this.prevBtn.click($.proxy(this.prev, this));
				this.nextBtn.click($.proxy(this.next, this));
				this.resize();
			},
			prev : function(e){
				e.preventDefault();
				this.swiper.swipePrev();
			},
			next : function(e){
				e.preventDefault();
				this.swiper.swipeNext();
			},
			_sigletone : function(cb) {				
				if (this.swiper) return this.swiper;

				var self = this, w = _.winWidth(),
				perview = 4;
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {
					perview = 1;
				}else if (w > win.BlueHole.BASIS_WIN_SIZE &&
						w <= win.BlueHole.SECOND_BASIS_WIN_SIZE) {
					perview = 3;
				}
				
				self.swiper = new win.Swiper('._recruitCnt', {
					slidesPerView : perview,
					calculateHeight : true,
					pagination : '', preventLinks : true, 
					onInit : function(swiper) {
						self.swiper = swiper;

						var num = self.cnt.height() + parseInt(self.cnt.find('li').eq(0).css('margin-top'));
						self.cnt.find('.rec_infolst').height(num);
						
						if (cb && $.isFunction(cb)) cb();
					}
				});
			},
			resize : function() {
				var w = _.winWidth(), params = { slidesPerView : 4 }, self = this;
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {
					params = { slidesPerView : 1 };
					if (this.swiperInterview) this.swiperInterview.reInit(true);
				}else if (w > win.BlueHole.BASIS_WIN_SIZE &&
						w <= win.BlueHole.SECOND_BASIS_WIN_SIZE) {
					params = { slidesPerView : 3 };
				}
				
				params.onInit = function(swiper){
					var num = self.cnt.height() + parseInt(self.cnt.find('li').eq(0).css('margin-top'));
					self.cnt.find('.rec_infolst').height(num);
				};
				
				if (this.swiper) {
					this.swiper.params = _.def(this.swiper.params, params);
					this.swiper.reInit(true);
				}
			}
		};
	})();
	
	win.BlueHole.UI.Main.Comment = (function() {
		var defParams = {};
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				this._recruitInter();
				
				$(win).resize($.proxy(this.resize, this));
				this.resize();
			},
			_recruitInfo : function() {
				if (this.swiperInfo) return this.swiperInfo;

				var self = this;
				(function() {
					new win.Swiper('._rec_info', {
						loop : true, slidesPerView : 1,					
						calculateHeight : true, pagination : '.pagination4',
						onInit : function(swiper) {
							self.swiperInfo = swiper;
						}
					});
				})();
				return this.swiper;
			},
			_recruitInter : function() {
				if (this.swiperInterview) return this.swiperInterview;

				var self = this;
				(function() {
					new win.Swiper('._rec_intv', {
						loop : true, slidesPerView : 1,					
						calculateHeight : true, pagination : '.pagination3',
						onInit : function(swiper) {
							self.swiperInterview = swiper;
						}
					});
				})();
				return this.swiper;
			},			
			resize : function() {
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {
					if (this.swiperInterview) this.swiperInterview.reInit(true);
				}
			},
		};
	})();

	$(function() {
		var container = $('body');
		win.BlueHole.UI.Main.TopBg.init(container);
		win.BlueHole.UI.Main.Story.init(container);
		win.BlueHole.UI.Main.Recruit.init(container);
		win.BlueHole.UI.Main.Comment.init(container);
	});
})(jQuery, window);