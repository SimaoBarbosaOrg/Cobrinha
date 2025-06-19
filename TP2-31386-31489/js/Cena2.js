class Cena2 extends Phaser.Scene {
  constructor() {
    super('JogarJogo');
  }

  init() {
    this.gridSize = 90;
    this.score = 0;
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.inputQueue = [];
    this.speed = 300;
    this.lastMoveTime = 0;
    this.gameOverSound = null;
    this.backgroundMusic = null;
    this.foodSound = null;

    this.isGameOver = false;
    this.isPaused = false;
  }

  create() {
    this.sys.game.canvas.willReadFrequently = true;
    
    this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

    this.add.image(0, 0, 'fundoJogo')
      .setOrigin(0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height)
      .setDepth(0);
    
    const startX = Math.floor(this.sys.game.config.width / 2 / this.gridSize) * this.gridSize;
    const startY = Math.floor(this.sys.game.config.height / 2 / this.gridSize) * this.gridSize;
    
    this.snake = [];
    for (let i = 0; i < 3; i++) {
      let spriteKey = (i == 0) ? 'snakeHead' : 'snakeBody';  
      this.snake.push(
        this.add.sprite(startX - i * this.gridSize, startY, spriteKey)
          .setOrigin(0)
          .setDisplaySize(this.gridSize, this.gridSize)
      );
    }
    
    this.food = this.add.sprite(0, 0, 'food')
      .setOrigin(0)
      .setDisplaySize(this.gridSize, this.gridSize);
      
    this.placeFood();

    this.scoreText = this.add.text(20, 20, 'Pontuação: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(1);

    this.initializeSound();

    try {
      if (this.backgroundMusic) {
        this.backgroundMusic.play({
          loop: true,
          volume: 0.3
        });
      }
    } catch (error) {
      console.warn('Erro ao reproduzir música de fundo:', error);
    }

    
    this.setupControls();
  }

  initializeSound() {
    try {
      this.gameOverSound = this.sound.add('gameover', { 
        volume: 0.5,
        mute: false
      });
      this.backgroundMusic = this.sound.add('fundo', {
        volume: 0.3,
        mute: false
      });
      this.foodSound = this.sound.add('comida', {
        volume: 0.7,
        mute: false
      });
      this.winSound = this.sound.add('ganhar', { 
        volume: 0.5,
        mute: false
      });
      console.log('Sons carregados com sucesso');
    } catch (error) {
      console.warn('Erro ao carregar sons:', error);
    }
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toUpperCase();
      let dir = null;

      
      if (key == 'ARROWLEFT' || key == 'A') dir = 'LEFT';
      else if (key == 'ARROWRIGHT' || key == 'D') dir = 'RIGHT';
      else if (key == 'ARROWUP' || key == 'W') dir = 'UP';
      else if (key == 'ARROWDOWN' || key == 'S') dir = 'DOWN';
      else if (key == ' ' && !this.isGameOver) { 
        this.togglePause();
        return;
      }

      if (dir && this.inputQueue.length < 3 && !this.isPaused) {
        if (
          (dir == 'LEFT' && this.direction != 'RIGHT' && this.nextDirection != 'RIGHT') ||
          (dir == 'RIGHT' && this.direction != 'LEFT' && this.nextDirection != 'LEFT') ||
          (dir == 'UP' && this.direction != 'DOWN' && this.nextDirection != 'DOWN') ||
          (dir == 'DOWN' && this.direction != 'UP' && this.nextDirection != 'UP')
        ) {
          const lastInput = this.inputQueue.length > 0 ? this.inputQueue[this.inputQueue.length - 1] : null;
          if (dir != lastInput) {
            this.inputQueue.push(dir);
          }
        }
      }
    });
  }

  togglePause() {
    if (this.isGameOver) return; 

    this.isPaused = !this.isPaused;

    
    try {
      if (this.backgroundMusic) {
        if (this.isPaused) {
          this.backgroundMusic.pause();
        } else {
          this.backgroundMusic.resume();
        }
      }
    } catch (error) {
      console.warn('Erro ao gerenciar música de fundo na pausa:', error);
    }

    if (this.isPaused) {
      
      this.pauseText = this.add.text(
        this.sys.game.config.width / 2,
        this.sys.game.config.height / 2,
        'Jogo Pausado\nPressione ESPAÇO para continuar',
        {
          fontSize: '32px',
          fill: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setDepth(11);
    } else {
      
      if (this.pauseText) {
        this.pauseText.destroy();
      }
    }
  }

  update(time) {
    if (this.isGameOver || this.isPaused) return; 

    if (time - this.lastMoveTime > this.speed) {
      if (this.inputQueue.length > 0) {
        this.nextDirection = this.inputQueue.shift();
      }
      this.moveSnake();
      this.lastMoveTime = time;
    }
  }

  moveSnake() {
    this.direction = this.nextDirection;
    const head = this.snake[0];
    const newX = head.x + (this.direction == 'LEFT' ? -this.gridSize : this.direction == 'RIGHT' ? this.gridSize : 0);
    const newY = head.y + (this.direction == 'UP' ? -this.gridSize : this.direction == 'DOWN' ? this.gridSize : 0);

    if (this.checkCollision(newX, newY)) {
      this.gameOver();
      return;
    }

    const newHead = this.snake.pop();
    newHead.setPosition(Math.floor(newX), Math.floor(newY));
    this.snake.unshift(newHead);

    
    this.snake.forEach((part, index) => {
      if (index == 0) {
        part.setTexture('snakeHead');
      } else {
        part.setTexture('snakeBody');
      }
      part.setDisplaySize(this.gridSize, this.gridSize);
    });

    if (newHead.x == this.food.x && newHead.y == this.food.y) {
      this.growSnake();
      this.placeFood();
      this.updateScore(10);
      this.speed = Math.max(10, this.speed - 0.5);
      
      try {
        if (this.foodSound) {
          this.foodSound.play();
        }
      } catch (error) {
        console.warn('Erro ao reproduzir som de comida:', error);
      }
    }
  }

  gameOver() {
    this.isGameOver = true;

    try {
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop();
      }
    } catch (error) {
      console.warn('Erro ao parar música de fundo no game over:', error);
    }

    try {
      if (this.gameOverSound) {
        this.gameOverSound.play();
      }
    } catch (error) {
      console.error('Erro ao reproduzir som de game over:', error);
    }

    const overlay = this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(10);

    const endscreenImage = this.add.image(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      'endscreen'
    )
      .setOrigin(0.5)
      .setDepth(10.5)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
    
    const gameOverText = this.add.text(
      this.sys.game.config.width / 2, 
      this.sys.game.config.height / 2 - 50, 
      'Game Over!', 
      {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Arial',
        stroke: '#ffffff',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setDepth(11);

    const scoreText = this.add.text(
      this.sys.game.config.width / 2, 
      this.sys.game.config.height / 2, 
      `Pontuação final: ${this.score}`, 
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11);

    const restartText = this.add.text(
      this.sys.game.config.width / 2, 
      this.sys.game.config.height / 2 + 70, 
      'Pressione ESPAÇO para reiniciar', 
      {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11);

    this.input.keyboard.once('keydown-SPACE', () => {
      overlay.destroy();
      gameOverText.destroy();
      scoreText.destroy();
      restartText.destroy();

      if (this.gameOverSound && this.gameOverSound.isPlaying) {
        this.gameOverSound.stop();
      }

      this.isGameOver = false;
      this.scene.restart();
    });
  }

  growSnake() {
    const lastPart = this.snake[this.snake.length - 1];
    const newPart = this.add.sprite(
      lastPart.x,
      lastPart.y,
      'snakeBody'
    )
      .setOrigin(0)
      .setDisplaySize(this.gridSize, this.gridSize);
    this.snake.push(newPart);
  }

  placeFood() {
    const maxX = Math.floor(this.sys.game.config.width / this.gridSize);
    const maxY = Math.floor(this.sys.game.config.height / this.gridSize);
    let x, y;

    do {
      x = Math.floor(Math.random() * maxX) * this.gridSize;
      y = Math.floor(Math.random() * maxY) * this.gridSize;
    } while (this.snake.some(part => part.x === x && part.y === y));

    this.food.setPosition(Math.floor(x), Math.floor(y));
  }

  checkCollision(x, y) {
    if (x < 0 || x >= this.sys.game.config.width || y < 0 || y >= this.sys.game.config.height) {
      return true;
    }
    return this.snake.some((part, i) => i > 0 && part.x === x && part.y === y);
  }

  updateScore(points) {
    this.score += points;
    this.scoreText.setText('Pontuação: ' + this.score);

    if (this.score >= 100) {
      this.gameWon();
    }
  }

  gameWon() {
    this.isGameOver = true;

    try {
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop();
      }
    } catch (error) {
      console.warn('Erro ao parar música de fundo no game won:', error);
    }

    try {
      if (this.winSound && !this.winSound.isPlaying) {
        this.winSound.play({ volume: 0.5 });
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de vitória:', error);
    }

    const overlay = this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(10);

    const winImage = this.add.image(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2,
      'gamewon'
    )
      .setOrigin(0.5)
      .setDepth(10.5)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    const winText = this.add.text(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2 - 50,
      'Parabéns! Ganhaste Bro!',
      {
        fontSize: '48px',
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 5
      }
    ).setOrigin(0.5).setDepth(11);

    const scoreText = this.add.text(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2 + 20,
      `Pontuação final: ${this.score}`,
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11);

    const restartText = this.add.text(
      this.sys.game.config.width / 2,
      this.sys.game.config.height / 2 + 80,
      'Pressione ESPAÇO para jogar novamente',
      {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setDepth(11);

    this.input.keyboard.once('keydown-SPACE', () => {
      overlay.destroy();
      winImage.destroy();
      winText.destroy();
      scoreText.destroy();
      restartText.destroy();

      this.isGameOver = false;
      this.scene.restart();
    });
  }
}