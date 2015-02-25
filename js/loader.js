$(window).load(function(){
    $('.loader').animate({opacity: 0}, 1000, function(){
        $('.loader').remove();
    });
});