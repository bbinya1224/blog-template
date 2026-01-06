import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import AnalyzeClientPage from './AnalyzeClient';

export default async function AnalyzePage() {
  const session = await getServerSession(authOptions);

  return (
    <AnalyzeClientPage user={session?.user} />
  );
}
