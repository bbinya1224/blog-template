import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import AnalyzeClientPage from './analyze-client';

export default async function AnalyzePage() {
  const session = await getServerSession(authOptions);

  return (
    <AnalyzeClientPage user={session?.user} />
  );
}
