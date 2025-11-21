import { createStyleProfileGetHandler } from '@/features/style-profile/api/create-style-profile-handler';
import { readStyleProfile } from '@/shared/api/data-files';

export const GET = createStyleProfileGetHandler({ readStyleProfile });
