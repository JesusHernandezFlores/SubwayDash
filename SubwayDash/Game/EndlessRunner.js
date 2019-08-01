var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
var score = 0;
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Menu~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//This here is the Main Menu with its interface
var Menu = function(game) {};

Menu.prototype = 
{
	preload: function()
	{
		game.load.image('Menu', 'SubwayDash/Assets/Art/Screens/Menu.png');

		//Preload some sounds here because my computer is lame and didn't want to
		//encode my sounds to MP3 files so now I have to use WAV but WAV is too big and
		//increases load time
		game.load.audio('train', 'SubwayDash/Assets/Sound/SFX/Train.wav');
		game.load.audio('jump', 'SubwayDash/Assets/Sound/SFX/Jump.wav');
		game.load.audio('crash', 'SubwayDash/Assets/Sound/SFX/Crash.wav');
		game.load.audio('zoomDown', 'SubwayDash/Assets/Sound/SFX/ZoomDown.wav');
		game.load.audio('land', 'SubwayDash/Assets/Sound/SFX/Land.wav');
	},

	//Just display the Menu
	create: function()
	{
		game.add.image(0, 0, 'Menu');
		game.stage.backgroundColor = "#000000";
	},

	//This is just going to check if SPACE was pressed to move onto the next state
	//When the player is satisfied with looking at the Menu, they can press SPACE
	//to continue.
	update: function()
	{
		//To Navigate the other screens
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
		{
			game.state.start('GameStart');
		}
		else if(game.input.keyboard.isDown(Phaser.Keyboard.Z))
		{
			game.state.start('Controls');
		}
		else if(game.input.keyboard.isDown(Phaser.Keyboard.C))
		{
			game.state.start('Credits');
		}
	}
}

//Just the screen that introctuces the only 2 controls
var Controls = function(game) {};

Controls.prototype = 
{
	preload: function()
	{
		game.load.image('Controls', 'SubwayDash/Assets/Art/Screens/Controls.png');
	},

	create: function(game)
	{
		game.add.image(0, 0, 'Controls');
	},

	update: function()
	{
		if(game.input.keyboard.isDown(Phaser.Keyboard.ESC))
		{
			//To return back to menu
			game.state.start('Menu');
		}
	}
}

//Credits because 2 outside sources deserve some credit
var Credits = function(game) {};

