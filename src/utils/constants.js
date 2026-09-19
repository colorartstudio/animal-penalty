const iconSrc = (prefix) => `/assets/icons/icone_${prefix}.webp`;

export const BALL_IMG = '/assets/images/ball.webp';
export const KICK_BTN_IMG = '/assets/images/botao_kick.webp';
export const STADIUM_LOOP = '/assets/videos/loop_v1/loop_v1.mp4';

export const GK_POSES = ['p1', 'p2', 'd1', 'd2', 'e1', 'e2'];

export const goalkeeperSrc = (mascot, suffix = 'p1') =>
  `/assets/goalkeeper/${mascot.assetFolder}/${mascot.assetPrefix}_${suffix}.webp`;

export const goalkeeperPoseUrls = (mascot) =>
  mascot ? GK_POSES.map((suffix) => goalkeeperSrc(mascot, suffix)) : [];

const uniqueUrls = (urls) => [...new Set(urls.filter(Boolean))];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Carrega imagens e reporta progresso. Resolve mesmo se alguma falhar. */
export const preloadImages = (urls, { onProgress, timeoutMs = 0 } = {}) => {
  const list = uniqueUrls(urls);
  if (list.length === 0) {
    onProgress?.({ loaded: 0, total: 0 });
    return Promise.resolve({ loaded: 0, total: 0 });
  }

  let loaded = 0;
  const total = list.length;
  const report = () => onProgress?.({ loaded, total });

  const loadOne = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      const done = () => {
        loaded += 1;
        report();
        resolve();
      };
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });

  const work = Promise.all(list.map(loadOne)).then(() => ({ loaded, total }));

  if (!timeoutMs) return work;

  return Promise.race([
    work,
    sleep(timeoutMs).then(() => ({ loaded, total, timedOut: true })),
  ]);
};

/** Pré-carrega vídeo até ter dados suficientes para reproduzir. */
export const preloadVideo = (src, { onProgress, timeoutMs = 12000 } = {}) => {
  if (!src) {
    onProgress?.({ loaded: 1, total: 1 });
    return Promise.resolve({ loaded: 1, total: 1 });
  }

  const work = new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const finish = () => {
      onProgress?.({ loaded: 1, total: 1 });
      resolve({ loaded: 1, total: 1 });
    };

    video.addEventListener('canplaythrough', finish, { once: true });
    video.addEventListener('error', finish, { once: true });
    video.src = src;
    video.load();
  });

  if (!timeoutMs) return work;

  return Promise.race([
    work,
    sleep(timeoutMs).then(() => {
      onProgress?.({ loaded: 1, total: 1 });
      return { loaded: 1, total: 1, timedOut: true };
    }),
  ]);
};

/** Assets críticos de uma partida (ícones, poses GK, bola, kick, vídeo). */
export const matchAssetUrls = (p1Mascot, p2Mascot) =>
  uniqueUrls([
    BALL_IMG,
    KICK_BTN_IMG,
    p1Mascot?.icon,
    p2Mascot?.icon,
    ...goalkeeperPoseUrls(p1Mascot),
    ...goalkeeperPoseUrls(p2Mascot),
  ]);

export const preloadMatchAssets = async (
  p1Mascot,
  p2Mascot,
  { onProgress, timeoutMs = 12000, minMs = 300 } = {}
) => {
  const imageUrls = matchAssetUrls(p1Mascot, p2Mascot);
  const imageTotal = imageUrls.length;
  const total = imageTotal + 1; // + vídeo
  let imageLoaded = 0;
  let videoLoaded = 0;

  const report = () =>
    onProgress?.({ loaded: imageLoaded + videoLoaded, total });

  const started = Date.now();

  const imagesPromise = preloadImages(imageUrls, {
    timeoutMs,
    onProgress: ({ loaded }) => {
      imageLoaded = loaded;
      report();
    },
  });

  const videoPromise = preloadVideo(STADIUM_LOOP, {
    timeoutMs,
    onProgress: ({ loaded }) => {
      videoLoaded = loaded;
      report();
    },
  });

  const [images, video] = await Promise.all([imagesPromise, videoPromise]);
  const elapsed = Date.now() - started;
  if (elapsed < minMs) await sleep(minMs - elapsed);

  return {
    loaded: imageLoaded + videoLoaded,
    total,
    timedOut: Boolean(images.timedOut || video.timedOut),
  };
};

