'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './root';

/**
 * tRPC React Hooks
 *
 * @example
 * const { data } = trpc.review.generate.useMutation();
 */
export const trpc = createTRPCReact<AppRouter>();
