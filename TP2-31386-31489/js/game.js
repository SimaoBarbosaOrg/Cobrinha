window.onload = function () {
  var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    scene: [Cena1, Cena2],
    canvasStyle: 'willReadFrequently: true'
  };

  var jogo = new Phaser.Game(config);
};