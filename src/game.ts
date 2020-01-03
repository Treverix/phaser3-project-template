import 'phaser';
import GameConfig = Phaser.Types.Core.GameConfig;
import GameObject = Phaser.GameObjects.GameObject;
import Sprite = Phaser.Physics.Arcade.Sprite;
import Group = Phaser.Physics.Arcade.Group;

import sky from './assets/sky.png';
import platform from './assets/platform.png';
import star from './assets/star.png';
import bomb from './assets/bomb.png';
import dude from './assets/dude.png';

export default class Demo extends Phaser.Scene {

    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private player?: Sprite;
    private score = 0;
    private scoreText?: Phaser.GameObjects.Text;
    private bombs?: Group;
    private stars?: Group;
    private gameOver = false;

    constructor() {
        super('demo');
        console.log(this.score, this.gameOver);
    }

    public preload() {
        this.load.image('sky', sky);
        this.load.image('ground', platform);
        this.load.image('star', star);
        this.load.image('bomb', bomb);
        this.load.spritesheet('dude',
            dude,
            {frameWidth: 32, frameHeight: 48}
        );
    }

    public create() {
        this.add.image(400, 300, 'sky');

        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground')
            .setScale(2)
            .refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {x: 12, y: 0, stepX: 70}
        });
        this.stars.children.iterate((child: GameObject): void => {
            if (child instanceof Sprite) {
                child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
            }
        });

        this.bombs = this.physics.add.group();

        this.player = this.physics.add.sprite(100, 450, 'dude')
            .setBounce(0.2)
            .setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 0,
                end: 3
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20,
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 5,
                end: 8
            }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, platforms);
        this.physics.add.collider(this.stars, platforms);
        this.physics.add.collider(this.bombs, platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, undefined, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreText = this.add.text(16, 16, 'score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
    }

    public update() {
        if (this.cursors === undefined || this.player === undefined) {
            return;
        }

        if (this.cursors.left?.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right?.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up?.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    private collectStar(player: GameObject, star: GameObject): void {
        if (!(player instanceof Sprite) || !(star instanceof Sprite)) {
            return;
        }

        star.disableBody(true, true);
        this.score += 10;
        this.scoreText?.setText('Score: ' + this.score);

        if (this.stars?.countActive(true) === 0) {
            this.stars.children.iterate((child: GameObject) => {
                if (child instanceof Sprite) {
                    child.enableBody(true, child.x, 0, true, true);
                }
            });

            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            const bomb: Sprite = this.bombs?.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        }
    }

    private hitBomb(player: GameObject, bomb: GameObject) {
        if (!(player instanceof Sprite) || !(bomb instanceof Sprite)) {
            return;
        }

        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.gameOver = true;
    }
}

const config: GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Demo,
    scale: {
        mode: Phaser.Scale.FIT,
    },
    resolution: window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    }
};

// start the game
new Phaser.Game(config);
