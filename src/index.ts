import 'phaser';
import GameConfig = Phaser.Types.Core.GameConfig;

import {Game} from './game';
import './css/main.css';

const config: GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [Game],
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
