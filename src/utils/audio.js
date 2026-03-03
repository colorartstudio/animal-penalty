import { Howl, Howler } from 'howler';

// Gerenciador de Áudio Centralizado com Howler.js
// Abstrai complexidades de Web Audio API e compatibilidade (iOS/Safari)

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
    this.sounds = {};
    this._enabled = false;
    this.ambienceId = null;
    this.shouldPlayAmbience = false;
  }

  // Inicializa/Pré-carrega os áudios
  async init() {
    console.log("[Audio] Initializing AudioManager with Howler...");
    
    // Configurações globais do Howler se necessário
    // Howler.autoUnlock = true; // Já é o padrão

    Object.keys(SOUNDS_URL).forEach((key) => {
        const sound = new Howl({
            src: [SOUNDS_URL[key]],
            preload: true,
            html5: false, // Usa Web Audio API para melhor performance e timing
            loop: key === 'ambience',
            volume: key === 'ambience' ? 0.3 : 1.0,
            onload: () => console.log(`[Audio] Loaded: ${key}`),
            onloaderror: (id, err) => console.error(`[Audio] Error loading ${key}:`, err)
        });
        this.sounds[key] = sound;
    });
    
    console.log("[Audio] Initialization complete.");
  }

  // Tenta desbloquear o áudio do navegador
  // Howler gerencia isso automaticamente no primeiro clique, mas mantemos o método
  // para compatibilidade com a interface existente e logs.
  unlock() {
    // Tenta retomar o contexto se estiver suspenso
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().then(() => {
            console.log("[Audio] Howler Context Resumed via unlock()");
        });
    }
    // Retorna true para sinalizar que o "processo" de unlock foi chamado
    // (O app remove os listeners baseados nisso)
    return true; 
  }

  set enabled(value) {
    console.log(`[Audio] Enabled set to: ${value}`);
    this._enabled = value;
    
    // Mute global do Howler
    Howler.mute(!value);

    if (value) {
        // Se reativar e deveria estar tocando ambiente
        if (this.shouldPlayAmbience) {
            this.playAmbience();
        }
    } else {
        // Se desativar, o mute global já silencia, mas podemos parar para economizar recursos?
        // O comportamento anterior parava o ambience.
        // Vamos manter tocando (apenas mudo) ou parar?
        // Parar é mais seguro para garantir silêncio absoluto e poupar bateria.
        // Mas se usarmos mute global, ao desmutar volta de onde estava.
        // O código original fazia stopAmbience(). Vamos replicar a lógica de play/stop explicita
        // para o ambience, mas usar o mute global para efeitos curtos.
    }
  }

  get enabled() {
    return this._enabled;
  }

  play(soundName) {
    if (!this._enabled) {
      // Se desabilitado, não dispara novos sons (mesmo com mute global, evita processamento)
      return;
    }
    
    // Tratamento especial para ambiente
    if (soundName === 'ambience') {
      this.playAmbience();
      return;
    }

    const sound = this.sounds[soundName];
    if (sound) {
        // Toca o som (Howler permite sobreposição automática)
        sound.play();
    } else {
        console.warn(`[Audio] Sound not found: ${soundName}`);
    }
  }

  playAmbience() {
    this.shouldPlayAmbience = true;
    if (!this._enabled) return;

    const sound = this.sounds['ambience'];
    if (sound) {
        if (!sound.playing(this.ambienceId)) {
            this.ambienceId = sound.play();
            console.log("[Audio] Ambience playing, ID:", this.ambienceId);
        }
    }
  }

  stopAmbience() {
    this.shouldPlayAmbience = false;
    const sound = this.sounds['ambience'];
    if (sound) {
        sound.stop();
        this.ambienceId = null;
    }
  }
}

export const audioManager = new AudioManager();
audioManager.init();
