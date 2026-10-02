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
 * - nuevo: true  → muestra la etiqueta "Nuevo" y lo pone primero en su colección
 * - fotoModelo: true → (accesorios) la foto llena toda la tarjeta, como los pañuelos;
 *   úsalo cuando la foto es vertical y trae modelo. Sin esto, la foto se ve completa en un cuadrado blanco.
 */
const PRODUCTS = [
  // Colección Premium (modelos 1–6) — 90x90 cm
  { id: 23, collection: 'premium', name: 'Primavera',     desc: '90×90 cm · Flores multicolor con borde azul marino', price: 9500, image: 'imagenes/modelo14.jpg', emoji: '🌺', nuevo: true },
  { id: 24, collection: 'premium', name: 'Lunares de Sol', desc: '90×90 cm · Lunares en amarillo pastel',            price: 9500, image: 'imagenes/modelo15.jpg', emoji: '🌼', nuevo: true },
  { id: 25, collection: 'premium', name: 'Flor de Agua',  desc: '90×90 cm · Flores azules en acuarela',               price: 9500, image: 'imagenes/modelo16.jpg', emoji: '💙', nuevo: true },
  { id: 30, collection: 'premium', name: 'Lunares Rosé',  desc: '90×90 cm · Lunares café sobre rosa',                 price: 9500, image: 'imagenes/modelo19.jpg', emoji: '🩷', nuevo: true },
  { id: 1,  collection: 'premium', name: 'Jardín en Flor', desc: '90×90 cm · Flores en rosa y azul', price: 9500, image: 'imagenes/modelo1.jpg', image2: 'imagenes/modelo1_2.jpg', emoji: '🌸' },
  { id: 2,  collection: 'premium', name: 'Rosa Marina',   desc: '90×90 cm · Rosa en azul marino',   price: 9500, image: 'imagenes/modelo2.jpg', image2: 'imagenes/modelo2_2.jpg', emoji: '🌹' },
  { id: 3,  collection: 'premium', name: 'Neblina',       desc: '90×90 cm · Abstracto en grises',   price: 9500, image: 'imagenes/modelo3.jpg', image2: 'imagenes/modelo3_2.jpg', emoji: '🖤' },
  { id: 4,  collection: 'premium', name: 'Paleta Viva',   desc: '90×90 cm · Colores audaces',       price: 9500, image: 'imagenes/modelo4.jpg', image2: 'imagenes/modelo4_2.jpg', emoji: '🎨' },
  { id: 5,  collection: 'premium', name: 'Impresionismo', desc: '90×90 cm · Tropical verde y azul', price: 9500, image: 'imagenes/modelo5.jpg', image2: 'imagenes/modelo5_2.jpg', emoji: '🌿' },
  { id: 6,  collection: 'premium', name: 'Bloom',         desc: '90×90 cm · Flores pop modernas',   price: 9500, image: 'imagenes/modelo6.jpg', image2: 'imagenes/modelo6_2.jpg', emoji: '✨' },
  // Colección Clásica (modelos 7–12) — 65x65 cm
  { id: 26, collection: 'clasica', name: 'Magnolia',      desc: '65×65 cm · Flores blancas y mostaza en gris',  price: 7500, image: 'imagenes/modelo17.jpg', emoji: '🌼', nuevo: true },
  { id: 27, collection: 'clasica', name: 'Atardecer',     desc: '65×65 cm · Acuarela turquesa y naranja',       price: 7500, image: 'imagenes/modelo18.jpg', emoji: '🌅', nuevo: true },
  { id: 7,  collection: 'clasica', name: 'Acuarela',      desc: '65×65 cm · Acuarela pastel',       price: 7500, image: 'imagenes/modelo7.jpg',  image2: 'imagenes/modelo7_2.jpg',  emoji: '🎨' },
  { id: 10, collection: 'clasica', name: 'Cielo Azul',    desc: '65×65 cm · Manchas azules',        price: 7500, image: 'imagenes/modelo10.jpg', image2: 'imagenes/modelo10_2.jpg', emoji: '💙' },
  { id: 11, collection: 'clasica', name: 'Cebra',         desc: '65×65 cm · Cebra blanco y negro',  price: 7500, image: 'imagenes/modelo11.jpg', image2: 'imagenes/modelo11_2.jpg', emoji: '🖤' },
  { id: 19, collection: 'clasica', name: 'Cielo Sereno',  desc: '65×65 cm · Azul celeste con bordado',  price: 7500, image: 'imagenes/modelo13.jpg', image2: 'imagenes/modelo13.jpg',   emoji: '🩵' },
  // Accesorios
  { id: 28, collection: 'accesorios', name: 'Aros Flor Nácar',       desc: 'Flor nacarada con centro dorado · Delicados y primaverales', price: 4500, image: 'imagenes/aro6.jpg', emoji: '🌸', nuevo: true, fotoModelo: true },
  { id: 29, collection: 'accesorios', name: 'Aros Racimo de Perlas', desc: 'Argolla dorada con perlas · Románticos y elegantes',          price: 4500, image: 'imagenes/aro7.jpg', emoji: '🤍', nuevo: true, fotoModelo: true },
  { id: 31, collection: 'accesorios', name: 'Aros Ópalo Brillante',  desc: 'Piedra blanca cuadrada con borde de brillos · Elegantes y luminosos', price: 4500, image: 'imagenes/aro8.jpg',  emoji: '🤍', nuevo: true, fotoModelo: true },
  { id: 32, collection: 'accesorios', name: 'Aros Triple Argolla',   desc: 'Tres argollas doradas unidas · Modernos y con estilo',                price: 4500, image: 'imagenes/aro9.jpg',  emoji: '✨', nuevo: true, fotoModelo: true },
  { id: 33, collection: 'accesorios', name: 'Aros Ónix Brillante',   desc: 'Piedra negra cuadrada con borde de brillos · Clásicos y sofisticados', price: 4500, image: 'imagenes/aro10.jpg', emoji: '🖤', nuevo: true, fotoModelo: true },
  { id: 34, collection: 'accesorios', name: 'Aros Gota de Perla',    desc: 'Gota dorada con perla · Delicados y modernos',                        price: 4500, image: 'imagenes/aro11.jpg', emoji: '💧', nuevo: true, fotoModelo: true },
  { id: 35, collection: 'accesorios', name: 'Aros Media Luna',       desc: 'Argolla dorada gruesa con textura · Chic para todos los días',        price: 4500, image: 'imagenes/aro12.jpg', emoji: '🌙', nuevo: true, fotoModelo: true },
  { id: 13, collection: 'accesorios', name: 'Aros Perla Dorada',   desc: 'Perla central con base circular dorada · Elegantes y versátiles', price: 4500, image: 'imagenes/aro1_modelo.jpg', emoji: '⭕', fotoModelo: true },
  { id: 14, collection: 'accesorios', name: 'Aros Marfil Dorado',  desc: 'Diseño cuadrado marfil con marco dorado · Sofisticados y modernos', price: 4500, image: 'imagenes/aro3_modelo.jpg', emoji: '🟡', fotoModelo: true },
  { id: 15, collection: 'accesorios', name: 'Aros Nudos Dorados',  desc: 'Forma orgánica trenzada en dorado mate · Con carácter y estilo',   price: 4500, image: 'imagenes/aro4_modelo.jpg', emoji: '✨', fotoModelo: true },
  { id: 16, collection: 'accesorios', name: 'Aros Argolla Doble',  desc: 'Argolla con textura y brillo dorado · Diseño minimalista y chic',  price: 4500, image: 'imagenes/aro5_modelo.jpg', emoji: '💛', fotoModelo: true },
  { id: 17, collection: 'accesorios', name: 'Aros Flor de Perlas', desc: 'Flor de perlas delicadas · Románticos y femeninos',                 price: 4500, image: 'imagenes/aro2_modelo.jpg', emoji: '🌸', fotoModelo: true },
  { id: 18, collection: 'accesorios', name: 'Pasador de Pañuelo',  desc: 'Perla con base cruzada dorada · Complemento perfecto para tu pañuelo', price: 4800, image: 'imagenes/pasador1_modelo.jpg', emoji: '💎', fotoModelo: true },
  { id: 20, collection: 'accesorios', name: 'Pasador Flor Blanca', desc: 'Camelia blanca con perla central · Elegante y delicado',               price: 4800, image: 'imagenes/pasador2.jpg', emoji: '🌸' },
  { id: 21, collection: 'accesorios', name: 'Pasador Flor Negra',  desc: 'Camelia negra con perla central · Sofisticado y moderno',              price: 4800, image: 'imagenes/pasador3.jpg', emoji: '🖤' },
  { id: 22, collection: 'accesorios', name: 'Pasador Cruz Dorada', desc: 'Cruz dorada minimalista · Estilo contemporáneo y versátil',            price: 4800, image: 'imagenes/pasador4.jpg', emoji: '✨' },
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
