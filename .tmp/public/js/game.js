/*global Phaser, CloudPlatform */
var JumperGame;
(function(){
    "use strict";
    JumperGame = function () {
        this.score = 0;
        this.scoreText;
        this.tweenX;
        this.tweenY;

        this.player = null;
        this.bots = [];
        this.platforms = null;
        this.sky = null;
        
        this.nbBot = 3;
        this.jumpkey;
        this.spriteScore;
        this.sprtieOver;

        this.cursors = null;
        this.avatars = ["piglet", "rabbit", "tigrou"];

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

            if (!player.locked && player.body.velocity.y > 0)
            {
                player.jumpCount = 0;
                player.locked = true;
                player.lockedTo = platform;
                platform.playerLocked = true; 

                player.body.velocity.y = 0;
                player.body.velocity.x = 0;
                if(!platform.touched){
                    this.score += 10;
                    this.scoreText.text = 'Score: ' + this.score;
                    platform.touched = true;
                    this.createLinePlatform();
                }

                if(!player.started) {
                    player.started = true;                    
                }
            }            

        },

        preRender: function () {

            if (this.game.paused)
            {
                //  Because preRender still runs even if your game pauses!
                return;
            }
            if(this.player){
                this.player.lock();
                this.bots.forEach(lockBot);
            }

            function lockBot(bot){
                bot.lock();
            }

        },
        preload: function(){
            var that = this;

            this.load.image("trees", "assets/tiles/trees.png");
            this.load.image("clouds", "assets/tiles/clouds.png");
            this.load.image("platform", "assets/platforms/cloud.png");
            that.load.json("platformAnimations", "assets/platforms/animations.json");

            this.avatars.forEach(addAvatarAsset);

            function addAvatarAsset(name){
                var path = "assets/"+name+"/";
                that.load.json(name+"Animations", path+"animations.json");
                that.load.atlasJSONHash(
                    name,
                    path+"sprite.png",
                    path+"sprite.json"
                );
            }
        },
        createLinePlatform: function(init){
            var minY = 182;
            var maxX = this.game.width/2-256;
            var x = this.rnd.between(0, maxX);
            var y = this.game.height*100-(minY*(Math.floor(this.platforms.children.length/2)+1));
            new CloudPlatform(this.game, x, y, "platform", this.platforms);
            new CloudPlatform(this.game, x+maxX, y, "platform", this.platforms);
        },
        create: function(){
            var that = this;      
            /** background */
            this.stage.backgroundColor = "#2f9acc";
            this.sky = this.add.tileSprite(0, 0, this.game.width, this.game.height, "clouds");
            this.sky.fixedToCamera = true;
            this.add.tileSprite(0, this.game.height*100-94, this.game.width, 94, 'trees');

            /** score interface */
            this.spriteScore = this.add.sprite(0,0);
            this.spriteScore.fixedToCamera = true;
            this.scoreText = this.add.text(5, 5, 'score: 0', { fontSize: '32px', fill: '#000' });
            this.spriteScore.addChild(this.scoreText);            

            /** init platforms */
            this.platforms = this.add.physicsGroup();
            this.createLinePlatform(true);


            this.player = new Player(this.game, "tigrou", this.platforms);
            // add bots
            for(var i=0; i<this.nbBot; i++){
                this.bots.push(new Player(this.game, this.avatars[this.rnd.between(0, this.avatars.length-1)], this.platforms));
                this.bots[this.bots.length-1].startIA();
            }


            this.camera.follow(this.player);

            /** inputs */
            this.cursors = this.input.keyboard.createCursorKeys();   
            this.jumpkey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);  
            this.jumpkey.onDown.add(this.player.jumpCheck.bind(this.player), this);                
        },
        loose: function(){
           /* this.platforms.callAll("stop");            
            game.paused = true;
            this.spriteOver = this.add.sprite(0,0);
            this.spriteOver.fixedToCamera = true;
            var text = this.add.text(this.game.width/2-190/2, this.game.height/2-16, 'GAME OVER', { fontSize: '32px', fill: '#000' });
            this.spriteOver.addChild(text);
            setTimeout(function(){
                game.state.clearCurrentState();
                game.state.start("Game", true, false);
                
            }, 2000);*/
        },
        shutdown: function(){
            this.player.destroy();
            this.score = 0;
            this.platforms.destroy();
            game.paused = false;
            this.spriteScore.destroy();
            this.spriteOver.destroy();
            this.started = false;
        },
        update: function() {
            var that = this;
            if(!this.game.paused){
                if(this.player.body.y === (this.game.height*100-this.player.height)){    
                  /*  if(this.started){
                        this.loose();
                    }*/
                    this.player.jumpCount = 0;
                }

                this.sky.tilePosition.y = -(this.camera.y * 0.7);

                this.physics.arcade.collide(this.player, this.platforms, this.customSep, null, this);
                this.bots.forEach(checkBotCollision);                                

                this.player.checkNavigation(this.cursors);
            }    

            function checkBotCollision(bot){
                that.physics.arcade.collide(bot, that.platforms, that.customSep, null, that);
            }
        }    
    };

})();
