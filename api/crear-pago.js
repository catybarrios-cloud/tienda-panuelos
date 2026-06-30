// Vercel Serverless Function — crea una preferencia de pago en MercadoPago
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  const { items, shippingName, shippingPrice, extras, customerName, customerPhone } = req.body;
  const preferenceItems = [];
  for (const item of (items || [])) {
    preferenceItems.push({ title: item.name, quantity: item.qty, unit_price: item.price, currency_id: 'CLP' });
  }
  if (shippingPrice > 0) preferenceItems.push({ title: shippingName || 'Despacho', quantity: 1, unit_price: shippingPrice, currency_id: 'CLP' });
  if (extras > 0) preferenceItems.push({ title: 'Bolsa de regalo', quantity: 1, unit_price: extras, currency_id: 'CLP' });

  const preference = {
    items: preferenceItems,
    payer: { name: customerName || '', phone: { number: customerPhone || '' } },
    back_urls: {
      success: 'https://tienda-panuelos.vercel.app/?pago=ok',
      failure: 'https://tienda-panuelos.vercel.app/?pago=error',
      pending: 'https://tienda-panuelos.vercel.app/?pago=pendiente',
    },
    auto_return: 'approved',
    statement_descriptor: 'TIENDA DE PANUELOS',
    payment_methods: { installments: 1 },
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.MP_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': Date.now() + '-' + Math.random(),
      },
      body: JSON.stringify(preference),
    });
    const data = await mpRes.json();
    if (!mpRes.ok) return res.status(500).json({ error: 'Error MP', detail: data });
    return res.json({ init_point: data.init_point, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno' });
  }
};
