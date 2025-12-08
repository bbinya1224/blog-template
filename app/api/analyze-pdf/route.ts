import { NextRequest, NextResponse } from 'next/server';
import { generateStyleProfileFromPdfText } from '@/features/analyze-style/lib/style-analysis';
import { saveStyleProfile } from '@/shared/api/data-files';
import { AppError } from '@/shared/lib/errors';
const pdfParse = require('pdf-parse');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'PDF 파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'PDF에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    const styleProfile = await generateStyleProfileFromPdfText(extractedText);

    await saveStyleProfile(styleProfile);

    return NextResponse.json({
      styleProfile,
      message: 'PDF 텍스트 분석이 완료되었습니다.',
    });
  } catch (error) {
    console.error('PDF 분석 오류:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'PDF 분석 중 예상치 못한 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
