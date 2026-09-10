import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    game.init();
  } catch (error) {
    console.error('Failed to initialize 3D Racing Game:', error);
    const canvas = document.getElementById('game-canvas');
    if (canvas && canvas.parentElement) {
      const errBanner = document.createElement('div');
      errBanner.style.position = 'absolute';
      errBanner.style.top = '50%';
      errBanner.style.left = '50%';
      errBanner.style.transform = 'translate(-50%, -50%)';
      errBanner.style.color = '#f85149';
      errBanner.style.fontFamily = 'monospace';
      errBanner.style.fontSize = '18px';
      errBanner.style.textAlign = 'center';
      errBanner.innerHTML = `<strong>Initialization Error:</strong><br>${(error as Error).message}<br><br>Please verify your browser supports WebGL2.`;
      canvas.parentElement.appendChild(errBanner);
    }
  }
});
