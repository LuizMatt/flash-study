import { Category } from '../types/Category';
import { Flashcard } from '../types/Flashcard';
import { ReviewSession } from '../types/Session';
import { UserData } from '../types/User';

export const categories: Category[] = [
  { id: '1', name: 'Redes e IoT', color: '#2563EB', icon: '🌐', createdAt: new Date('2025-01-10') },
];

export const flashcards: Flashcard[] = [
  {
    id: '1',
    categoryId: '1',
    front: 'O Wi-Fi é baseado em qual padrão de rede sem fio?',
    back: 'IEEE 802.11',
    learned: false,
    createdAt: new Date('2025-01-11'),
  },
  {
    id: '2',
    categoryId: '1',
    front: 'Uma das principais características do Wi-Fi é?',
    back: 'Alta largura de banda e alcance médio',
    learned: false,
    createdAt: new Date('2025-01-11'),
  },
  {
    id: '3',
    categoryId: '1',
    front: 'Qual das seguintes aplicações usa Wi-Fi com mais frequência?',
    back: 'Streaming de vídeo em alta resolução',
    learned: false,
    createdAt: new Date('2025-01-11'),
  },
  {
    id: '4',
    categoryId: '1',
    front: 'O Bluetooth foi projetado principalmente para:',
    back: 'Curta distância e baixo consumo de energia',
    learned: false,
    createdAt: new Date('2025-01-12'),
  },
  {
    id: '5',
    categoryId: '1',
    front: 'O Bluetooth Low Energy (BLE) é mais adequado para:',
    back: 'Dispositivos vestíveis e sensores IoT',
    learned: false,
    createdAt: new Date('2025-01-12'),
  },
  {
    id: '6',
    categoryId: '1',
    front: 'Um exemplo de uso comum do Bluetooth em dispositivos móveis é:',
    back: 'Conexão de fones de ouvido e smartwatches',
    learned: false,
    createdAt: new Date('2025-01-12'),
  },
  {
    id: '7',
    categoryId: '1',
    front: 'O principal motivo para a criação do IPv6 foi:',
    back: 'Expandir o número de endereços IP disponíveis',
    learned: false,
    createdAt: new Date('2025-01-13'),
  },
  {
    id: '8',
    categoryId: '1',
    front: 'Quantos bits possui um endereço IPv6?',
    back: '128 bits',
    learned: false,
    createdAt: new Date('2025-01-13'),
  },
  {
    id: '9',
    categoryId: '1',
    front: 'Uma vantagem do IPv6 para IoT é:',
    back: 'Permitir endereçamento único e direto de cada dispositivo',
    learned: false,
    createdAt: new Date('2025-01-13'),
  },
  {
    id: '10',
    categoryId: '1',
    front: 'Qual a principal diferença entre o 4G e o 5G?',
    back: 'O 5G oferece maior velocidade e menor latência',
    learned: false,
    createdAt: new Date('2025-01-14'),
  },
  {
    id: '11',
    categoryId: '1',
    front: 'Em dispositivos IoT, o 5G é vantajoso por:',
    back: 'Permitir comunicações massivas e em tempo real',
    learned: false,
    createdAt: new Date('2025-01-14'),
  },
  {
    id: '12',
    categoryId: '1',
    front: 'Um exemplo de aplicação real usando 5G em IoT é:',
    back: 'Sensores de estacionamento conectados em tempo real',
    learned: false,
    createdAt: new Date('2025-01-14'),
  },
  {
    id: '13',
    categoryId: '1',
    front: 'O protocolo HTTP é usado principalmente para:',
    back: 'Comunicação entre cliente e servidor web',
    learned: false,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '14',
    categoryId: '1',
    front: 'O HTTPS se diferencia do HTTP por:',
    back: 'Usar criptografia SSL/TLS para proteger os dados',
    learned: false,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '15',
    categoryId: '1',
    front: 'Uma aplicação real que usa HTTPS é:',
    back: 'Acesso a sites bancários e lojas virtuais',
    learned: false,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '16',
    categoryId: '1',
    front: 'A Web 1.0 é caracterizada por:',
    back: 'Conteúdo estático e leitura apenas',
    learned: false,
    createdAt: new Date('2025-01-16'),
  },
  {
    id: '17',
    categoryId: '1',
    front: 'A principal característica da Web 2.0 é:',
    back: 'Participação do usuário e mídias sociais',
    learned: false,
    createdAt: new Date('2025-01-16'),
  },
  {
    id: '18',
    categoryId: '1',
    front: 'A Web 3.0 é marcada por:',
    back: 'Uso de IA, blockchain e web semântica',
    learned: false,
    createdAt: new Date('2025-01-16'),
  },
  {
    id: '19',
    categoryId: '1',
    front: 'O desenvolvimento para dispositivos móveis envolve principalmente:',
    back: 'Criação de aplicativos para smartphones e tablets',
    learned: false,
    createdAt: new Date('2025-01-17'),
  },
  {
    id: '20',
    categoryId: '1',
    front: 'Uma das principais características de um sistema IoT é:',
    back: 'Integrar sensores, comunicação e processamento',
    learned: false,
    createdAt: new Date('2025-01-17'),
  },
  {
    id: '21',
    categoryId: '1',
    front: 'Qual das opções representa uma aplicação de IoT?',
    back: 'Lâmpada inteligente controlada por aplicativo',
    learned: false,
    createdAt: new Date('2025-01-17'),
  },
];

export const reviewSessions: ReviewSession[] = [
  {
    id: '1',
    categoryId: '1',
    date: new Date('2025-02-01'),
    total: 21,
    correct: 15,
  },
];

export const users:UserData [] = [
  {
    email:"teste@gmail.com",
    name:"teste",
    password:"1234"
  },
  {
    email:"teste2@gmail.com",
    name:"teste2",
    password:"1234"
  }
];