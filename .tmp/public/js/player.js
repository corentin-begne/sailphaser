/*global Phaser */
var Player;
(function(){
    "use strict";
    Player = function (game, avatar, platforms, group) {

        this._maxSpeedY = 300; // pixels/second
        this._maxSpeedX = 200; 
        this._acceleration = 1500; 
        this._drag = 800;        
        this._jumpSpeed = 1500;

        Phaser.Sprite.call(this, game, 0, game.world.height, avatar);
        this.game.physics.arcade.enable(this);

        this.anchor.x = 0.5
        this.body.collideWorldBounds = true;  
        this.body.maxVelocity.setTo(this._maxSpeedX, this._maxSpeedY); 
        this.body.drag.setTo(this._drag, 0);

        this.interface = new Interface(this.game, avatar, group);
        
        this.platforms = platforms;
        this.avatar = avatar;
        this.jumpCount = 0;
        this.wasLocked = false;
        this.locked = false;
        this.lockedTo = null;   
        this.hit = false;  
        this.targetPlatform = null;   
        this.facing = "left";
        this.started = false;
        this.position.x = this.game.rnd.between(0, this.game.width-this.width);
        group.add(this);
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
        if(that.hit){
            requestAnimationFrame(that.startIA.bind(that));
            return false;
        }
        if (that.locked)
        {
            that.checkLock();
        }
        if(that.body.y === (that.game.world.height-that.height) || that.locked){
            that.jumpCount = 0;
            that.targetPlatform = null;
        }        
        setTimeout(jumpOnCloud, this.game.rnd.between(250, 500));

        function jumpOnCloud(){

            if(that.targetPlatform === null){
                var nb = Math.floor((that.game.world.height-that.body.y-that.height)/182);
                if(that.platforms.children[nb] === undefined || that.platforms.children[nb+1] === undefined){
                    nb = that.platforms.children.length-2;
                }
                if(that.body.x >= that.game.width/2){
                    nb ++;
                }
                if(that.locked && that.lockedTo !== null){
                    nb = that.platforms.getChildIndex(that.lockedTo)+2;
                }
                that.targetPlatform = that.platforms.children[nb];
            }    
            var deltaX = -(that.body.x-that.targetPlatform.body.x-that.width/2);
            if(that.targetPlatform.body.x > that.body.x){
                deltaX = that.targetPlatform.body.x+that.width/2-that.body.x;
            }
            deltaX = Math.floor(deltaX);
            if(deltaX < -10){
                that.play("left");
                that.facing = "left";
                that.body.acceleration.x = (deltaX > -10) ? deltaX : -that._acceleration; 
            }else if(deltaX > 10){
                that.play("right");
                that.facing = "right";
                that.body.acceleration.x = (deltaX < 10) ? deltaX : that._acceleration; 
            }else{
                if (that.facing !== "idle"){
                    that.animations.stop();
                    that.frame = that.animations.currentAnim._frames[0];
                    that.facing = "idle";                    
                }
                that.body.velocity.x = 0; 
                that.body.acceleration.x = 0;
            }
            
            that.jumpCheck();
            requestAnimationFrame(that.startIA.bind(that));
        }       
    };

    Player.prototype.jump = function(){

        if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
        {
            //  If the platform is moving up we add its acceleration to the players jump
            this.body.velocity.y = -this._jumpSpeed + (this.lockedTo.deltaY * 10);
        }
        else
        {
            this.body.velocity.y = -this._jumpSpeed;
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
        if (this.lockedTo && (this.body.right < this.lockedTo.body.x || this.body.x > this.lockedTo.body.right))
        {
            this.cancelLock();
        }

    };    

    Player.prototype.cancelLock = function () {

        this.wasLocked = true;
        this.locked = false;

    };     

    Player.prototype.checkNavigation = function (inputs) {

        this.body.acceleration.x = 0;

        if(this.hit){
            return false;
        }
        if (inputs.left.isDown)
        {
            this.body.acceleration.x = -this._acceleration;

            if (this.facing !== "left")
            {
                this.play("left");
                this.facing = "left";
            }
        }
        else if (inputs.right.isDown)
        {
            this.body.acceleration.x = this._acceleration;

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