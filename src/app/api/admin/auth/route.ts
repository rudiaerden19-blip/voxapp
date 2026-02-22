import { NextRequest, NextResponse } from 'next/server';

// NO LOGIN REQUIRED - Always authenticated
// POST - Login (always succeeds)
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Admin access granted' });
}

// GET - Check session (always authenticated)
export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: true, email: 'admin@voxapp.tech' });
}

// DELETE - Logout (no-op)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ success: true, message: 'Logged out' });
}
