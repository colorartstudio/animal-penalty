import iconBr from '../assets/icons/icone_br.svg';
import iconCn from '../assets/icons/icone_ch.svg';
import iconUs from '../assets/icons/icone_us.svg';
import iconAu from '../assets/icons/icone_au.svg';
import iconIn from '../assets/icons/icone_in.svg';
import iconZa from '../assets/icons/icone_za.svg';
import iconCa from '../assets/icons/icone_ca.svg';
import iconJp from '../assets/icons/icone_jp.svg';
import iconAr from '../assets/icons/icone_ar.svg';
import iconFr from '../assets/icons/icone_fr.svg';
import iconMx from '../assets/icons/icone_mx.svg';
import iconDe from '../assets/icons/icone_de.svg';

export const MASCOTS = [
  { id: 'br', countryName: 'Brasil', flagEmoji: '🇧🇷', mascotName: 'Arara Azul', mascotType: 'Arara', palette: ['bg-yellow-400', 'bg-green-600', 'bg-blue-600'], emoji: '🦜', assetFolder: 'brazil', assetPrefix: 'br', icon: iconBr },
  { id: 'cn', countryName: 'China', flagEmoji: '🇨🇳', mascotName: 'Panda', mascotType: 'Urso', palette: ['bg-red-500', 'bg-yellow-400', 'bg-white'], emoji: '🐼', assetFolder: 'china', assetPrefix: 'ch', icon: iconCn },
  { id: 'us', countryName: 'EUA', flagEmoji: '🇺🇸', mascotName: 'Águia Careca', mascotType: 'Águia', palette: ['bg-blue-700', 'bg-red-500', 'bg-white'], emoji: '🦅', assetFolder: 'eua', assetPrefix: 'us', icon: iconUs },
  { id: 'au', countryName: 'Austrália', flagEmoji: '🇦🇺', mascotName: 'Canguru', mascotType: 'Marsupial', palette: ['bg-yellow-500', 'bg-green-700', 'bg-white'], emoji: '🦘', assetFolder: 'australia', assetPrefix: 'au', icon: iconAu },
  { id: 'in', countryName: 'Índia', flagEmoji: '🇮🇳', mascotName: 'Tigre de Bengala', mascotType: 'Tigre', palette: ['bg-orange-500', 'bg-white', 'bg-green-600'], emoji: '🐅', assetFolder: 'india', assetPrefix: 'in', icon: iconIn },
  { id: 'za', countryName: 'África do Sul', flagEmoji: '🇿🇦', mascotName: 'Leão', mascotType: 'Felino', palette: ['bg-green-600', 'bg-yellow-400', 'bg-red-500'], emoji: '🦁', assetFolder: 'africa_do_sul', assetPrefix: 'za', icon: iconZa },
  { id: 'ca', countryName: 'Canadá', flagEmoji: '🇨🇦', mascotName: 'Alce', mascotType: 'Cervídeo', palette: ['bg-red-600', 'bg-white', 'bg-red-800'], emoji: '🦌', assetFolder: 'canada', assetPrefix: 'ca', icon: iconCa },
  { id: 'jp', countryName: 'Japão', flagEmoji: '🇯🇵', mascotName: 'Garça', mascotType: 'Ave', palette: ['bg-white', 'bg-red-600', 'bg-gray-200'], emoji: '🦩', assetFolder: 'japao', assetPrefix: 'jp', icon: iconJp },
  { id: 'ar', countryName: 'Argentina', flagEmoji: '🇦🇷', mascotName: 'Puma', mascotType: 'Felino', palette: ['bg-blue-300', 'bg-white', 'bg-yellow-400'], emoji: '🐆', assetFolder: 'argentina', assetPrefix: 'ar', icon: iconAr },
  { id: 'fr', countryName: 'França', flagEmoji: '🇫🇷', mascotName: 'Galo', mascotType: 'Ave', palette: ['bg-blue-600', 'bg-white', 'bg-red-600'], emoji: '🐓', assetFolder: 'franca', assetPrefix: 'fr', icon: iconFr },
  { id: 'mx', countryName: 'México', flagEmoji: '🇲🇽', mascotName: 'Águia Dourada', mascotType: 'Águia', palette: ['bg-green-600', 'bg-white', 'bg-red-600'], emoji: '🦅', assetFolder: 'mexico', assetPrefix: 'mx', icon: iconMx },
  { id: 'de', countryName: 'Alemanha', flagEmoji: '🇩🇪', mascotName: 'Águia Negra', mascotType: 'Águia', palette: ['bg-black', 'bg-red-600', 'bg-yellow-400'], emoji: '🦅', assetFolder: 'alemanha', assetPrefix: 'de', icon: iconDe },
];

export const ZONES = [
  { id: 'TL', label: 'Esq. Sup.', top: '25%', left: '20%' },
  { id: 'TR', label: 'Dir. Sup.', top: '25%', left: '80%' },
  { id: 'C',  label: 'Centro',    top: '50%', left: '50%' },
  { id: 'BL', label: 'Esq. Inf.', top: '75%', left: '20%' },
  { id: 'BR', label: 'Dir. Inf.', top: '75%', left: '80%' }
];

export const INITIAL_BANK = { systemMPH: 0, burnedMPH: 0, burnedUSD: 0 };
