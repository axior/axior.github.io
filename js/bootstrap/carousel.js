/* ========================================================================
 * Bootstrap: carousel.js v3.3.2
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$items      = this.$element.find('.item')
    this.$indicators = this.createIndicators()
    this.$active     = this.$element.find('.item.active')
    this.$caption    = $('.carousel-caption-control')
    this.$counter    = $('.carousel-counter')
    this.lastMouseWheel = new Date()
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    = null

    this.$indicators.prependTo($('.indicators-container'))

    this.updateHeader(this.$active);
    this.setCaption(this.$active.data('caption'), true)
    this.updateCounter(this.$active)
    this.stretch()
    

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this));

    this.$element
      .on('slide.bs.carousel', $.proxy(this.onSlide, this))
      .on('slid.bs.carousel', $.proxy(this.onSlid, this))
      .on('swipeleft',$.proxy(this.prev, this))
      .on('swiperight',$.proxy(this.next, this));

    if(this.options.keyboard)
      $(window).keydown($.proxy(this.keydown, this))

    $(window).resize($.proxy(this.onResize, this));
    setInterval($.proxy(this.onResize, this), 500);
    $("[data-slide='next']").click($.proxy(this.next, this))
    $("[data-slide='prev']").click($.proxy(this.prev, this))

    $(window).on('mousewheel',$.proxy(this.onMouseWheel, this));
    $(window).on('hashchange',$.proxy(this.syncHash, this));

    if(window.location.hash.length == 0){
      window.location.hash = '1';
    }else{
      this.syncHash();
    }
  }

  Carousel.VERSION  = '3.3.2'

  Carousel.TRANSITION_DURATION = 700

  Carousel.DEFAULTS = {
    interval: false,
    pause: 'hover',
    wrap: true,
    keyboard: true,
    counterTimeout: 2000

  }

  Carousel.prototype.updateHeader = function($element){
    var html = $element.find('header').html();

    $('.navbar-collapse .clearfix').fadeOut(300, function(){
        $('.navbar-collapse .clearfix').html(html).fadeIn(300);
    });
  }

  Carousel.prototype.removeVerticalAnimation = function(){
    this.$element.find('.carousel-inner').removeClass('vertical-animation');
  }
  
  Carousel.prototype.onMouseWheel = function(ev){ 
      var e = ev.originalEvent;
      e.preventDefault();
      if( (new Date() - this.lastMouseWheel) > 500 ){
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        this.verticalSlide( delta == 1 ? 'prev' : 'next' );
        this.lastMouseWheel = new Date()
      }

  }  

  Carousel.prototype.onResize = function(ev){ 
      this.stretch();
      $('.carousel-counter.bigger').css({
        top: $('.carousel-inner').offset().top
      })

  }  

  Carousel.prototype.syncHash = function(ev){ 
      var index = parseInt(window.location.hash.slice(1)) -1;
      if( index && index != this.getItemIndex() )
        this.to(index);
  }


  Carousel.prototype.verticalSlide = function(type){
      this.$element.find('.carousel-inner').addClass('vertical-animation');
      type == 'prev' ? this.prev() : this.next();
      setTimeout($.proxy(this.removeVerticalAnimation, this),Carousel.TRANSITION_DURATION );
  }

  Carousel.prototype.stretch = function(){
    var height = $('.navbar-fixed-bottom').offset().top - this.$element.offset().top;
    this.$element.height(height);
    this.$element.find('.carousel-inner').height(height);
  }

  Carousel.prototype.onSlide = function(e){
    var $target = $(e.relatedTarget)
    this.setCaption($target.data('caption'))
    this.updateCounter($target);
    this.showBigCounter();
    this.updateHash($target);
    this.updateHeader($target);
  }

  Carousel.prototype.onSlid = function(e){
    var $target = $(e.relatedTarget);
    if($target.data('auto-details')){
      setTimeout(function(){
        $(".navbar-collapse [data-toggle='details']").click();
      }, 1500);
    }
  }
  Carousel.prototype.updateHash = function($target){
    var index = this.getItemIndex($target) + 1; 
    window.location.hash = index
  }


  Carousel.prototype.showBigCounter = function(){
    if(this.carouselCounterIsShowing){
      clearTimeout(this.carouselCounterTimeout);
    }else{
      $('.carousel-counter.bigger').fadeIn();
      this.carouselCounterIsShowing = true;
    }
    this.carouselCounterTimeout = setTimeout($.proxy(this.hideBigCounter, this), this.options.counterTimeout);
    
  }

  Carousel.prototype.hideBigCounter = function(){
    $('.carousel-counter.bigger').fadeOut();
    this.carouselCounterIsShowing = false;
  }

  Carousel.prototype.setCaption = function(text, nofade){
    if(!nofade){
     $('.caption').fadeOut(300, function(){
        $('.caption').text(text)
        $('.caption').fadeIn(300);
     });
    }else{
      $('.caption').text(text)
    }
     
  }

  Carousel.prototype.updateCounter = function($target){
    this.$counter.text( $target.data('slide-count') + '/' +  this.$items.last().data('slide-count') )
  }

  Carousel.prototype.createIndicators = function(){
    var $indicators = $('<ol>').addClass('carousel-indicators');
    var that = this;

    this.$items.each(function(index, element){
       $('<li>')
        .data('slide-to', index.toString())
        .data('target', '#'+ that.$element.attr('id'))
        .addClass(index == 0 ? 'active' : '')
        .click(function(){
           that.to(index);
        })
        .appendTo($indicators);
    });

    return $indicators;
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 38: this.verticalSlide('prev'); break
      case 39: this.next(); break
      case 40: this.verticalSlide('next'); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    if(!this.$items)
      this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }



  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);