Credits.prototype = 
{
	preload: function()
	{
		game.load.image('Credits', 'SubwayDash/Assets/Art/Screens/Credits.png');
	},

	create: function(game)
	{
		game.add.image(0, 0, 'Credits');
	},

	update: function()
	{
		//To return back to Menu
		if(game.input.keyboard.isDown(Phaser.Keyboard.ESC))
		{
			game.state.start('Menu');
		}
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~End Menu, Start GameStart~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//GameStart + some variables that will be used
var GameStart = function(game) 
{
	var background = null;
	var ground = null;

	var player = null;

	var train = null;
	this.trainExists = true;
	var obstacleGroup = null;
	var obsSpeed = -5;

	var loss = false;
	
	var score = 0;
	var scoreString = null;

	var trainSound = null;
	var bgMusic = null;

	var gameTime = null;
	var tutText = null;

	var jumpFlag = null;
};

GameStart.prototype = 
{
	//load everything
	preload: function()
	{
		//LOAD IN ALL THE (other) THINGS
		game.load.image('background', 'SubwayDash/Assets/Art/TheOtherStuff/Background.jpg');
		game.load.image('ground', 'SubwayDash/Assets/Art/TheOtherStuff/Platform.png');
		game.load.image('train', 'SubwayDash/Assets/Art/TheOtherStuff/Train.png');

		game.load.image('trashcan', 'SubwayDash/Assets/Art/Obstacles/trashcan.png');
		game.load.image('vendingMachine', 'SubwayDash/Assets/Art/Obstacles/VendingMachine.png');
		
		
		game.load.audio('bg', 'SubwayDash/Assets/Sound/Background/Track.ogg');

		game.load.atlas('player', 'SubwayDash/Assets/Art/Sprite/PlayerSprites.png', 'SubwayDash/Assets/Art/Sprite/PlayerSprites.json');
	},

	create: function()
	{
		//start up the physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//add in the assets. Background, train, ground/ platform, player sprite
		background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
		
		//Change some trian attributes so it looks better on the 800 X 600 screen
		train = game.add.image(0, 400, 'train');
		train.scale.setTo(3, 3);
		train.anchor.x = 1;
		train.anchor.y = 0;

		//Just some ground / platform attributes + physics
		ground = game.add.sprite(0, game.world.height - 32, 'ground')
		//To fit screen
		ground.scale.setTo(4, 1);
		game.physics.arcade.enable(ground);
		ground.body.immovable = true;

		//Jusr some player attributes and enable physics
		player = game.add.sprite(32, game.world.height - 150, 'player');
		game.physics.arcade.enable(player);
		player.anchor.x = 0.5;
		player.anchor.y = 0.5;

		//give the player some physics
		//player.body.bounce.y = 0.2;
		player.body.gravity.y = 300;
		player.body.acceleration.y = 10;
		player.body.collideWorldBounds = true;

		jumpFlag = false;

		//set player animations
		player.animations.add('run', ['adventurer_walk1', 'adventurer_walk2'], 15, true);
		player.animations.add('jump', ['adventurer_jump'], 10, true);
		player.animations.play('run');

		//train sound is played at the start
		trainSound = game.sound.play('train');

		//Also add background music to game
		bgMusic = game.add.audio('bg');

		//Just to display score of 0 at start
		scoreString = game.add.text(20, 50, 'Score: ' + score);
		
		//Timer to ispatch an event
		gameTime = game.time.create();

		//This is going to look really ugly but it's here just in case the player didn't read the Controls screen
		tutText = game.add.text(20, 250, 'Oh no, catch your train!!! :O \n Press SPACE to jump \n and B to zoom back down');

		//Remove the text tutorial after 10 seconds
		gameTime.add(Phaser.Timer.SECOND * 10, function(){tutText.kill();}, this);

		//Start timer. This order of timer events makes no sense :) 
		gameTime.start();

		//create obstacle group
		obstacleGroup = game.add.group();
		this.addObstacle(obstacleGroup);
	},

	update: function()
	{
		//scroll background
		background.tilePosition.x -= 5;

		//check if player collides with floor
		var playerPlatformHit = game.physics.arcade.collide(player, ground);

		//This here is supposed to be the part where the trian dashes by and you have to
		//somehow run and catch it although now that I think of it, can a human catch up to a train?
		//No. That's why it's an infinite runner.
		if(train.position.x <= 2500)
		{
			train.position.x += 20;
		}

		//update the score
		this.updateScore();
		
		//once the train hits a certain limit stop it so it looks
		//the the player is actually trying yo catch it.
		//then start playing background music and set trainExists to
		//false so that the music doesn't start up every update
		if(train.position.x >= 1100 && this.trainExists == true)
		{
			//train.kill();
			bgMusic.play('', 0, .75, true);
			this.trainExists = false;
		}


		//Just check for jump and plays the right animations. Adding playerPlatformHit
		//to it makes sure the player can only jump when they are already touching floor
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && playerPlatformHit)
		{
			player.body.velocity.y -= 450;
			player.animations.play('jump');
			game.sound.play('jump');
			jumpFlag = true;
		}
		//If they are in the air, they can press B to zoom back down
		else if(game.input.keyboard.isDown(Phaser.Keyboard.B) && !playerPlatformHit)
		{
			player.body.velocity.y += 450;
			player.animations.play('jump');
			game.sound.play('zoomDown');
		}
		//this checks if the player hit's the platform and the is jumping
		//if so play a sound that makes it seem like the player hits the 
		//platform
		else if(playerPlatformHit && jumpFlag)
		{
			player.animations.play('run');
			game.sound.play('land');
			jumpFlag = false;
		}
		//if player never jumped then this is here to play run animation 
		else if(playerPlatformHit)
		{
			player.animations.play('run');
			jumpFlag = false;
		}

		//Checks for collision with obstacle
		//If collision, kill player, stop music, set trainExists to true
		//and switch states
		if(game.physics.arcade.collide(player, obstacleGroup))
		{
			player.kill();
			game.sound.stopAll();
			this.trainExists = true;
			game.sound.play('crash');
			game.state.start('Dead');
		}
	},

	addObstacle: function(group) 
	{
		// construct new Obstacle object, add it to the game world, and add it to the group
		var type = (Math.random() * 10 <= 4) ? 'trashcan' : 'vendingMachine';
		var obstacle = new Obstacle(game, -150, player, type);
		game.add.existing(obstacle);
		group.add(obstacle);
	},

	//This is probably a shitty way of doing this but 
	//kill the original score string and add the updated on to the 
	//screen
	updateScore: function()
	{
		scoreString.kill();
		scoreString = game.add.text(20, 50, 'Score: ' + score);
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~End GameStart, Start Dead~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var Dead = function(game) {};

Dead.prototype = 
{
	//preload the loss screen
	preload: function()
	{
		game.load.image('GameOver', 'SubwayDash/Assets/Art/Screens/GameOverScreen.png');
	},

	create: function()
	{

		//Just add in some screen to let you know you lost
		game.add.image(0, 0, 'GameOver');
		game.add.text(225, 200, 'Your Score: ' + score, {font: "65px", fill: "#f0730e"})
		game.stage.backgroundColor = "#000000";
	},

	update: function()
	{
		//This is just going to check if SPACE was pressed to move onto the next state
		//Once the player has accepted their death and presses space, they go back to the 
		//main menu

		//Just set scores to 0 here whether the player decides to restart or go to menu 
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
		{
			game.state.start('Menu');
			score = 0;
		}
		else if(game.input.keyboard.isDown(Phaser.Keyboard.R))
		{
			game.state.start('GameStart');
			score = 0;
		}
	}
}

var Obstacle = function(game, speed, player, type) 
{

	if(type == 'vendingMachine')
	{
		Phaser.Sprite.call(this, game, game.width, game.height - 119, type);
	}
	else if(type == 'trashcan')
	{
		Phaser.Sprite.call(this, game, game.width, game.height - 96, type);
	}
	game.physics.enable(this, Phaser.Physics.ARCADE);
	this.anchor.set(0.5);
	this.body.immovable = true;	
	this.body.velocity.x = speed;
	this.newObstacle = true;
	this.player = player;				
};


Obstacle.prototype = Object.create(Phaser.Sprite.prototype);

Obstacle.prototype.constructor = Obstacle;  

// override the Phaser.Sprite update function
Obstacle.prototype.update = function() 
{

	if(this.newObstacle && this.x < Math.random() * game.width / 2) 
	{
		this.newObstacle = false;
		var type = (Math.random() * 10 <= 4) ? 'trashcan' : 'vendingMachine';
		GameStart.prototype.addObstacle(this.parent, type);
	}

	if(this.x == this.player.x)
	{
		score++;
	}
	// kill the obstacle if it reaches the left edge of the screen
	if(this.x < -this.width) 
	{
		this.kill();
	}
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~End Dead~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
game.state.add('Menu', Menu);
game.state.add('Controls', Controls);
game.state.add('Credits', Credits);
game.state.add('GameStart', GameStart);
game.state.add('Dead', Dead);
game.state.start('Menu');