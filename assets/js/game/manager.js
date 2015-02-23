/*global Phaser, CloudPlatform */
var JumperGame;
(function(){
    "use strict";
    JumperGame = function () {
        this._gravity = 300;
        this._worldSize = 1000;

        this.players = null;
        this.bots = [];
        this.platforms = null;
        this.sky = null;
        
        this.nbBot = 2;
        this.jumpkey;

        this.cursors = null;
        this.avatars = ["piglet", "rabbit", "tigrou", "pooh"];
        this.botAvatars = ["piglet", "rabbit", "tigrou"];
    };

    JumperGame.prototype = {

        init: function(){

            this.game.renderer.renderSession.roundPixels = true;

            this.world.resize(this.game.width, this.game.height*this._worldSize);

            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.physics.arcade.gravity.y = this._gravity;
            this.physics.arcade.skipQuadTree = false;

        },
        customSep: function (player, platform) {

            if (!player.hit && !player.locked && player.body.velocity.y > 0 && (player.body.y-player.height) <= platform.body.y)
            {
                player.jumpCount = 0;
                player.locked = true;
                player.lockedTo = platform;
                player.targetPlatform = null;

                player.body.velocity.y = 0;
                player.body.acceleration.x = 0;
                if(platform.touched[this.players.getChildIndex(player)] === undefined){
                    player.interface.score += 10;
                    if(platform.touched.length === 0){
                        player.interface.score += 10;
                    }
                    player.interface.scoreText.text = "Score: " + player.interface.score;
                    platform.touched[this.players.getChildIndex(player)] = true;
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
                /** profile */
                that.load.atlasJSONHash(
                    name+"Profile",
                    path+"profile/sprite.png",
                    path+"profile/sprite.json"
                );
                that.load.json(name+"ProfileAnimations", path+"profile/animations.json");
            }
        },
        createLinePlatform: function(init){
            // platform 128 * 32
            var minY = 182;
            var maxX = this.game.width/2-128;
            var x = this.rnd.between(0, maxX);
            var y = this.game.world.height-(minY*(Math.floor(this.platforms.children.length/2)+1));
            new CloudPlatform(this.game, x, y, "platform", this.platforms);
            x = this.rnd.between(this.game.width/2, this.game.width-128);
            new CloudPlatform(this.game, x, y, "platform", this.platforms);
        },
        create: function(){
            var that = this;      
            /** background */
            this.stage.backgroundColor = "#2f9acc";
            this.sky = this.add.tileSprite(0, 0, this.game.width, this.game.height, "clouds");
            this.sky.fixedToCamera = true;
            this.add.tileSprite(0, this.game.world.height-94, this.game.width, 94, 'trees');                        

            /** init platforms */
            this.platforms = this.add.physicsGroup();
            this.createLinePlatform(true);

            /** init players */
            this.players = this.add.physicsGroup();
            this.player = new Player(this.game, "pooh", this.platforms, this.players);
            // add bots
            this.botAvatars.forEach(addBot);
            function addBot(avatar){
                that.bots.push(new Player(that.game, avatar, that.platforms, that.players));
                requestAnimationFrame(that.bots[that.bots.length-1].startIA.bind(that.bots[that.bots.length-1]));
            }


            this.camera.follow(this.player);

            /** inputs */
            this.cursors = this.input.keyboard.createCursorKeys();   
            this.jumpkey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);  
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
                if(this.player.body.y === (this.game.world.height-this.player.height)){    
                  /*  if(this.started){
                        this.loose();
                    }*/
                    this.player.jumpCount = 0;
                }

                this.sky.tilePosition.y = -(this.camera.y * 0.7);

                this.physics.arcade.collide(this.player, this.platforms, this.customSep, null, this);
                for(var i=0; i<this.bots.length; i++){
                    this.physics.arcade.collide(this.bots[i], this.platforms, this.customSep, null, this);
                    this.physics.arcade.collide(this.bots[i], this.player, this.hit, null, this);
                    for(var j=i-1; j>=0; j--){
                        this.physics.arcade.collide(this.bots[i], this.bots[j], this.hit, null, this);
                    }
                }
                this.player.checkNavigation(this.cursors);
            }    

        },
        hit: function(player, bot){
            if(bot.hit || player.hit){
                return false;
            }

            var target = (player.body.y < bot.body.y) ? bot : player;

            target.hit = true;
            target.body.acceleration.x = 0;
            target.animations.stop();
            target.scale.y = 0.3;
            target.locked = false;
            target.wasLocked = false;
            target.lockedTo = null;
            var i = 0 ;
            var timer = setInterval(dying, 250);

            function dying(){
                if(i === 10){
                    clearInterval(timer);
                    target.hit = false;
                    target.alpha = 1;
                    target.scale.y = 3;
                    return false;
                }
                target.body.acceleration.x = 0;
                target.body.velocity.x = 0;
                target.animations.stop();
                target.body.velocity.y = 300;
                target.alpha = Math.abs(target.alpha - 1);
                i++;
            }
        }    
    };

})();
