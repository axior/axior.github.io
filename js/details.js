$(window).load(function(){
    $("[data-toggle='details']").each(function(index, el){
        var $target = $($(this).data('target'));
        $target.find('overlay').hide();
    });
    $(document).on('click',"[data-toggle='details']",function(e){
        e.preventDefault();
        var $target = $($(this).data('target'));
        var $base = $.merge($target.find('.base'), $('.navbar-collapse .clearfix .base'));
        var $overlay = $.merge($target.find('.overlay'), $('.navbar-collapse .clearfix .overlay'));
      
        if($base.is(':visible')){
            $base.fadeOut(300, function(){
                $overlay.fadeIn(300);
            });
        }else{
            $overlay.fadeOut(300, function(){
                $base.fadeIn(300);
            });
        }
        

        

    });
});