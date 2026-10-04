# Blaze Dodge

A 2D pixel-art browser game: a sprinter races through a sunset landscape and must jump over incoming fireballs. The game speeds up with every fireball dodged: how long can you last?

Built with **Phaser** and its Arcade Physics engine, as a full remake of [Hurdle Runner](https://github.com/JohnBnrd/hurdle-runner), my first game written in vanilla JavaScript with the Canvas API.

## Play online

[Play Blaze Dodge](https://johnbnrd.github.io/blaze-dodge/)

## How to play

- Press **Space** to jump over the fireballs
- Touching a fireball ends the race
- Press **Space** again to restart after a game over

## Features

- Parallax background: sky, clouds, mountains, hills and track scroll at different speeds to create depth
- Animated runner sprite with running and jumping animations
- Jump physics and collisions handled by Phaser's Arcade Physics engine
- Physics bodies adjusted to the drawn characters, so empty space around a sprite never counts as a hit
- Time-based movement and score: the game runs at the same pace on every screen, whatever its refresh rate
- Progressive difficulty: the whole game speeds up after each fireball, up to a maximum speed
- Game over screen with instant restart

## Built with

- [Phaser 4](https://phaser.io/) and Arcade Physics
- JavaScript (ES6)
- HTML5

## Project history

This game is the second version of a project built in two steps:

- **Hurdle Runner, vanilla JavaScript**: everything coded by hand with the Canvas API, including the game loop, gravity, collision detection and game state. [Play it](https://johnbnrd.github.io/hurdle-runner/) or [see the code](https://github.com/JohnBnrd/hurdle-runner).
- **Blaze Dodge, Phaser**: a full remake with a game engine, pixel-art graphics and animations. The repository keeps the whole Git history, from the first canvas commit to this version.

Building the first version without an engine made it clear what Phaser handles behind the scenes in the second one.

## Run locally

Phaser loads the images from the `assets` folder, which browsers block when a page is opened directly from the disk. The game must therefore be served by a local web server:

1. Clone the repository
2. Open the folder in VS Code and start it with the **Live Server** extension, or run `npx serve` in the project folder
3. Open the local address shown in your browser

## Assets and credits

- **Scenery** (sky, clouds, mountains, hills, track): created for this project
- **Fireball**: [AutoSprite](https://www.autosprite.io) Free Asset Library, CC0 1.0 (public domain), see `assets/LICENSE.txt`
- **Runner character**: AI-generated image, original source unknown, used for non-commercial purposes only

## What I learned

### Hurdle Runner: vanilla JavaScript

- **Game loop architecture:** How to structure each frame into three steps (clear, update, draw) inside a game loop driven by `requestAnimationFrame`, ensuring smooth animations.
- **2D collision detection:** How AABB (Axis-Aligned Bounding Box) collision detection works by checking horizontal and vertical overlap simultaneously on both axes.
- **Jump physics and gravity:** How to simulate physical movement using speed, acceleration, and ground detection variables (`runnerY`, `runnerSpeedY`, `gravity`).
- **State management & resetting:** How to manage global game states (`isGameOver`) and reset all dynamic variables cleanly without re-declaring them with `let`.

### Blaze Dodge: Phaser

- **Scene lifecycle:** How a Phaser scene is organized into `preload`, `create` and `update`, and how the engine takes over clearing and redrawing: objects are created once, then only their properties change each frame.
- **Arcade Physics:** How to use gravity, static bodies, `collider` and `overlap`, and how to resize physics bodies with `setSize` and `setOffset` so collisions match the drawn characters instead of the whole sprite frame.
- **Frame-rate independent movement:** How to express speeds in pixels per second and use `delta` (the time between two frames) so the scenery, the obstacles and the score move at the same pace on a 60 Hz or a 120 Hz screen.
- **Restarting a scene cleanly:** How `scene.restart()` resets the game by running `create()` again, and why shared systems such as the animation manager survive the restart and must be handled separately (resuming animations, creating them only once).