export const MASCOTS = [
  { id: 'br', countryName: 'Brasil', flagEmoji: '🇧🇷', mascotName: 'Arara Azul', mascotType: 'Arara', palette: ['bg-yellow-400', 'bg-green-600', 'bg-blue-600'], emoji: '🦜', assetFolder: 'brazil', assetPrefix: 'br', icon: iconSrc('br') },
  { id: 'cn', countryName: 'China', flagEmoji: '🇨🇳', mascotName: 'Panda', mascotType: 'Urso', palette: ['bg-red-500', 'bg-yellow-400', 'bg-white'], emoji: '🐼', assetFolder: 'china', assetPrefix: 'ch', icon: iconSrc('ch') },
  { id: 'us', countryName: 'EUA', flagEmoji: '🇺🇸', mascotName: 'Águia Careca', mascotType: 'Águia', palette: ['bg-blue-700', 'bg-red-500', 'bg-white'], emoji: '🦅', assetFolder: 'eua', assetPrefix: 'us', icon: iconSrc('us') },
  { id: 'au', countryName: 'Austrália', flagEmoji: '🇦🇺', mascotName: 'Canguru', mascotType: 'Marsupial', palette: ['bg-yellow-500', 'bg-green-700', 'bg-white'], emoji: '🦘', assetFolder: 'australia', assetPrefix: 'au', icon: iconSrc('au') },
  { id: 'in', countryName: 'Índia', flagEmoji: '🇮🇳', mascotName: 'Tigre de Bengala', mascotType: 'Tigre', palette: ['bg-orange-500', 'bg-white', 'bg-green-600'], emoji: '🐅', assetFolder: 'india', assetPrefix: 'in', icon: iconSrc('in') },
  { id: 'za', countryName: 'África do Sul', flagEmoji: '🇿🇦', mascotName: 'Leão', mascotType: 'Felino', palette: ['bg-green-600', 'bg-yellow-400', 'bg-red-500'], emoji: '🦁', assetFolder: 'africa_do_sul', assetPrefix: 'za', icon: iconSrc('za') },
  { id: 'ca', countryName: 'Canadá', flagEmoji: '🇨🇦', mascotName: 'Alce', mascotType: 'Cervídeo', palette: ['bg-red-600', 'bg-white', 'bg-red-800'], emoji: '🦌', assetFolder: 'canada', assetPrefix: 'ca', icon: iconSrc('ca') },
  { id: 'jp', countryName: 'Japão', flagEmoji: '🇯🇵', mascotName: 'Garça', mascotType: 'Ave', palette: ['bg-white', 'bg-red-600', 'bg-gray-200'], emoji: '🦩', assetFolder: 'japao', assetPrefix: 'jp', icon: iconSrc('jp') },
  { id: 'ar', countryName: 'Argentina', flagEmoji: '🇦🇷', mascotName: 'Puma', mascotType: 'Felino', palette: ['bg-blue-300', 'bg-white', 'bg-yellow-400'], emoji: '🐆', assetFolder: 'argentina', assetPrefix: 'ar', icon: iconSrc('ar') },
  { id: 'fr', countryName: 'França', flagEmoji: '🇫🇷', mascotName: 'Galo', mascotType: 'Ave', palette: ['bg-blue-600', 'bg-white', 'bg-red-600'], emoji: '🐓', assetFolder: 'franca', assetPrefix: 'fr', icon: iconSrc('fr') },
  { id: 'mx', countryName: 'México', flagEmoji: '🇲🇽', mascotName: 'Águia Dourada', mascotType: 'Águia', palette: ['bg-green-600', 'bg-white', 'bg-red-600'], emoji: '🦅', assetFolder: 'mexico', assetPrefix: 'mx', icon: iconSrc('mx') },
  { id: 'de', countryName: 'Alemanha', flagEmoji: '🇩🇪', mascotName: 'Águia Negra', mascotType: 'Águia', palette: ['bg-black', 'bg-red-600', 'bg-yellow-400'], emoji: '🦅', assetFolder: 'alemanha', assetPrefix: 'de', icon: iconSrc('de') },
];

export const MASCOT_ICON_URLS = MASCOTS.map((m) => m.icon).filter(Boolean);

export const ZONES = [
  { id: 'TL', label: 'Esq. Sup.', top: '25%', left: '20%' },
  { id: 'TR', label: 'Dir. Sup.', top: '25%', left: '80%' },
  { id: 'C',  label: 'Centro',    top: '50%', left: '50%' },
  { id: 'BL', label: 'Esq. Inf.', top: '75%', left: '20%' },
  { id: 'BR', label: 'Dir. Inf.', top: '75%', left: '80%' }
];

export const INITIAL_BANK = { systemMPH: 0, burnedMPH: 0, burnedUSD: 0 };
