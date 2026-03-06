import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

export async function GET() {
  await ensureDir();
  try {
    const files = await fs.readdir(DATA_DIR);
    const events = await Promise.all(
      files.filter(f => f.startsWith('event_') && f.endsWith('.json')).map(async f => {
        const data = await fs.readFile(path.join(DATA_DIR, f), 'utf-8');
        return JSON.parse(data);
      })
    );
    return NextResponse.json(events);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  await ensureDir();
  const event = await req.json();
  await fs.writeFile(path.join(DATA_DIR, `event_${event.id}.json`), JSON.stringify(event, null, 2));
  return NextResponse.json({ success: true, id: event.id });
}
