// ===== Game settings =====

// --- Parallax ---
// Each background layer scrolls at a fraction of the game speed
// (the farther the layer, the slower it moves)
const cloudsSpeedFactor = 0.25;
const mountainsSpeedFactor = 0.5;
const hillsSpeedFactor = 0.75;
const trackSpeedFactor = 1;

// Scrolling speed of the track, used as the reference for all layers
let gameSpeed = 1;

// --- Track ---
const trackHeight = 60; // in pixels

// --- Runner ---
const runnerTrackOffset = 25; // how far the runner's feet sit inside the track, to run in the middle of a lane
const groundHeight = 20; // thickness of the invisible physics floor
const jumpPower = -440; // pixels per second (negative = upwards)

// Size of one frame in the runner sprite sheet
const runnerFrameWidth = 96;
const runnerFrameHeight = 128;

// Physics body: about two thirds of the frame, to fit the drawn character
const runnerBodyWidth = (runnerFrameWidth * 2) / 3;
const runnerBodyHeight = Math.round((runnerFrameHeight * 2) / 3);
const runnerBodyOffsetX = (runnerFrameWidth - runnerBodyWidth) / 2; // centered horizontally
const runnerBodyOffsetY = runnerFrameHeight - runnerBodyHeight; // aligned with the bottom of the frame, so the feet stay on the floor

// --- Fireball ---
const fireBallHeightOffset = 40; // height above the runner's feet
const fireBallSpeed = -250; // pixels per second, moving left

// Size of one frame in the fireball sprite sheet
const fireBallWidth = 72;
const fireBallFrameWidth = fireBallWidth;
const fireBallFrameHeight = 44;

// Physics body: covers only the bright head, on the left of the frame (not the trail)
const fireBallBodyWidth = Math.round(fireBallFrameWidth / 2); // the head is about half of the frame
const fireBallBodyHeight = Math.round(fireBallFrameHeight) / 2;
const fireBallBodyOffsetX = (fireBallFrameWidth - fireBallBodyWidth) / 4; // small gap from the left edge, where the head starts
const fireBallBodyOffsetY = fireBallFrameHeight - fireBallBodyHeight; // aligned with the bottom of the frame

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  // 1. Load assets
  preload() {
    // --- Scenery ---
    this.load.image("sky", "assets/sky.png");
    this.load.image("clouds", "assets/clouds.png");
    this.load.image("mountains", "assets/mountains.png");
    this.load.image("hills", "assets/hills.png");
    this.load.image("track", "assets/track.png");

    // --- Animated characters ---
    // Regular grids: Phaser slices them using the frame size
    this.load.spritesheet("runner", "assets/runner.png", {
      frameWidth: runnerFrameWidth,
      frameHeight: runnerFrameHeight,
    });

    this.load.spritesheet("fireball", "assets/fireball.png", {
      frameWidth: fireBallFrameWidth,
      frameHeight: fireBallFrameHeight,
    });
  }

  // 2. Create game objects
  create() {
    // --- Background and parallax layers, created back to front ---
    this.add.image(0, 0, "sky").setOrigin(0, 0);

    this.cloudsLayer = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "clouds")
      .setOrigin(0, 0);

    this.mountainsLayer = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "mountains")
      .setOrigin(0, 0);

    this.hillsLayer = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "hills")
      .setOrigin(0, 0);

    // --- Foreground track, along the bottom of the screen ---
    this.trackLayer = this.add
      .tileSprite(
        0,
        this.scale.height - trackHeight,
        this.scale.width,
        trackHeight,
        "track",
      )
      .setOrigin(0, 0);

    // --- Runner ---
    // Animations
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("runner", { start: 10, end: 14 }),
      frameRate: 10,
      repeat: -1, // loop forever
    });

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNumbers("runner", { start: 15, end: 19 }),
      frameRate: 10,
      repeat: 0, // play once per jump
    });

    // Sprite, anchored at the feet so its y is where it stands
    const runnerX = 100;
    const runnerY = this.scale.height - trackHeight + runnerTrackOffset;
    this.runner = this.physics.add
      .sprite(runnerX, runnerY, "runner")
      .setOrigin(0.5, 1)
      .play("run");

    // Smaller physics body, so empty space around the character doesn't count as a hit
    this.runner.body.setSize(runnerBodyWidth, runnerBodyHeight);
    this.runner.body.setOffset(runnerBodyOffsetX, runnerBodyOffsetY);

    // Invisible static floor that stops the runner from falling through the track
    const floor = this.add
      .rectangle(0, runnerY, this.scale.width, groundHeight)
      .setOrigin(0, 0);

    this.physics.add.existing(floor, true);
    this.physics.add.collider(this.runner, floor);

    // --- Fireball: starts just off the right edge and flies left ---
    // Animation
    this.anims.create({
      key: "burn",
      frames: this.anims.generateFrameNumbers("fireball", {
        start: 0,
        end: 15,
      }),
      frameRate: 15,
      repeat: -1,
    });

    // Sprite, moving left at a constant speed
    const fireBallY = runnerY - fireBallHeightOffset;
    const fireBallX = this.scale.width + fireBallWidth / 2;
    this.fireball = this.physics.add
      .sprite(fireBallX, fireBallY, "fireball")
      .setOrigin(0.5, 0.5)
      .setVelocityX(fireBallSpeed)
      .play("burn");

    // Physics body limited to the head of the fireball
    this.fireball.body.setSize(fireBallBodyWidth, fireBallBodyHeight);
    this.fireball.body.setOffset(fireBallBodyOffsetX, fireBallBodyOffsetY);

    // It flies horizontally, so it must ignore gravity
    this.fireball.body.setAllowGravity(false);

    // --- Controls ---
    this.spaceKey = this.input.keyboard.addKey("SPACE");

    // --- Collisions ---
    // Detect the contact without pushing the runner
    this.physics.add.overlap(
      this.runner,
      this.fireball,
      this.hitFireball,
      null,
      this,
    );
  }

  // Called when the runner touches the fireball
  hitFireball() {
    console.log("Hit!");
  }

  // 3. Game logic, every frame
  update() {
    // --- Parallax: scroll each layer at its own speed to create depth ---
    this.cloudsLayer.tilePositionX += gameSpeed * cloudsSpeedFactor;
    this.mountainsLayer.tilePositionX += gameSpeed * mountainsSpeedFactor;
    this.hillsLayer.tilePositionX += gameSpeed * hillsSpeedFactor;
    this.trackLayer.tilePositionX += gameSpeed * trackSpeedFactor;

    // --- Runner: jump only when standing on the floor (no double jump),
    // otherwise go back to running once landed ---
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      this.runner.body.touching.down
    ) {
      this.runner.setVelocityY(jumpPower);
      this.runner.play("jump");
    } else if (this.runner.body.touching.down) {
      this.runner.play("run", true);
    }

    // --- Fireball: once fully off the left edge, send it back to the right ---
    if (this.fireball.x <= -fireBallWidth / 2) {
      this.fireball.x = this.scale.width + fireBallWidth / 2;
    }
  }
}

// Phaser settings: game size, pixel-art rendering and Arcade Physics
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 300,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: true, // shows physics bodies, to remove before release
    },
  },
  scene: GameScene,
};

new Phaser.Game(config);
