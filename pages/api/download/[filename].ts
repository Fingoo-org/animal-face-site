import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (req.method === 'GET') {
    // 이미지 파일의 경로 설정
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename as string);

    // 파일이 존재하는지 확인
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();

      // 파일 확장자에 따라 Content-Type 설정
      const mimeTypeMap: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
      };

      const mimeType = mimeTypeMap[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);

      // 파일을 스트리밍하여 응답
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
