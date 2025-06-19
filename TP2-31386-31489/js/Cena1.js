class Cena1 extends Phaser.Scene {
    constructor() {
      super('InicioJogo');
    }

    preload() {

      this.load.image('fundo menu', 'images/fundo menu.jpg');
     
      this.load.audio('gameover', 'sounds\\gameover.mp3');
      this.load.audio('fundo', 'sounds\\music_music.mp3');
      this.load.audio('comida', 'sounds\\music_food.mp3');
      this.load.audio('ganhar', 'sounds\\ganhar.mp3');
      this.load.image('snakeHead', 'images\\snake_head.png');
      this.load.image('snakeBody', 'images\\snake_body.png');
      this.load.image('food', 'images\\food.png');
      this.load.image('fundoJogo', 'images\\fundo jogo.jpg');
      this.load.image('endscreen', 'images\\end screen.png');
      this.load.image('gamewon', 'images\\gamewon.png');
      
      this.load.on('filecomplete', function (key) {
        console.log('Arquivo carregado:', key);
      });

      this.load.on('loaderror', function (file) {
        console.error('Erro ao carregar:', file.key);
      });
    }

    create() {

      this.add.image(0, 0, 'fundo menu').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

      this.add.text(this.scale.width / 2, 150, 'Snake Game', {
        font: '48px Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5);

      const startText = this.add.text(this.scale.width / 2, 300, 'Iniciar Jogo', {
        font: '32px Arial',
        fill: '#006400', 
        backgroundColor: '#ffffff99',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      startText.on('pointerover', () => {
        startText.setStyle({ fill: '#228B22' }); 
      });

      startText.on('pointerout', () => {
        startText.setStyle({ fill: '#006400' }); 
      });

      startText.on('pointerdown', () => {
        this.scene.start('JogarJogo');
      });
    }
}