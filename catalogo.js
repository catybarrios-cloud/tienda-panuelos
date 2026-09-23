// Catálogo de la tienda: productos, despachos y extras.
// Lo usa la página (index.html) Y el servidor de pagos (api/crear-pago.js),
// así el precio que se cobra siempre sale de aquí y no del navegador del cliente.
// Para cambiar un precio o agregar un producto, edita SOLO este archivo.

/* ─── PRODUCTOS ─── */
/*
 * ⚠️ Personaliza cada producto:
 * - name: Nombre que le das al modelo
 * - desc: Descripción breve del material/estilo
 * - price: Precio en pesos (número sin puntos)
 * - image: URL de la foto del producto (o deja '' para placeholder)
 * - emoji: Emoji decorativo del placeholder
 */
const PRODUCTS = [
  // Colección Premium (modelos 1–6) — 90x90 cm
  { id: 1,  collection: 'premium', name: 'Jardín en Flor', desc: '90×90 cm · Flores en rosa y azul', price: 9500, image: 'imagenes/modelo1.jpg', image2: 'imagenes/modelo1_2.jpg', emoji: '🌸' },
  { id: 2,  collection: 'premium', name: 'Rosa Marina',   desc: '90×90 cm · Rosa en azul marino',   price: 9500, image: 'imagenes/modelo2.jpg', image2: 'imagenes/modelo2_2.jpg', emoji: '🌹' },
  { id: 3,  collection: 'premium', name: 'Neblina',       desc: '90×90 cm · Abstracto en grises',   price: 9500, image: 'imagenes/modelo3.jpg', image2: 'imagenes/modelo3_2.jpg', emoji: '🖤' },
  { id: 4,  collection: 'premium', name: 'Paleta Viva',   desc: '90×90 cm · Colores audaces',       price: 9500, image: 'imagenes/modelo4.jpg', image2: 'imagenes/modelo4_2.jpg', emoji: '🎨' },
  { id: 5,  collection: 'premium', name: 'Impresionismo', desc: '90×90 cm · Tropical verde y azul', price: 9500, image: 'imagenes/modelo5.jpg', image2: 'imagenes/modelo5_2.jpg', emoji: '🌿' },
  { id: 6,  collection: 'premium', name: 'Bloom',         desc: '90×90 cm · Flores pop modernas',   price: 9500, image: 'imagenes/modelo6.jpg', image2: 'imagenes/modelo6_2.jpg', emoji: '✨' },
  // Colección Clásica (modelos 7–12) — 65x65 cm
  { id: 7,  collection: 'clasica', name: 'Acuarela',      desc: '65×65 cm · Acuarela pastel',       price: 7500, image: 'imagenes/modelo7.jpg',  image2: 'imagenes/modelo7_2.jpg',  emoji: '🎨' },
  { id: 8,  collection: 'clasica', name: 'Leopardo',      desc: '65×65 cm · Animal print leopardo', price: 7500, image: 'imagenes/modelo8.jpg',  image2: 'imagenes/modelo8_2.jpg',  emoji: '🐆' },
  { id: 9,  collection: 'clasica', name: 'Cerezo',        desc: '65×65 cm · Cerezos en menta',      price: 7500, image: 'imagenes/modelo9.jpg',  image2: 'imagenes/modelo9_2.jpg',  emoji: '🌸' },
  { id: 10, collection: 'clasica', name: 'Cielo Azul',    desc: '65×65 cm · Manchas azules',        price: 7500, image: 'imagenes/modelo10.jpg', image2: 'imagenes/modelo10_2.jpg', emoji: '💙' },
  { id: 11, collection: 'clasica', name: 'Cebra',         desc: '65×65 cm · Cebra blanco y negro',  price: 7500, image: 'imagenes/modelo11.jpg', image2: 'imagenes/modelo11_2.jpg', emoji: '🖤' },
  { id: 12, collection: 'clasica', name: 'Paraíso',       desc: '65×65 cm · Flores tropicales',     price: 7500, image: 'imagenes/modelo12.jpg', image2: 'imagenes/modelo12_2.jpg', emoji: '🌺' },
  { id: 19, collection: 'clasica', name: 'Cielo Sereno',  desc: '65×65 cm · Azul celeste con bordado',  price: 7500, image: 'imagenes/modelo13.jpg', image2: 'imagenes/modelo13.jpg',   emoji: '🩵' },
  // Accesorios
  { id: 13, collection: 'accesorios', name: 'Aros Perla Dorada',   desc: 'Perla central con base circular dorada · Elegantes y versátiles', price: 4500, image: 'imagenes/aro1.jpg', image2: 'imagenes/aro1_m.jpg', emoji: '⭕' },
  { id: 14, collection: 'accesorios', name: 'Aros Marfil Dorado',  desc: 'Diseño cuadrado marfil con marco dorado · Sofisticados y modernos', price: 4500, image: 'imagenes/aro3.jpg', image2: 'imagenes/aro3_m.jpg', emoji: '🟡' },
  { id: 15, collection: 'accesorios', name: 'Aros Nudos Dorados',  desc: 'Forma orgánica trenzada en dorado mate · Con carácter y estilo',   price: 4500, image: 'imagenes/aro4.jpg', image2: 'imagenes/aro4_m.jpg', emoji: '✨' },
  { id: 16, collection: 'accesorios', name: 'Aros Argolla Doble',  desc: 'Argolla con textura y brillo dorado · Diseño minimalista y chic',  price: 4500, image: 'imagenes/aro5.jpg', image2: 'imagenes/aro5_m.jpg', emoji: '💛' },
  { id: 17, collection: 'accesorios', name: 'Aros Flor de Perlas', desc: 'Flor de perlas delicadas · Románticos y femeninos',                 price: 4500, image: 'imagenes/aro2.jpg', image2: 'imagenes/aro2_m.jpg', emoji: '🌸' },
  { id: 18, collection: 'accesorios', name: 'Pasador de Pañuelo',  desc: 'Perla con base cruzada dorada · Complemento perfecto para tu pañuelo', price: 4800, image: 'imagenes/pasador1.jpg', image2: 'imagenes/pasador1_m.jpg', emoji: '💎' },
  { id: 20, collection: 'accesorios', name: 'Pasador Flor Blanca', desc: 'Camelia blanca con perla central · Elegante y delicado',               price: 4800, image: 'imagenes/pasador2.jpg', image2: 'imagenes/pasador2.jpg', emoji: '🌸' },
  { id: 21, collection: 'accesorios', name: 'Pasador Flor Negra',  desc: 'Camelia negra con perla central · Sofisticado y moderno',              price: 4800, image: 'imagenes/pasador3.jpg', image2: 'imagenes/pasador3.jpg', emoji: '🖤' },
  { id: 22, collection: 'accesorios', name: 'Pasador Cruz Dorada', desc: 'Cruz dorada minimalista · Estilo contemporáneo y versátil',            price: 4800, image: 'imagenes/pasador4.jpg', image2: 'imagenes/pasador4.jpg', emoji: '✨' },
];

const SHIPPING_OPTIONS = [
  { id: 'concepcion', name: 'Despacho gratis en Pedro de Valdivia, Lonco y Villuco', desc: 'Solo en estos sectores · Coordinamos día y hora contigo por WhatsApp',              price: 0,    icon: '📍' },
  { id: 'copec',      name: 'Retiro en Punto Blue Express', desc: 'Retiras en el punto más cercano a ti (Copec, farmacias y más) · Todo Chile · Más económico',    price: 2490, icon: '📌' },
  { id: 'courier',    name: 'Despacho a domicilio Blue Express', desc: 'Te llega a la puerta de tu casa · Todo Chile · 3–5 días hábiles', price: 4990, icon: '📦' },
];

// Extras opcionales
const EXTRAS = [
  { id: 'giftbag', name: 'Bolsa de regalo 🎁', desc: 'Empaque especial para regalo', price: 1000 },
];

// Permite que el servidor (Node) lea este mismo archivo
if (typeof module !== 'undefined') {
  module.exports = { PRODUCTS, SHIPPING_OPTIONS, EXTRAS };
}
