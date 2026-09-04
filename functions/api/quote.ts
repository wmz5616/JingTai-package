interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

interface EventContext<T = Record<string, unknown>> {
  request: Request;
  env: T;
  [key: string]: any;
}

export const onRequestPost = async (context: EventContext<Env>): Promise<Response> => {
  try {
    const formData = await context.request.formData();
    
    // 1. Anti-spam Honeypot Check
    const gotcha = formData.get('_gotcha');
    if (gotcha && gotcha.toString().trim() !== '') {
      // Silently discard spam bots
      return new Response(JSON.stringify({ success: true, message: 'Received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const name = formData.get('name')?.toString() || 'Anonymous';
    const email = formData.get('email')?.toString() || '';
    const whatsapp = formData.get('whatsapp')?.toString() || 'N/A';
    const company = formData.get('company')?.toString() || 'N/A';
    const product = formData.get('product_name')?.toString() || 'General Inquiry';
    const quantity = formData.get('quantity')?.toString() || 'Not specified';
    const message = formData.get('message')?.toString() || '';

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Optional Telegram Real-time Push to Phone (Zero Cost)
    if (context.env.TELEGRAM_BOT_TOKEN && context.env.TELEGRAM_CHAT_ID) {
      const tgText = `🔔 *New Cosmetic Packaging RFQ!*\n\n` +
        `📦 *Product:* ${product}\n` +
        `🔢 *Quantity:* ${quantity}\n` +
        `👤 *Name:* ${name}\n` +
        `🏢 *Company:* ${company}\n` +
        `✉️ *Email:* ${email}\n` +
        `📱 *WhatsApp:* ${whatsapp}\n` +
        `💬 *Message:* ${message}`;

      await fetch(`https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: context.env.TELEGRAM_CHAT_ID,
          text: tgText,
          parse_mode: 'Markdown'
        })
      }).catch(() => {});
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Your inquiry has been successfully transmitted to our Guangzhou packaging desk.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
