export interface Project {
  slug: string;
  title: string;
  description: string;
  url: string;
}

export const projects: Project[] = [
  {
    slug: 'kelas-f',
    title: 'kelas-f',
    description: 'Website Kelas F Teknik Komputer, Polmed.',
    url: 'https://kelas-f.ronnproject.my.id',
  },
  {
    slug: 'ronn-ai',
    title: 'ronn-ai',
    description: 'Dashboard untuk bot WhatsApp: Public Deck dan Mission Control.',
    url: 'https://ronn-ai.ronnproject.my.id',
  },
  {
    slug: 'ronnbot',
    title: 'ronnbot',
    description: 'Ekosistem bot WhatsApp modular berbasis Node.js.',
    url: 'https://ronnbot.ronnproject.my.id',
  },
  {
    slug: 'squad-x',
    title: 'squad-x',
    description: 'Pengalaman web sinematik dengan scroll, dibangun di React.',
    url: 'https://squad-x.ronnproject.my.id',
  },
];

