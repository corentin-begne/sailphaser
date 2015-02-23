var HomeManager;
(function(){
    "use strict";
    HomeManager = function () {
        this.init();
    };

    HomeManager.prototype.init = function() {
        $(".mapContainer").fadeIn(2000);
        $(document).mousemove(startTargetMouse);

        function startTargetMouse(event){
            var container = $(".playContainer");
            var currentMousePos = {};
            var position = container.offset();
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
            position.left += $(".playContainer").width()/2;
            position.top += $(".playContainer").height()/2;
            var deltaX = position.left - currentMousePos.x;
            var deltaY = position.top - currentMousePos.y;
            container.stop();
            container.animate({
                top: "-="+deltaY,
                left: "-="+deltaX
            },{
                duraiton: 1000
            });
        }
    };
})();