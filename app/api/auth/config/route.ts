import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    clientId: process.env.KINDE_CLIENT_ID,
    issuerUrl: process.env.KINDE_ISSUER_URL,
    siteUrl: process.env.KINDE_SITE_URL,
  });
} 