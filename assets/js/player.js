/*global Phaser */
var Player;
(function(){
    "use strict";
    Player = function (game, avatar, platforms) {

        Phaser.Sprite.call(this, game, 0, game.height*100, avatar);
        game.physics.arcade.enable(this);

        this.body.collideWorldBounds = true;   
        
        this.platforms = platforms;
        this.avatar = avatar;
        this.jumpCount = 0;
        this.wasLocked = false;
        this.locked = false;
        this.lockedTo = null;        
        this.facing = "left";
        this.started = false;
        this.position.x = this.game.rnd.between(0, this.game.width-this.width);
        game.world.add(this);
        this.init();
    };

    Player.prototype = Object.create(Phaser.Sprite.prototype);
    Player.prototype.constructor = Player;

    Player.prototype.init = function(){
        var that = this;      
        $.each(this.game.cache.getJSON(this.avatar+"Animations"), addAnimation);

        function addAnimation(key, animation){
            that.animations.add(key, animation.frames, animation.speed, animation.loop);
        }
    };

    Player.prototype.startIA = function(){
        var that = this;
        if (this.locked)
        {
            this.checkLock();
        }
        if(this.body.y === (this.game.height*100-this.height) || this.locked){
            this.jumpCount = 0;
        }
        this.animations.stop();
       /* if (this.jumpCount > 2){
            setTimeout(this.startIA.bind(this), 1000);
            return false;
        }*/
        setTimeout(jumpOnCloud, this.game.rnd.between(0, 1000));

        function jumpOnCloud(){
            var nb = that.platforms.children.length-2;
            if(that.body.x >= that.game.width/2){
                nb +=1;
            }
            var platform = that.platforms.children[nb];
            var deltaX = (platform.body.x+platform.width/2)-that.body.x;
            if(deltaX < 0){
                that.play("left");
            }else{
                that.play("right");
            }
            that.body.velocity.x = Math.floor(deltaX);
            if (platform.body.y < that.body.y){
                that.jumpCheck();
            }
            that.startIA();
        }       
    };

    Player.prototype.jump = function(){

        if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
        {
            //  If the platform is moving up we add its velocity to the players jump
            this.body.velocity.y = -300 + (this.lockedTo.deltaY * 10);
        }
        else
        {
            this.body.velocity.y = -300;
        }

    };

    Player.prototype.lock = function () {

        if (this.lockedTo && (this.locked || this.wasLocked))
        {
            this.x += this.lockedTo.deltaX;
            this.y = this.lockedTo.y - this.height;            
        }

        if (this.wasLocked)
        {
            this.wasLocked = false;
            this.lockedTo.playerLocked = false;
            this.lockedTo = null;            
        }

    };

    Player.prototype.jumpCheck = function () {
        if (this.locked){
            this.cancelLock();
        }
        if (this.jumpCount < 2){
          this.jump();
          this.jumpCount ++;
       }

    };

    Player.prototype.checkLock = function () {

        this.body.velocity.y = 0;

        //  If the player has walked off either side of the platform then they're no longer locked to it
        if (this.body.right < this.lockedTo.body.x || this.body.x > this.lockedTo.body.right)
        {
            this.cancelLock();
        }

    };    

    Player.prototype.cancelLock = function () {

        this.wasLocked = true;
        this.locked = false;

    };     

    Player.prototype.checkNavigation = function (inputs) {

        this.body.velocity.x = 0;

        if (inputs.left.isDown)
        {
            this.body.velocity.x = -150;

            if (this.facing !== "left")
            {
                this.play("left");
                this.facing = "left";
            }
        }
        else if (inputs.right.isDown)
        {
            this.body.velocity.x = 150;

            if (this.facing !== "right")
            {
                this.play("right");
                this.facing = "right";
            }
        }
        else
        {
            if (this.facing !== "idle")
            {
                this.animations.stop();
                this.frame = this.animations.currentAnim._frames[0];
                this.facing = "idle";
            }
        } 

        if (this.locked)
        {
            this.checkLock();
        }

    };
})(); 