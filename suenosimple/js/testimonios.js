document.querySelectorAll('.video-thumb-wrap').forEach(wrap => {
    const video = wrap.querySelector('.video-el');
    const btn   = wrap.querySelector('.play-overlay');

    btn.addEventListener('click', () => {
      if (video.paused) {
        // Pausar todos los demás
        document.querySelectorAll('.video-el').forEach(v => {
          if (v !== video) { v.pause(); v.currentTime = 0; }
        });
        video.play();
        btn.style.opacity = '0';
      } else {
        video.pause();
        btn.style.opacity = '1';
      }
    });

    // Mostrar botón al pausar o terminar
    video.addEventListener('pause',  () => { btn.style.opacity = '1'; });
    video.addEventListener('ended',  () => { btn.style.opacity = '1'; video.currentTime = 0; });
  });