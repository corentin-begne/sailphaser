var HomeManager;
(function(){
    "use strict";
    HomeManager = function () {
        this.avatars = ["piglet", "rabbit", "tigrou", "pooh"];
        this.avatarGroup;
        this.avatarChoice;
        this.init();
    };

    HomeManager.prototype.init = function() { 
        var that = this;         
        var timer;   
        var playContainer = $(".playContainer");
        var avatarContainer = $(".avatarContainer");

        playContainer.mousedown(hideCloud);
     //   $(document).mousemove(startTargetMouse);

        $(".mapContainer").fadeIn(2000);
        this.avatarChoice = new Phaser.Game(382, 131, Phaser.CANVAS, "avatarChoice", {
            preload:preload, 
            create:create, 
            update:update
        }, true);

        function preload(){
            that.avatars.forEach(addAvatarAsset);

            function addAvatarAsset(name){
                var path = "assets/"+name+"/";
                that.avatarChoice.load.json(name+"Animations", path+"animations.json");
                that.avatarChoice.load.atlasJSONHash(
                    name,
                    path+"sprite.png",
                    path+"sprite.json"
                );
            }
        }

        function create(){
            that.avatarGroup = that.avatarChoice.add.physicsGroup();
            that.avatars.forEach(addAvatar);

            function addAvatar(name){                
                var player = new Player(that.avatarChoice, name, null, that.avatarGroup);
                player.scale = {x:2, y:2};
                player.play('right');
                player.animations.stop();
                player.frame = player.animations.currentAnim._frames[0];
                player.inputEnabled = true;
                player.input.useHandCursor = true;
                player.events.onInputOver.add(animateAvatar, that.avatarChoice);
                player.events.onInputDown.add(playGame , that.avatarChoice);
                player.position.y = that.avatarChoice.height/2 - player.height/2;
                player.position.x = (that.avatarGroup.children.length-1)*85+55;

                function playGame(){
                    window.location.href = "/game/"+name;
                }

                function animateAvatar(){
                    var anims = ["right", "left"];
                    var i = 0;                    
                    that.avatarGroup.children.forEach(stopAnimation);
                    player.alpha = 0.8;
                    clearInterval(timer);
                    playAnimation();
                    timer = setInterval(playAnimation, 2000);

                    function playAnimation(){
                        player.animations.stop();
                        player.play(anims[i%2]);
                        i++;
                    }

                    function stopAnimation(groupPlayer){
                        groupPlayer.alpha = 1;
                        groupPlayer.animations.stop();
                        groupPlayer.frame = groupPlayer.animations.currentAnim._frames[0];
                    }
                }
            }
        }

        function update(){

        }

        function hideCloud(){
            $(this).fadeOut(500, showAvatars);

            function showAvatars(){
                var height = $(window).height()/2 + 65.5;
                avatarContainer.animate({
                    top: "+="+height
                }, {duration: 250});
            }
        }

        function startTargetMouse(event){
            var currentMousePos = {};
            var position = playContainer.offset();
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
            position.left += playContainer.width()/2;
            position.top += playContainer.height()/2;
            var deltaX = position.left - currentMousePos.x;
            var deltaY = position.top - currentMousePos.y;
            playContainer.stop();
            playContainer.animate({
                top: "-="+deltaY,
                left: "-="+deltaX
            },{
                duration: 1000
            });
        }
    };
})();