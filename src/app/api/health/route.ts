import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Простая проверка работоспособности приложения
    return NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}