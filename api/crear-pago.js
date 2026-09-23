// Vercel Serverless Function — crea una preferencia de pago en MercadoPago y notifica por email
const nodemailer = require('nodemailer');
const { PRODUCTS, SHIPPING_OPTIONS, EXTRAS } = require('../catalogo.js');

const STORE_EMAIL = 'catybarrios@gmail.com';

// Envía un correo. Usa Gmail si están GMAIL_USER y GMAIL_APP_PASSWORD en Vercel
// (puede enviar a cualquier cliente). Si no, usa Resend, que con el remitente de
// prueba solo puede enviar a la dueña de la cuenta.
async function sendEmail({ to, subject, html }) {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });
    await transporter.sendMail({
      from: `Tienda de Pañuelos <${process.env.GMAIL_USER}>`,
      replyTo: STORE_EMAIL,
      to, subject, html,
    });
    return;
  }
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: 'Tienda Pañuelos <onboarding@resend.dev>', to: [to], subject, html }),
    });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const {
    items: requestedItems, shippingId, giftBag,
    customerName, customerPhone, customerEmail,
    customerAddress, customerComuna, customerCity, customerRegion, customerNotes,
  } = req.body || {};

  // ── Precios: SIEMPRE desde catalogo.js, nunca desde el navegador ──────
  // El navegador solo dice qué producto (id) y cuántos (qty). Así nadie puede
  // cambiar el precio antes de pagar.
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  const items = [];
  for (const reqItem of requestedItems) {
    const product = PRODUCTS.find(p => p.id === Number(reqItem?.id));
    const qty = Number(reqItem?.qty);
    if (!product) return res.status(400).json({ error: 'Producto no válido' });
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return res.status(400).json({ error: 'Cantidad no válida' });
    }
    items.push({ name: product.name, qty, price: product.price });
  }

  const shipping = SHIPPING_OPTIONS.find(s => s.id === shippingId);
  if (!shipping) return res.status(400).json({ error: 'Forma de despacho no válida' });
  const shippingName = shipping.name;
  const shippingPrice = shipping.price;

  const extras = giftBag ? EXTRAS.find(e => e.id === 'giftbag').price : 0;

  const preferenceItems = [];

  for (const item of items) {
    preferenceItems.push({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: 'CLP',
    });
  }

  if (shippingPrice > 0) {
    preferenceItems.push({
      title: shippingName,
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
    if ((process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || process.env.RESEND_API_KEY) {
      try {
        const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');
        // Escapa lo que escribe el cliente para que no pueda meter HTML/enlaces en los correos
        const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
          ? esc(addressParts.join(', '))
          : '(Sin dirección)';

        const html = `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
            <div style="background:#8B6C42;padding:20px 24px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;color:#fff;font-size:1.3rem">🛍️ Nuevo pedido recibido</h2>
            </div>
            <div style="border:1px solid #e0d6c8;border-top:none;border-radius:0 0 8px 8px;padding:24px">

              <p style="margin:0 0 4px"><strong>👤 Cliente:</strong> ${esc(customerName) || '—'}</p>
              <p style="margin:0 0 16px"><strong>📱 Teléfono:</strong> ${esc(customerPhone) || '—'}</p>
              <p style="margin:0 0 16px"><strong>📍 Dirección:</strong> ${addressLine}</p>
              ${customerNotes ? `<p style="margin:0 0 16px"><strong>📝 Nota:</strong> ${esc(customerNotes)}</p>` : ''}

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
        await sendEmail({
          to: STORE_EMAIL,
          subject: `🛍️ Nuevo pedido — ${customerName || 'Cliente'} (${fmt(total)})`,
          html,
        });

        // 2. Email de confirmación al comprador
        if (typeof customerEmail === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(customerEmail.trim())) {
          const customerHtml = `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;color:#333">
              <div style="background:#8B6C42;padding:20px 24px;border-radius:8px 8px 0 0">
                <h2 style="margin:0;color:#fff;font-size:1.3rem">🎉 ¡Gracias por tu pedido!</h2>
              </div>
              <div style="border:1px solid #e0d6c8;border-top:none;border-radius:0 0 8px 8px;padding:24px">

                <p style="margin:0 0 16px">Hola <strong>${esc(customerName) || 'cliente'}</strong>, recibimos tu pedido y estamos muy contentos de que hayas elegido <strong>Tienda de Pañuelos</strong>. 🧣</p>

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
                ${customerNotes ? `<p style="margin:4px 0 0"><strong>📝 Nota:</strong> ${esc(customerNotes)}</p>` : ''}

                <hr style="border:none;border-top:1px solid #e0d6c8;margin:20px 0">
                <p style="margin:0 0 8px;font-size:0.9rem">¿Tienes dudas? Escríbenos por WhatsApp:</p>
                <a href="https://wa.me/56991593102" style="display:inline-block;background:#25D366;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:0.9rem">💬 WhatsApp +56 9 9159 3102</a>

                <p style="margin:20px 0 0;font-size:0.78rem;color:#999">Este es un resumen automático de tu pedido. El pago se realiza de forma segura en MercadoPago, que te enviará su propio comprobante cuando se complete.</p>
              </div>
            </div>`;

          await sendEmail({
            to: customerEmail.trim(),
            subject: `✅ Confirmación de tu pedido — Tienda de Pañuelos`,
            html: customerHtml,
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
