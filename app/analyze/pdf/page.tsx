'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PdfAnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('PDF 파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();

      const parseJson = (text: string) => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      };

      const data = parseJson(responseText);

      if (!response.ok) {
        const errorMessage = data?.error || `서버 오류 (${response.status})`;
        console.error('Server Error Response:', responseText);
        throw new Error(errorMessage);
      }

      if (!data) {
        console.error('Invalid JSON Response:', responseText);
        throw new Error('서버 응답 형식이 올바르지 않습니다. (HTML 반환됨)');
      }

      router.push('/?status=analyzed');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PDF로 스타일 분석하기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            작성한 글이 담긴 PDF 파일을 업로드하여<br />
            나만의 글쓰기 스타일을 분석해보세요.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="file-upload" className="sr-only">
                PDF 파일 선택
              </label>
              <input
                id="file-upload"
                name="file"
                type="file"
                accept=".pdf"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? '분석 중...' : '스타일 분석 시작'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
