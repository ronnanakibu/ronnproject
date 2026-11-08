import type { Command, OutputBlock } from '../terminal/types.js';
import { profile } from '../data/profile.js';

export const contactCommand: Command = {
  name: 'contact',
  description: 'Info kontak Ronn.',
  run(_ctx, _args): OutputBlock {
    return {
      type: 'link-list',
      items: [
        {
          label: 'Instagram @ronnlbtrn_',
          url: profile.links.instagram,
          external: true,
        },
        {
          label: 'Email',
          url: profile.links.email,
          external: false,
        },
      ],
    };
  },
};

