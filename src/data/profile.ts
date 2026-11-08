export interface Profile {
  name: string;
  domain: string;
  intro: string;
  links: {
    instagram: string;
    email: string;
  };
}

export const profile: Profile = {
  name: 'ronnproject',
  domain: 'ronnproject.my.id',
  intro: 'Mahasiswa Teknik Komputer, Polmed. Membangun sistem dan merancang tampilannya.',
  links: {
    instagram: 'https://instagram.com/ronnlbtrn_',
    email: 'mailto:contact@ronnproject.my.id',
  },
};
