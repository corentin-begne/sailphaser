/*global Phaser, CloudPlatform */
var JumperGame;
(function(){
    "use strict";
    JumperGame = function () {
        this.width = $(window).width();
        this.height = $(window).height();
        this.score = 0;
        this.scoreText;

        this.player = null;
        this.platforms = null;
        this.sky = null;
        this.started = false;

        this.facing = "left";
        this.jumpTimer = 0;
        this.locked = false;
        this.lockedTo = null;
        this.wasLocked = false;
        this.willJump = false;
        this.spriteScore;
        this.sprtieOver;

        this.wasStanding = false;
        this.cursors = null;
        this.anims = [
            [
                { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+300", ySpeed: 2000, yEase: "Sine.easeIn" },
                { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-300", ySpeed: 2000, yEase: "Sine.easeOut" },
                { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-300", ySpeed: 2000, yEase: "Sine.easeOut" },
                { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+300", ySpeed: 2000, yEase: "Sine.easeIn" }
            ],
            [
                { x: "+300", xSpeed: 2000, xEase: "Sine.easeIn", y: "+0", ySpeed: 2000, yEase: "Linear" },
                { x: "-300", xSpeed: 2000, xEase: "Sine.easeOut", y: "-0", ySpeed: 2000, yEase: "Linear" },
                { x: "-300", xSpeed: 2000, xEase: "Sine.easeOut", y: "-0", ySpeed: 2000, yEase: "Linear" },
                { x: "+300", xSpeed: 2000, xEase: "Sine.easeIn", y: "+0", ySpeed: 2000, yEase: "Linear" }
            ]
        ];

    };

    JumperGame.prototype = {

        init: function(){

            this.game.renderer.renderSession.roundPixels = true;

            this.world.resize(this.game.width, this.game.height*100);

            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.physics.arcade.gravity.y = 300;
            this.physics.arcade.skipQuadTree = false;

        },
        customSep: function (player, platform) {

            if (!this.locked && player.body.velocity.y > 0)
            {
                this.locked = true;
                this.lockedTo = platform;
                platform.playerLocked = true;

                player.body.velocity.y = 0;
                if(!platform.touched){
                    this.score += 10;
                    this.scoreText.text = 'Score: ' + this.score;
                    platform.touched = true;
                }

                if(!this.started) {
                    this.started = true;                    
                }
            }            

        },

        checkLock: function () {

            this.player.body.velocity.y = 0;

            //  If the player has walked off either side of the platform then they're no longer locked to it
            if (this.player.body.right < this.lockedTo.body.x || this.player.body.x > this.lockedTo.body.right)
            {
                this.cancelLock();
            }

        },

        cancelLock: function () {

            this.wasLocked = true;
            this.locked = false;

        },
        preRender: function () {

            if (this.game.paused)
            {
                //  Because preRender still runs even if your game pauses!
                return;
            }

            if (this.locked || this.wasLocked)
            {
                this.player.x += this.lockedTo.deltaX;
                this.player.y = this.lockedTo.y - this.player.height;

                if (this.player.body.velocity.x !== 0)
                {
                    this.player.body.velocity.y = 0;
                }
            }

            if (this.willJump)
            {
                this.willJump = false;

                if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked)
                {
                    //  If the platform is moving up we add its velocity to the players jump
                    this.player.body.velocity.y = -300 + (this.lockedTo.deltaY * 10);
                }
                else
                {
                    this.player.body.velocity.y = -300;
                }

                this.jumpTimer = this.time.time + 750;
            }

            if (this.wasLocked)
            {
                this.wasLocked = false;
                this.lockedTo.playerLocked = false;
                this.lockedTo = null;
            }

        },
        preload: function(){
            //  We need this because the assets are on Amazon S3
            //  Remove the next 2 lines if running locally
            // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue003/';
            this.load.crossOrigin = "anonymous";

            this.load.image("trees", "assets/trees.png");
            this.load.image("clouds", "assets/clouds.png");
            this.load.image("platform", "assets/cloud-platform.png");
            //this.load.spritesheet("tigrou", "assets/tigrou2.png", 38.75, 62);
            this.game.load.atlasJSONHash(
                "tigrou",
                "assets/tigrou3.png",
                "assets/tigrou.json"
            );

            //  Note: Graphics are Copyright 2015 Photon Storm Ltd.
        },
        create: function(){

            this.stage.backgroundColor = "#2f9acc";
            
            this.sky = this.add.tileSprite(0, 0, this.game.width, this.game.height, "clouds");
            this.spriteScore = this.add.sprite(0,0);
            this.spriteScore.fixedToCamera = true;
            this.scoreText = this.add.text(5, 5, 'score: 0', { fontSize: '32px', fill: '#000' });
            this.spriteScore.addChild(this.scoreText);
        //    this.scoreText.fixedToCamera = true;
            this.sky.fixedToCamera = true;
            this.add.tileSprite(0, this.game.height*100-94, this.game.width, 94, 'trees');
         //   this.add.sprite(this.game.width, this.game.height*100, "trees");

            this.platforms = this.add.physicsGroup();

            var y = 150;
            var x = 0 ;
            var type = "platform";
            var platform;
            var max = this.game.height*100/y;

            for (var i = 0; i < max; i++){
                    var maxX = this.game.width/2-256;
                    x = this.rnd.between(0, maxX);
                 /*   this.platforms.create(x, y, type);
                    this.platforms.create(x+maxX/2, y, type);*/
               //     platform.scale = {x: this.rnd.between(0.00, 1.00), y: 1};
                 //   platform.x = ;
                    platform = new CloudPlatform(this.game, x, y, type, this.platforms);
                    //platform.scale = {x: 2, y: 2};
                    platform.addMotionPath(this.anims[this.rnd.between(0, 1)]);
                    platform = new CloudPlatform(this.game, x+maxX, y, type, this.platforms);
                    platform.addMotionPath(this.anims[this.rnd.between(0, 1)]);
                    //platform.scale = {x: 2, y: 2};
                    y+= 250;
            }

          /*  this.platforms.setAll("body.allowGravity", false);
            this.platforms.setAll("body.immovable", true);*/

            this.player = this.add.sprite(this.game.width/2, this.game.height*100, "tigrou");
          //  this.player.scale = {x: 3,y: 3};

            this.physics.arcade.enable(this.player);

            this.player.body.collideWorldBounds = true;
          //  this.player.body.setSize(20, 32, 5, 16);

            this.player.animations.add("right", ["0.png", "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"], 9, true);
            this.player.animations.add("left", ["8.png", "9.png", "10.png", "11.png", "12.png", "13.png", "14.png", "15.png"], 9, true);

            this.camera.follow(this.player);

            this.cursors = this.input.keyboard.createCursorKeys();
            this.platforms.callAll("start");
        },
        loose: function(){
            this.platforms.callAll("stop");            
            game.paused = true;
            this.spriteOver = this.add.sprite(0,0);
            this.spriteOver.fixedToCamera = true;
            var text = this.add.text(this.game.width/2-190/2, this.game.height/2-16, 'GAME OVER', { fontSize: '32px', fill: '#000' });
            this.spriteOver.addChild(text);
            setTimeout(function(){
                game.state.clearCurrentState();
                game.state.start("Game", true, false);
                
            }, 2000);
        },
        shutdown: function(){
            //this.game.world.destroy();
            this.player.destroy();
            this.score = 0;
            this.platforms.destroy();
            game.paused = false;
            this.spriteScore.destroy();
            this.spriteOver.destroy();
            this.started = false;
        },
        update: function() {
            if(!this.game.paused){
                if(this.started && this.player.body.y === (this.game.height*100-this.player.height)){    
                    this.loose();
                }
                this.sky.tilePosition.y = -(this.camera.y * 0.7);
               // this.trees.tilePosition.x = -(this.camera.x * 0.9);

                this.physics.arcade.collide(this.player, this.platforms, this.customSep, null, this);

                //  Do this AFTER the collide check, or we won't have blocked/touching set
                var standing = this.player.body.blocked.down || this.player.body.touching.down || this.locked;

                this.player.body.velocity.x = 0;

                if (this.cursors.left.isDown)
                {
                    this.player.body.velocity.x = -150;

                    if (this.facing !== "left")
                    {
                        this.player.play("left");
                        this.facing = "left";
                    }
                }
                else if (this.cursors.right.isDown)
                {
                    this.player.body.velocity.x = 150;

                    if (this.facing !== "right")
                    {
                        this.player.play("right");
                        this.facing = "right";
                    }
                }
                else
                {
                    if (this.facing !== "idle")
                    {
                        this.player.animations.stop();

                        if (this.facing === "left")
                        {
                            this.player.frame = 14;
                        }
                        else
                        {
                            this.player.frame = 0;
                        }


                        this.facing = "idle";
                    }
                } 
                if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer)
                {
                    if (this.locked)
                    {
                        this.cancelLock();
                    }

                    this.willJump = true;
                }

                if (this.locked)
                {
                    this.checkLock();
                }
            }    
        }    
    };

})();
