/** Source-cited content for the six launch crops (decision D6). Loaded by the seed. */
import { chilli } from './chilli.ts';
import { groundnut } from './groundnut.ts';
import { maize } from './maize.ts';
import { onion } from './onion.ts';
import { rice } from './rice.ts';
import { tomato } from './tomato.ts';
import type { CropContent } from './types.ts';

export const LAUNCH_CROP_CONTENT: CropContent[] = [rice, maize, tomato, chilli, groundnut, onion];
