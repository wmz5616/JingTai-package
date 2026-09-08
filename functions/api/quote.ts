interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

interface EventContext<T = Record<string, unknown>> {
  request: Request;
  env: T;
  [key: string]: any;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    },
  });
};

export const onRequestPost = async (context: EventContext<Env>): Promise<Response> => {
  try {
    const formData = await context.request.formData();
    
    // 1. Anti-spam Honeypot Check
    const gotcha = formData.get('_gotcha');
    if (gotcha && gotcha.toString().trim() !== '') {
      // Silently discard spam bots
      return new Response(JSON.stringify({ success: true, message: 'Received' }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const name = (formData.get('name')?.toString() || 'Anonymous').slice(0, 100);
    const email = (formData.get('email')?.toString() || '').trim().slice(0, 200);
    const whatsapp = (formData.get('whatsapp')?.toString() || 'N/A').slice(0, 100);
    const company = (formData.get('company')?.toString() || 'N/A').slice(0, 100);
    const product = (formData.get('product_name')?.toString() || 'General Inquiry').slice(0, 200);
    const quantity = (formData.get('quantity')?.toString() || 'Not specified').slice(0, 100);
    const message = (formData.get('message')?.toString() || '').slice(0, 2000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'A valid email address is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    // 2. Telegram Real-time Push (Using HTML mode with safe entity escaping)
    if (context.env.TELEGRAM_BOT_TOKEN && context.env.TELEGRAM_CHAT_ID) {
      const tgText = `<b>[RFQ LEAD] New Cosmetic Packaging Inquiry</b>\n\n` +
        `<b>Product:</b> ${escapeHtml(product)}\n` +
        `<b>Quantity:</b> ${escapeHtml(quantity)}\n` +
        `<b>Name:</b> ${escapeHtml(name)}\n` +
        `<b>Company:</b> ${escapeHtml(company)}\n` +
        `<b>Email:</b> ${escapeHtml(email)}\n` +
        `<b>WhatsApp:</b> ${escapeHtml(whatsapp)}\n` +
        `<b>Message:</b> ${escapeHtml(message || 'No additional project details provided')}`;

      await fetch(`https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: context.env.TELEGRAM_CHAT_ID,
          text: tgText,
          parse_mode: 'HTML'
        })
      }).catch((err) => {
        console.error('Telegram notification error:', err);
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Your inquiry has been successfully transmitted to our Guangzhou packaging desk.'
    }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      }
    });

  } catch (err: any) {
    console.error('API /api/quote processing error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error. Please contact us via WhatsApp or WeChat.' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  }
};
