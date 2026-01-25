import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/shared/api/trpc/root';
import { createContext } from '@/shared/api/trpc/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
