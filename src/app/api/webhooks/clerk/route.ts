import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createUser } from '@/lib/db-utils';
import { sendWelcomeEmailAction } from '@/lib/actions/admin';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    created_at: number;
  };
};

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to your environment variables');
  }

  // Get the headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      // Create user in your database
      const email = email_addresses[0]?.email_address;
      await createUser({
        email,
        name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name,
        clerkUserId: ''
      });

      await sendWelcomeEmailAction(email, 'Road.io');

      console.log(`User ${id} created in database`);
    } catch (error) {
      console.error('Error creating user in database:', error);
      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
