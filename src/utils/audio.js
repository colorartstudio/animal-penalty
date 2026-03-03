
// Gerenciador de Áudio Centralizado
// Usa sons locais para evitar problemas de CORS/ORB

const SOUNDS_URL = {
  // Torcida (Crowd) - Som ambiente longo
  ambience: '/assets/sounds/ambience.mp3',
  
  // Chute (Kick) - Som seco e curto
  kick: '/assets/sounds/ball_kick.mp3',
  
  // Gol (Goal) - Comemoração intensa
  goal: '/assets/sounds/goal.mp3',
  
  // Erro/Defesa (Miss) - Som de defesa
  miss: '/assets/sounds/miss.mp3',
  
  // Apito (Whistle) - Som agudo
  whistle: '/assets/sounds/whistle.mp3',

  // Seleção (Selection) - Quando escolhe um canto
  selection: '/assets/sounds/selection.mp3',

  // Impacto na Rede/Trave (Post)
  post: '/assets/sounds/ball_post.mp3',

  // Resultado Final
  victory: '/assets/sounds/victory.mp3',
  defeat: '/assets/sounds/defeat.mp3',
};

class AudioManager {
  constructor() {
    this.audioInstances = {};
    this._enabled = false;
    this.ambienceAudio = null;
    this.unlocked = false;
    this.initializationPromise = null;
  }

  // Inicializa/Pré-carrega os áudios
  async init() {
    console.log("[Audio] Initializing AudioManager...");
    this.initializationPromise = Promise.all(
        Object.keys(SOUNDS_URL).map(async (key) => {
            return new Promise((resolve) => {
                const audio = new Audio(SOUNDS_URL[key]);
                audio.preload = 'auto';
                
                // Handler de sucesso
                const onLoad = () => {
                    console.log(`[Audio] Loaded: ${key}`);
                    if (key === 'ambience') {
                        audio.loop = true;
                        audio.volume = 0.3;
                        this.ambienceAudio = audio;
                    } else {
                        this.audioInstances[key] = audio;
                    }
                    resolve();
                };

                // Handler de erro
                const onError = (e) => {
                    console.error(`[Audio] Error loading ${key}:`, e);
                    // Resolve mesmo com erro para não travar a Promise.all
                    resolve();
                };

                audio.addEventListener('canplaythrough', onLoad, { once: true });
                audio.addEventListener('error', onError, { once: true });
                
                // Fallback timeout se o evento não disparar
                setTimeout(() => {
                    // Tenta forçar load se suportado
                    if(audio.readyState >= 3) onLoad();
                    else resolve(); 
                }, 2000);
            });
        })
    );
    
    await this.initializationPromise;
    console.log("[Audio] Initialization complete.");
  }

  // Tenta desbloquear o áudio do navegador (deve ser chamado em evento de clique)
  unlock() {
    if (this.unlocked) return;
    console.log("[Audio] Unlocking audio context...");
    
    // Tenta tocar e pausar imediatamente um som silencioso ou existente para desbloquear
    if (this.ambienceAudio) {
        this.ambienceAudio.play().then(() => {
            console.log("[Audio] Context unlocked successfully");
            this.ambienceAudio.pause();
            this.unlocked = true;
        }).catch(e => {
            console.warn("[Audio] Unlock failed:", e);
        });
    }
  }

  set enabled(value) {
    console.log(`[Audio] Enabled set to: ${value}`);
    this._enabled = value;
    if (!value) {
      this.stopAmbience();
    } else if (value && this.unlocked) {
       // Se reativar, pode retomar ambience se desejado
    }
  }

  get enabled() {
    return this._enabled;
  }

  play(soundName) {
    if (!this._enabled) {
      console.log(`[Audio] Skipped ${soundName} (disabled)`);
      return;
    }
    
    // Tratamento especial para ambiente
    if (soundName === 'ambience') {
      this.playAmbience();
      return;
    }

    const originalAudio = this.audioInstances[soundName];
    if (originalAudio) {
      // Clona para permitir sobreposição
      try {
          const clone = originalAudio.cloneNode();
          clone.volume = 1.0;
          const playPromise = clone.play();
          
          if (playPromise !== undefined) {
              playPromise.then(() => {
                  // Play started
                  console.log(`[Audio] Playing: ${soundName}`);
              }).catch(error => {
                  console.warn(`[Audio] Play failed for ${soundName}:`, error);
              });
          }
      } catch (e) {
          console.error(`[Audio] Error cloning/playing ${soundName}:`, e);
      }
    } else {
      console.warn(`[Audio] Sound not found: ${soundName}`);
    }
  }

  playAmbience() {
    if (!this._enabled) return;
    if (this.ambienceAudio) {
      console.log("[Audio] Starting ambience...");
      const promise = this.ambienceAudio.play();
      if (promise !== undefined) {
        promise.then(() => console.log("[Audio] Ambience playing"))
               .catch(e => console.warn("[Audio] Ambience autoplay blocked:", e));
      }
    }
  }

  stopAmbience() {
    if (this.ambienceAudio) {
      this.ambienceAudio.pause();
      this.ambienceAudio.currentTime = 0;
    }
  }
}

export const audioManager = new AudioManager();
audioManager.init();
