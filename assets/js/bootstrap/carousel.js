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
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    = null

    this.$indicators.prependTo(this.$element)

    this.setCaption(this.$active.data('caption'))
    this.updateCounter(this.$active)

    

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

    $("[data-slide='next']").click($.proxy(this.next, this))
    $("[data-slide='prev']").click($.proxy(this.prev, this))
  }

  Carousel.VERSION  = '3.3.2'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: false,
    pause: 'hover',
    wrap: true,
    keyboard: true,
    counterTimeout: 2000

  }

  Carousel.prototype.onSlide = function(e){
    var $target = $(e.relatedTarget)
    this.setCaption($target.data('caption'))
    this.updateCounter($target);
    this.showBigCounter();
  }

  Carousel.prototype.onSlid = function(e){
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

  Carousel.prototype.setCaption = function(text){
     this.$caption.text(text)
  }

  Carousel.prototype.updateCounter = function($target){
    var counter = this.getItemIndex($target) + 1; 
    this.$counter.text( counter.toString() + '/' +  this.$items.length.toString() )
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
      case 39: this.next(); break
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
