/*global HomeManager */
var homeManager;
(function(){
    "use strict";
    /** on document ready */
    $(document).ready(init);

    /**
     * @event main#initHome
     * @description Initialize home page
     */
    function init(){
        homeManager = new HomeManager();
    }
    
})();