/*global Phaser, JumperGame */
/*var game;
var platforms;
var player;
var cursors;
var stars;
var scoreText;
var score = 0;*/
var game;
(function(){
    "use strict";
    /** on document ready */
    $(document).ready(init);

    /**
     * @event main#initHome
     * @description Initialize home page
     */
    function init(){
        game = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, "game");
        game.state.add("Game", JumperGame, true);
    }
    
})();