/*global Phaser */
var CloudPlatform;
(function(){
    "use strict";
    CloudPlatform = function (game, x, y, key, group) {

        if (typeof group === "undefined") { group = game.world; }

        Phaser.Sprite.call(this, game, x, y, key);

        game.physics.arcade.enable(this);

        this.anchor.x = 0.5;

        this.body.customSeparateX = true;
        this.body.customSeparateY = true;
        this.body.allowGravity = false;
        this.body.immovable = true;        

        this.touched = [];

        group.add(this);

        /** init animations */
        var index = (group.children.length <= 2) ? game.cache.getJSON("platformAnimations")[0] : game.cache.getJSON("platformAnimations")[game.rnd.between(1, (game.cache.getJSON("platformAnimations").length-1))];
        this.addMotionPath(index);
        this.start();
    };

    CloudPlatform.prototype = Object.create(Phaser.Sprite.prototype);
    CloudPlatform.prototype.constructor = CloudPlatform;

    CloudPlatform.prototype.addMotionPath = function (motionPath) {

        this.tweenX = this.game.add.tween(this.body);
        this.tweenY = this.game.add.tween(this.body);

        for (var i = 0; i < motionPath.length; i++)
        {
            this.tweenX.to( { x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
            this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
        }

        this.tweenX.loop();
        this.tweenY.loop();

    };

    CloudPlatform.prototype.start = function () {

        this.tweenX.start();
        this.tweenY.start();

    };

    CloudPlatform.prototype.stop = function () {

        this.tweenX.stop();
        this.tweenY.stop();

    };
})(); 