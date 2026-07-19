// Vercel Serverless Function — crea una preferencia de pago en MercadoPago y notifica por email
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const {
    items, shippingName, shippingPrice, extras,
    customerName, customerPhone, customerEmail,
    customerAddress, customerComuna, customerCity, customerRegion, customerNotes,
  } = req.body;

  const preferenceItems = [];

  for (const item of (items || [])) {
    preferenceItems.push({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'CLP',
    });
  }

  if (shippingPrice > 0) {
    preferenceItems.push({
      title: shippingName || 'Despacho',
      quantity: 1,
      unit_price: shippingPrice,
      currency_id: 'CLP',
    });
  }

  if (extras > 0) {
    preferenceItems.push({
      title: 'Bolsa de regalo 🎁',
      quantity: 1,
      unit_price: extras,
      currency_id: 'CLP',
    });
  }

  const preference = {
    items: preferenceItems,
    payer: { name: customerName || '', email: customerEmail || '', phone: { number: customerPhone || '' } },
    back_urls: {
      success:  'https://tienda-panuelos.vercel.app/?pago=ok',
      failure:  'https://tienda-panuelos.vercel.app/?pago=error',
      pending:  'https://tienda-panuelos.vercel.app/?pago=pendiente',
    },
    auto_return: 'approved',
    statement_descriptor: 'TIENDA DE PANUELOS',
    payment_methods: { installments: 1 },
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('MP error:', data);
      return res.status(500).json({ error: 'Error al crear preferencia', detail: data });
    }

    // ── Notificación por email ──────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      try {
        const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');
        const total = (items || []).reduce((s, i) => s + i.price * i.qty, 0)
                    + (shippingPrice || 0)
                    + (extras || 0);

        const itemsHtml = (items || [])
          .map(i => `<tr>
            <td style="padding:4px 8px">${i.name}</td>
            <td style="padding:4px 8px;text-align:center">${i.qty}</td>
            <td style="padding:4px 8px;text-align:right">${fmt(i.price * i.qty)}</td>
          </tr>`)
          .join('');

        const addressParts = [customerAddress, customerComuna, customerCity, customerRegion].filter(Boolean);
        const addressLine = addressParts.length
          ? addressParts.join(', ')
          : '(Retiro en Concepción)';

        const html = `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
            <div style="background:#8B6C42;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;color:#fff;font-size:1.3rem">🛍️ Nuevo pedido recibido</h2>
            </div>
            <div style="border:1px solid #e0d6c8;border-top:none;border-radius:0 0 8px 8px;padding:24px">

              <p style="margin:0 0 4px"><strong>👤 Cliente:</strong> ${customerName || '—'}</p>
              <p style="margin:0 0 16px"><strong>📱 Teléfono:</strong> ${customerPhone || '—'}</p>
              <p style="margin:0 0 16px"><strong>📍 Dirección:</strong> ${addressLine}</p>
              ${customerNotes ? `<p style="margin:0 0 16px"><strong>📝 Nota:</strong> ${customerNotes}</p>` : ''}

              <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
                <thead>
                  <tr style="background:#f5f0ea">
                    <th style="padding:6px 8px;text-align:left;font-size:0.85rem">Producto</th>
                    <th style="padding:6px 8px;text-align:center;font-size:0.85rem">Cant.</th>
                    <th style="padding:6px 8px;text-align:right;font-size:0.85rem">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

              <p style="margin:0 0 4px"><strong>🚚 Despacho:</strong> ${shippingName || '—'} — ${shippingPrice > 0 ? fmt(shippingPrice) : 'Gratis'}</p>
              ${extras > 0 ? `<p style="margin:0 0 4px"><strong>🎁 Bolsa regalo:</strong> ${fmt(extras)}</p>` : ''}
              <p style="margin:12px 0 0;font-size:1.1rem"><strong>Total: ${fmt(total)}</strong></p>

              <hr style="border:none;border-top:1px solid #e0d6c8;margin:20px 0">
              <p style="margin:0;font-size:0.8rem;color:#999">El cliente está completando el pago en MercadoPago.<br>ID de preferencia: ${data.id}</p>
            </div>
          </div>`;

        // 1. Email a la tienda (Cata)
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Tienda Pañuelos <onboarding@resend.dev>',
            to: ['catybarrios@gmail.com'],
            subject: `🛍️ Nuevo pedido — ${customerName || 'Cliente'} (${fmt(total)})`,
            html,
          }),
        });

        // 2. Email de confirmación al comprador
        if (customerEmail) {
          const customerHtml = `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
              <div style="background:#8B6C42;padding:20px 24px;border-radius:8px 8px 0 0">
                <h2 style="margin:0;color:#fff;font-size:1.3rem">🎉 ¡Gracias por tu compra!</h2>
              </div>
              <div style="border:1px solid #e0d6c8;border-top:none;border-radius:0 0 8px 8px;padding:24px">

                <p style="margin:0 0 16px">Hola <strong>${customerName || 'cliente'}</strong>, recibimos tu pedido y estamos muy contentos de que hayas elegido <strong>Tienda de Pañuelos</strong>. 🧣</p>

                <div style="background:#f5f0ea;border-radius:8px;padding:16px;margin-bottom:16px">
                  <p style="margin:0 0 8px;font-weight:600;color:#8B6C42">📋 Resumen de tu pedido</p>
                  <table style="width:100%;border-collapse:collapse">
                    <thead>
                      <tr style="background:#ede4d7">
                        <th style="padding:5px 8px;text-align:left;font-size:0.82rem">Producto</th>
                        <th style="padding:5px 8px;text-align:center;font-size:0.82rem">Cant.</th>
                        <th style="padding:5px 8px;text-align:right;font-size:0.82rem">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                  </table>
                  <hr style="border:none;border-top:1px solid #e0d6c8;margin:10px 0">
                  <p style="margin:0 0 4px"><strong>🚚 Despacho:</strong> ${shippingName || '—'} — ${shippingPrice > 0 ? fmt(shippingPrice) : 'Gratis'}</p>
                  ${extras > 0 ? `<p style="margin:0 0 4px"><strong>🎁 Bolsa regalo:</strong> ${fmt(extras)}</p>` : ''}
                  <p style="margin:10px 0 0;font-size:1.1rem"><strong>Total: ${fmt(total)}</strong></p>
                </div>

                <p style="margin:0 0 4px"><strong>📍 Dirección:</strong> ${addressLine}</p>
                ${customerNotes ? `<p style="margin:4px 0 0"><strong>📝 Nota:</strong> ${customerNotes}</p>` : ''}

                <hr style="border:none;border-top:1px solid #e0d6c8;margin:20px 0">
                <p style="margin:0 0 8px;font-size:0.9rem">¿Tienes dudas? Escríbenos por WhatsApp:</p>
                <a href="https://wa.me/56991593102" style="display:inline-block;background:#25D366;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:0.9rem">💬 WhatsApp +56 9 9159 3102</a>

                <p style="margin:20px 0 0;font-size:0.78rem;color:#999">Este es un comprobante automático. El pago fue gestionado de forma segura a través de MercadoPago.</p>
              </div>
            </div>`;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Tienda Pañuelos <onboarding@resend.dev>',
              to: [customerEmail],
              subject: `✅ Confirmación de tu pedido — Tienda de Pañuelos`,
              html: customerHtml,
            }),
          });
        }
      } catch (emailErr) {
        console.error('Error al enviar email:', emailErr);
        // No bloqueamos el flujo de pago si falla el email
      }
    }
    // ────────────────────────────────────────────────────────────────────

    return res.json({ init_point: data.init_point, id: data.id });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
};
