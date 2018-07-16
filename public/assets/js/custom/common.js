(function($, win) {
	'use strict';

	if ('undefined' === typeof win.BlueHole) win.BlueHole = {};
	if ('undefined' === typeof win.BlueHole.UI) win.BlueHole.UI = {};
	if ('undefined' === typeof win.BlueHole.Util) win.BlueHole.Util = {};

	var win_wh = null,
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty;

	win.BlueHole.BASIS_WIN_SIZE = 767;
	win.BlueHole.SECOND_BASIS_WIN_SIZE = 982;

	/**
	 * 유틸리티
	 */
	var _ = win.BlueHole.Util = {
		isNaN : function(num) {
			return ('number' === typeof num && num !== num);
		},
		isArray : function(arr) {
			return 'array' === $.type(arr);
		},
		def : function(org, src) {
			for (var prop in src) {
				if (!hasOwnProperty.call(src, prop)) continue;
				if ('object' === $.type(org[prop])) {
					org[prop] = (this.isArray(org[prop]) ? src[prop].slice(0) : this.def(org[prop], src[prop]));
				} else {
					org[prop] = src[prop];
				}
			}

			return org;
		},
		// 모바일 디바이스인지 검사
		isMobile : (function() {
			return !!('ontouchstart' in win || (win.DocumentTouch && doc instanceof win.DocumentTouch));
		})(),
		// 브라우저 디스플레이 영역 크기
		winSize : (function() {
			if (!win_wh) {
				// return win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;
				win_wh = {
					w : win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth,
					h : win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight
				};
			}
			return win_wh;
		})(),
		setCookie : function(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			var expires = 'expires=' + d.toGMTString();
			document.cookie = cname + '=' + cvalue + '; ' + expires;
		},
		getCookie : function(cname) {
			var name = cname + '=';
			var ca = document.cookie.split(';');
			for(var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') c = c.substring(1);
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length);
				}
			}
			return '';
		},
		winWidth : function() {
			return win.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		},
		winHeight : function() {
			return win.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		},
		hasFlash : function() {
			return (typeof navigator.plugins === 'undefined' || navigator.plugins.length === 0) ? !!(new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) : !!navigator.plugins['Shockwave Flash'];
		},
		openPop : function(url, w, h, name) {
			var pop = win.open(url, (name || '_blueholePopup'));
			if (pop && pop.focus) pop.focus();
			return pop;
		}
	};
	
	if ('undefined' === typeof win.BlueHole.Form) win.BlueHole.Form = {};
	win.BlueHole.Form.Csrf = (function() {
		var defParams = { trg : 'form', csrf : { name : '' } };
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				
				this.frm = this.container.find(this.opts.trg);
				this.csrf = this.frm.find('[name="' + this.opts.csrf.name + '"]');				
				this.container.on('getCsrf', $.proxy(this.get, this));
				this.container.on('changeCsrf', $.proxy(this.update, this));
			},
			get : function() {
				return { name : this.opts.csrf.name, value : this.csrf.val() };
			},
			update : function(e, csrfHash) {							
				this.csrf.val(csrfHash);
			}
		};
	})();
	
	win.BlueHole.UI.Gnb = (function() {
		var defParams = {
			head : '#header', content : '#content', openBtn : '._openGnb', closeBtn : '._closeGnb', gnb : '.gnb_area',
			menuCnt : '.menu', menu : '._depth1', submenu : '.submenu', engBtn : '._eng'
		};

		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				// mode : 1-pc, 2-mobile
				this.mode = 1;
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE) this.mode = 2;
				this.head = this.container.find(this.opts.head);
				this.content = this.container.find(this.opts.content);
//				this.content.css({'padding-top':this.head.innerHeight()});
				this.gnb = this.head.find(this.opts.gnb);
				
				this.engBtn = this.head.find(this.opts.engBtn);
				this.closeBtn = this.head.find(this.opts.closeBtn);
				this.openBtn = this.head.find(this.opts.openBtn);
				
				this.menuCnt = this.head.find(this.opts.menuCnt);
				this.menu = this.menuCnt.find(this.opts.menu);
				
				this.submenu = this.menu.find(this.opts.submenu);
				this.submenu_li = this.submenu.find('li');
				
				this.gnbType = this.gnb.data('type');
				this.depth1 = this.menu.filter('.on').index();
				this.depth2 = this.submenu_li.filter('.on').index();
				
				this.openBtn.click($.proxy(this.open, this));
				this.engBtn.click($.proxy(this.engBtnClick, this));
				this.closeBtn.click($.proxy(this.close_M, this));
				$(win).resize($.proxy(this.resize, this));
				$(win).scroll($.proxy(this.scroll, this));
				
				this.reset();
			},
			scroll : function(e) {
				var w = _.winWidth(), wst = $(win).scrollTop();
				
				if (w >= win.BlueHole.BASIS_WIN_SIZE) {
					if(wst > 0){
						this.head.addClass('scroll');
						if(this.gnbType != 'main'){
							var h = this.menuCnt.height() - this.menu.innerHeight();
							this.menuCnt.height(h);
						}
					}else{
						this.head.removeClass('scroll');
						if(this.gnbType != 'main' && this.depth1 >= 0){
							this.menu.eq(this.depth1).addClass('on');
							this.menu.eq(this.depth1).find('.submenu').show();
							this.menu.eq(this.depth1).find('li').eq(this.depth2).addClass('on');
						}
					}
//					this.content.css({'padding-top':this.head.innerHeight()});
				} 
			},
			reset : function(){
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE){
					this.gnb.find('.on').removeClass('on');
				}else{
					this.gnb.find("[data-hover='on']").addClass('on');
				}
			},
			resize : function() {
				if (_.winWidth() <= win.BlueHole.BASIS_WIN_SIZE) {
					this.mode = 2;

					var wh = _.winHeight();
					this.menuCnt.css({ overflow : 'scroll', height : wh - this.openBtn.height() });
				} else {
					this.mode = 1;
					this.menu.off('click').data('attach', false);
					this.submenu.off('click');
					
					this.menu.mouseenter($.proxy(this.openMenu_PC, this))
					.mouseleave($.proxy(this.close, this));
					
					this.submenu_li.mouseenter($.proxy(this.openMenuSub_PC, this))
					.mouseleave($.proxy(this.closeSub, this));
					this.menuCnt.css({ overflow : '', height : '' });
				}
				this.reset();
			},
			clickSubMenu : function(e) {
				e.stopPropagation();
			}, 
			openMenu_M : function(e) {
				var ct = $(e.currentTarget);

				if (ct.hasClass('_sub')) return;

				e.preventDefault();
				
				this.menu.removeClass('on');
				ct.addClass('on');
			},
			openMenu_PC : function(e) {
				if(this.mode == 2) return;
				var ct = $(e.currentTarget)
				, onClass = 'on'
				, sub = ct.find('.submenu');
				
				if (ct.hasClass('_sub')) return;
				
				e.preventDefault();
				this.menu.removeClass(onClass);
				ct.addClass(onClass);
			},
			openMenuSub_PC : function(e) {
				if(this.mode == 2) return;
				var ct = $(e.currentTarget), onClass = 'on'
				, submenu = ct.parents('.submenu')
				, idx = this.submenu.index(submenu);
				
				this.menu.eq(idx).addClass('on');
				this.submenu_li.removeClass(onClass);
				ct.addClass(onClass);
			},
			close : function(e) {
				if(this.mode == 2) return;
				var ct = $(e.currentTarget);
				var idx = this.menu.index(ct);
				this.menu.removeClass('on');

				if(this.gnbType != 'main'){
					this.menu.eq(this.depth1).addClass('on');
					this.menu.eq(this.depth1).find('li').eq(this.depth2).addClass('on');
				}
			},
			closeSub : function(e) {
				if(this.mode == 2) return;
				var ct = $(e.currentTarget)
				, submenu = ct.parents('.submenu')
				, idx = this.submenu.index(submenu);
				
				this.menu.eq(idx).addClass('on');
				this.submenu_li.removeClass('on');
			},
			open : function() {
				this.gnb.addClass('on');
				this.resize();			
				
				this.scrollTop = $(win).scrollTop();
				this.container.css('overflow', 'hidden');

				this.container.css({
					overflow : 'hidden',
					position :  'fixed', left : 0,
					right : 0, bottom : 0, top : -this.scrollTop
				});
			},			
			close_M : function(e) {
				e.preventDefault();
				this.gnb.removeClass('on');
				this.container.css('overflow', '');
				this.container.css({
					position : 'static', left : '',
					right : '', bottom : '', top : ''
				});

				$(win).scrollTop(this.scrollTop);
			},
			engBtnClick : function(e) {
				e.preventDefault();
				var ct = $(e.currentTarget);

				if(ct.hasClass('_dis')){
					alert('영문사이트는 준비중입니다.');
				}else if('undefined' != typeof ct.data('href') && ct.data('href') != ''){
					location.href=ct.data('href');
				}
			}
		};
	})();
	
	win.BlueHole.UI.GoTopBtn = (function() {
		var defParams = { trg : '.gotop' };

		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				this.topBtn = this.container.find(this.opts.trg);
				this.topBtn.click($.proxy(this.click, this));
				
				this.scroll();
				$(win).scroll($.proxy(this.scroll, this));
				$(win).resize($.proxy(this.scroll, this));
			},
			scroll : function() {
				var dh = $(document).height(),
				wh = _.winHeight(), wst = $(win).scrollTop();				
				if (wst <= Math.floor(wh / 10)) {
					return this.topBtn.hide();
				}
				
				var pcbt = $('#footer').outerHeight() + 20;
				var sb = dh - wh - wst;
				if (sb <= pcbt) {
					this.topBtn.css({ bottom : pcbt - sb });
				} else {
					this.topBtn.css({ bottom : 20 });
				}

				this.topBtn.show();
			},
			click : function(e) {
				e.preventDefault();
				if ($('html, body').is(':animated')) return;				
				$('html, body').animate({ scrollTop : 0 }, 900);
			}
		};
	})();
	
	
	win.BlueHole.UI.Resize = (function() {
		return {
			init : function() {
				this.header = $('#header');
				this.locaTab = $('._location');
				$(win).resize($.proxy(this.resize, this)).trigger('resize');
			},
			resize : function() {
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {					
					$('._dynaImgPc').css({ 'margin-left' : 0 });				
				} else if (w > win.BlueHole.BASIS_WIN_SIZE) {
					this.dynamicImage($('._dynaImgPc'));
				}

				this.locationTab(w);
				this.dynamicImage($('._dynaImg'));
			},
			dynamicImage : function(dynaImgs) {
				if (!dynaImgs || !dynaImgs.size()) return;				
				dynaImgs.each(function() {
					var _this = $(this), dw = _this.width();
					if (0 < dw) {
						_this.css({ 'margin-left' : -Math.floor(dw / 2) });
					} else {
						_this.error(function() {
							_this.width(0).hide();
						}).load(function() {
							dw = $(this).width();
							_this.css({ 'margin-left' : -Math.floor(dw / 2) });
						});
					}
				});
			},
			locationTab : function(width) {
				var prev = this.locaTab.find('.tab_prev'),
				next = this.locaTab.find('.tab_next'),
				basis = 3, wd = _.winWidth() / basis, 
				ul = this.locaTab.find('ul'), li = ul.find('>li'),
				size = li.size(), idx = li.filter('.on').index();

				prev.hide();
				next.hide();

				if (_.winWidth() >= win.BlueHole.BASIS_WIN_SIZE) {
					ul.css({ width : 980 });
					return li.css({ width : (100 / li.size())  + '%' });
				}

				if (2 === size) {
					return li.css({ width : '50%' });
				}

				li.width(wd);
				ul.width(wd * size);
				if (!prev.size() || basis >= size) return;

				if (idx >= basis - 1) prev.show();
				if (idx === (size - 1)) {
					next.hide();
					idx -= 1;
				} else if ((idx + 1) < size - 1) {
					next.show();
				}

				if (!prev.size() || basis >= size || 1 >= idx) return;				
				ul.width(wd * size).css({ left : (idx - 1) * -wd });					
			}
		};
	})();
	
	if ('undefined' === typeof win.BlueHole.Ajax) win.BlueHole.Ajax = {};
	win.BlueHole.Ajax.Tmpl = (function() {
		var defParams = { tmpl : '', target : '', callback : {} };
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				this.tmpl = this.container.find(this.opts.tmpl);
				this.target = this.container.find(this.opts.target);
			}
			, done : function(result) {
				var tmpl = this.tmpl.tmpl(result);
				tmpl.appendTo(this.target);
				if (this.opts.callback.done) {
					this.opts.callback.done(result);
				}
			}
			, get : function(actUrl, json) {
				$.ajax({
					url : actUrl, cache : false, data : (json || {})
				}).done($.proxy(this.done, this));
			}
		};
	});

	if ('undefined' === typeof win.BlueHole.UI.More) {
		win.BlueHole.UI.More = {};
	}

	if ('undefined' === typeof win.BlueHole.UI.More.Paging) {
		win.BlueHole.UI.More.Paging = {};
	}

	win.BlueHole.UI.More.Paging = (function() {
		var defParams = {
			more : '._more', tmpl : '._tmpl', target : '', isTargetClick : true
			, page : 'input[name="page"]', no : 'input[name="no"]'
			, rownum : 'input[name="rownum"]', signdate : 'input[name="signdate"]'
			, search : 'input[name="search"]', readyn : 'input[name="readyn"]'
			, sibling : '._sibling'
		};

		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				
				this.mode;
				var w = _.winWidth();
				if (w >= win.BlueHole.BASIS_WIN_SIZE) {
					this.mode = 'pc';
				}else{
					this.mode = 'm';
				}
				
				this.target = this.container.find(this.opts.target);
				this.more = this.container.find(this.opts.more);
				this.list = this.container.find(this.opts.list);
				this.empty = this.container.find(this.opts.empty);
				this.empty.hide();

				this.ajaxTmpl = win.BlueHole.Ajax.Tmpl();
				this.ajaxTmpl.init(this.container, {
					tmpl : this.opts.tmpl, target : this.opts.target
					, callback : {
						done : $.proxy(this.done, this)
					}
				});

				this.frm = this.container.find(this.opts.frm);
				this.sibling = this.frm.find(this.opts.sibling);

				this.page = this.frm.find(this.opts.page);
				this.no = this.frm.find(this.opts.no);
				this.signdate = this.frm.find(this.opts.signdate);
				this.rownum = this.frm.find(this.opts.rownum);
				this.search = this.frm.find(this.opts.search);
				this.readyn = this.frm.find(this.opts.readyn);
				
				this.more.click($.proxy(this.get, this));
				if (this.opts.isTargetClick) {
					this.target.click($.proxy(this.read, this));	
				}
				
				this.sibling.click($.proxy(this.readSibling, this));
				this.list.click($.proxy(this.goList, this));
				if(this.opts.resize) $(win).resize($.proxy(this.resize, this));
				return this;
			}
			, resize : function(e){
				var w = _.winWidth();
				if (w <= win.BlueHole.BASIS_WIN_SIZE) {					
					if(this.mode != 'm'){
						this.mode = 'm';
						this.get_reset();
					}				
				} else if (w > win.BlueHole.BASIS_WIN_SIZE) {
					if(this.mode != 'pc'){
						this.mode = 'pc';
						this.get_reset();
					}
				}
			}
			, done : function(result) {				
				if (!result || result.error) return; // 오류처리
				if (this.opts.callback && $.isFunction(this.opts.callback)) {
					this.opts.callback(result);
				}

				this.move(this.no.val());
				this.no.val('');
				this.readyn.val('');
				this.page.val(result.page);
				$(win).trigger('resize');

				if (!result.data.length && this.empty.size()) {
					this.target.hide();
					this.empty.show();
					this.more.data('all', 'Y').text(this.opts.more_empty_txt);
					return;
				}

				if (result.tPage === Number(result.page)) {
					this.more.hide();
				}
			}
			, JSONtoString : function(object) {
			    var results = [];
			    for (var property in object) {
			        var value = object[property];
			        if (value)
			            results.push(property.toString() + ': ' + value);
			        }
			                 
			        return '{' + results.join(', ') + '}';
			}
			, read : function(e) {
				var t = $(e.target);
				if (!t.is('._btn')) t = t.parents('._btn');
				if(!t.size()) return;
				
				e.preventDefault();
				var read = t, no = read.data('no') , rownum = read.data('rownum') , signdate = read.data('signdate'); 
				this.rownum.val(rownum);
				this.signdate.val(signdate);
				this.no.val(no);
				
				this.frm.attr('action', this.opts.action.read + '/' + no);
				this.frm.submit();
			}
			, readSibling : function(e) { // 이전/다음글
				e.preventDefault();
				var ct = $(e.currentTarget), no = ct.data('no');
				if (!no) return;
				
				this.no.val(no);			
				this.frm.attr('action', this.opts.action.read + '/' + no);
				this.frm.submit();
			}
			, goList : function(e) {
				if (e) e.preventDefault();
				this.frm.attr('action', this.opts.action.read);
				this.frm.submit();
			}
			, move : function(no) {
				if (!no) return;

				var target = this.container.find('#content_' + no);
				if (!target.size()) return;

				var st = target.offset().top;
				$('body').stop().animate({ 
					scrollTop : st
				}, 100, function() {
					
				});
			}
			, get : function() {				
				var actUrl = this.opts.action.more
				, search = this.search.val()
				, params = parseInt(this.page.val(), 10) + 1
				, self =  this;

				if (this.more.data('all')) {
					this.search.val('');
					this.page.val(1);
					return this.goList();
				}

				// 읽기 페이지 > 목록보기
				if ('Y' === this.readyn.val()) {
					actUrl = this.opts.action.list;
					params = this.no.val();
				}

				if (search) {					
					params = params + '/' + search;
				}
				
				this.ajaxTmpl.get(actUrl + '/' + params, { mode : self.mode});
			}
			, get_reset : function() {
				this.target.empty();
				this.page.val('1');
				
				var actUrl = this.opts.action.more
				, search = this.search.val()
				, params = parseInt(this.page.val(), 10)
				, self =  this;
				
				if (this.more.data('all')) {
					this.search.val('');
					this.page.val(1);
					return this.goList();
				}
				
				// 읽기 페이지 > 목록보기
				if ('Y' === this.readyn.val()) {
					actUrl = this.opts.action.list;
					params = this.no.val();
				}
				
				if (search) {					
					params = params + '/' + search;
				}
				
				this.ajaxTmpl.get(actUrl + '/' + params, { mode : self.mode});
			}
		};
	});

	win.BlueHole.UI.Sns = (function() {
		var defParams = { trg : '._snsBtn' };
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.container.on('clickSnsBtn', $.proxy(this.click, this));
				this.opts = _.def(defParams, (args || {}));				
				return this;
			},
			click : function(e, el) {
				var tg = $(el);
				if (!el || !tg.size()) return;

				this.sendSns(tg.data('type'), tg.data('url'), tg.data('title'));
			},
			sendSns : function(sns, url, txt) {
				if ('fb' === sns && win.FB) {
					win.FB.ui({
						method : 'feed', link : url, caption : txt, description : '\n'
					}, function(resp) {
						
					});
				} else if ('tw' === sns) {
					var url = 'http://twitter.com/intent/tweet?text=' + encodeURIComponent(txt) +
					'&url=' + encodeURIComponent(url);
					win.open(url, 'sns_share', 'left=100,top=100,width=600,height=580,scrollbars=0');
				}
			}
		};
	})();

	if ('undefined' === typeof win.BlueHole.UI.Recruit) win.BlueHole.UI.Recruit = {};
	win.BlueHole.UI.Recruit.Job = (function() {
		var defParams = {
				yearCnt : '._jobCnt', year : '._jobs', content : '.job_info', enb : 'on'
					, prev : '._prev', next : '._next'
		};
		
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				this.yearCnt = this.container.find(this.opts.yearCnt);
				this.years = this.yearCnt.find(this.opts.year);
				this.year_li = this.years.find('li');
				this.content = this.container.find(this.opts.content);
				this.prev = this.yearCnt.find(this.opts.prev);
				this.next = this.yearCnt.find(this.opts.next);
				this.prev.add(this.next).click($.proxy(this.move, this));
				
				this.total_w = 0;
				var self = this;
				this.year_li.each(function(i,v){
					self.total_w += $(v).innerWidth()+120;
				});

				this.years.width(this.total_w);
				if (!this.year_li.size()) return;
				this.year_li.click($.proxy(this.select, this));
				this.year_li.eq(0).trigger('click');
			},
			select : function(e) {
				var ct = e.currentTarget, idx = this.year_li.index(ct), self = this;
				this.year_li.filter('.' + this.opts.enb).removeClass(this.opts.enb);
				
				e.preventDefault();
				
				var lef_pos = 0;
				this.year_li.each(function(i,v){
					if(i < idx){
						lef_pos -= $(v).innerWidth()+120;
					}else if(i == idx){
						lef_pos -= $(v).innerWidth()/2;
					}
				});

				this.years.animate({
					'marginLeft' : lef_pos
				}
				, 500
				, function(){
					self.year_li.eq(idx).addClass(self.opts.enb);
					self.content.hide().eq(idx).show();
				});
			},
			move : function(e) {
				if (this.years.is(':animated')) return;
				var max = this.year_li.size();
				var ct = $(e.currentTarget), idx = this.year_li.filter('.' + this.opts.enb).index();
				idx += (ct.hasClass('_prev') ? -1 : 1);
				if (0 >= idx) idx = 0;
				if (idx > max) idx = max;
				
				this.prev.addClass('dis').attr('disabled', true);
				this.next.addClass('dis').attr('disabled', true);
				if (0 !== idx) this.prev.removeClass('dis').attr('disabled', false);
				if ((max - 1) !== idx) this.next.removeClass('dis').attr('disabled', false);
				
				this.year_li.eq(idx).trigger('click');
			}
		};
	})();

	win.BlueHole.UI.Slider = (function() {
		var defParams = {
			setSize : 4, container : '._sliderContainer',
			wrap : '._wrap', slider : 'li', prev : '.prev', next : '.next'
		};

		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));

				var sliderWrap = this.container.find(this.opts.container);

				this.step = 0;
				this.wrap = sliderWrap.find(this.opts.wrap);
				this.slider = this.wrap.find(this.opts.slider);
				this.prev = sliderWrap.find(this.opts.prev);
				this.next  = this.container.find(this.opts.next);
				this.imgs = this.wrap.find('a');
				this.bigImg = sliderWrap.find('.big > img');
				this.prev.add(this.next).click($.proxy(this.clickMove, this));
				this.prev.attr('disabled', true).addClass('dis');

				this.size = this.slider.size();
				this.maxStep = Math.ceil(this.size / this.opts.setSize) - 1;
				this.imgs.click($.proxy(this.click, this));
				this.imgs.eq(0).trigger('click');

				$(win).resize($.proxy(this.resize, this)).resize();
				return this;
			},
			resize : function() {
				var wd = this.slider.eq(this.size - 1).outerWidth(true),
				stwd = wd * this.size, pw = this.wrap.parent().outerWidth();
				this.wrap.width(stwd);
				
				// 레프트 재 조정 
				var left = this.opts.setSize * wd * this.step;
				if (left <= pw) left = 0;
				this.wrap.css({ left : -left });
				
				if (stwd <= pw) {
					this.prev.attr('disabled', true).addClass('dis');
					this.next.attr('disabled', true).addClass('dis');
				} else if (stwd > pw) {	
					if (0 < this.step) {
						this.prev.attr('disabled', false).removeClass('dis');
					}

					if (this.step < this.maxStep) {
						this.next.attr('disabled', false).removeClass('dis');
					}
				}
			},
			click : function(e) {
				e.preventDefault();
				var ct = $(e.currentTarget).find('img');
				this.bigImg.attr('src', ct.attr('src'));
			},
			clickMove : function(e) {
				var self = this, ct = $(e.currentTarget),
				isLeft = (ct.hasClass('prev') ? true : false),
				nextStep = self.step + (isLeft ? -1 : 1),
				wd = this.slider.outerWidth(true);

				if (this.wrap.is(':animated')) return;
				if (0 >= nextStep) nextStep = 0;
				if (self.maxStep <= nextStep) nextStep = self.maxStep;

				var left = this.opts.setSize * wd;				
				this.wrap.animate({ left : (isLeft ? '+=' : '-=') + left }, function() {
					self.step = nextStep;

					if (0 >= self.step) {
						self.prev.attr('disabled', true).addClass('dis');
					} else {
						self.prev.attr('disabled', false).removeClass('dis');
					}

					if (self.step >= self.maxStep) {
						self.next.attr('disabled', true).addClass('dis');
					} else {
						self.next.attr('disabled', false).removeClass('dis');
					}
				});
			}
		};
	})();
	
	win.BlueHole.UI.FamilySite = (function() {
		var defParams = {
				wrap : '.family_sites', btn : '._openFamily', option : '._option'
		};
		
		return {
			init : function(container, args) {
				if (!(this.container = container).size()) return;
				this.opts = _.def(defParams, (args || {}));
				
				var sliderWrap = this.container.find(this.opts.container);
				
				this.wrap = this.container.find(this.opts.wrap);
				this.btn = this.wrap.find(this.opts.btn);
				this.btn.click($.proxy(this.click, this));

				var self = this;
				this.wrap.find('.family_lst a').focusout(function() {
					self.wrap.removeClass('on');
				});

				$(document).click(function(e) {
					if (!$.contains(self.wrap.get(0), e.target)) {
						self.wrap.removeClass('on');
					}
				});
			},
			click : function(e) {
				e.preventDefault();
				this.wrap.addClass('on');
			}
		};
	})();
	
	$(function() {
		var body = $('body');
		win.BlueHole.UI.Gnb.init(body);
		win.BlueHole.UI.Resize.init(body);
		win.BlueHole.UI.GoTopBtn.init(body);
		win.BlueHole.UI.FamilySite.init(body);

		
	});
})(jQuery, window);