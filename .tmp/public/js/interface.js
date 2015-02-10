/*global Phaser */
var Interface;
(function(){
    "use strict";
    Interface = function (game, key, group) {
        /** score interface */
        this.score = 0;

        var lastScore = (group.children.length > 0) ? group.getChildAt(group.children.length-1).interface : null;
        var margin = (group.children.length === 0) ? 0 : (lastScore.position.x+lastScore.scoreText.position.x+lastScore.scoreText.width)+50;
        Phaser.Sprite.call(this, game, margin, 5, "poohProfile");

        this.fixedToCamera = true;
        var fontSize = (group.children.length === 0) ? "bold 30px walt" : "bold 15px walt";
        this.scoreText = this.game.add.text(5+this.width, 5, 'Score: 0', { font: fontSize, fill: "#000" });
        this.addChild(this.scoreText);

        group.add(this);
        this.init();
    };

    Interface.prototype = Object.create(Phaser.Sprite.prototype);
    Interface.prototype.constructor = Interface;

    Interface.prototype.init = function(){
        var that = this;      
        $.each(this.game.cache.getJSON("poohProfileAnimations"), addAnimation);

        function addAnimation(key, animation){
            that.animations.add(key, animation.frames, animation.speed, animation.loop);
        }
        this.play("move");
    };
})(); 