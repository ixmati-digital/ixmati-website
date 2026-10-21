<?php
declare(strict_types=1);

session_name('ixmati_shop_admin');
session_start();

header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__;
$storeFile = $baseDir . '/store-products.json';
$uploadDir = $baseDir . '/uploads/store';

const ADMINWEB_PASSWORD_HASH = '20206721cfd506f34f78198bceb9204cfcc8b4b343869e380787621f610a3d72';

function adminweb_users(): array {
  return [
    'supersu' => ['role' => 'superadmin'],
    'flor' => ['role' => 'flor']
  ];
}

function login_slug(string $username): string {
  $username = strtolower(trim($username));
  return explode('@', $username)[0] ?? $username;
}

function default_products(): array {
  return [
    [
      'id' => 'SHOP-001',
      'sku' => 'TAZA-PREM',
      'title' => 'Tazas y termos premium',
      'slug' => 'tazas-termos-premium',
      'category' => 'Tazas y termos',
      'type' => 'Personalizable',
      'description' => 'Sublimación envolvente, nombres y empaques listos para regalo.',
      'shortDescription' => 'Tazas, termos y cilindros personalizados.',
      'price' => 95,
      'priceMax' => 180,
      'priceLabel' => '$95 - $180',
      'unit' => 'pieza',
      'stock' => 50,
      'minQuantity' => 1,
      'status' => 'active',
      'featured' => true,
      'badge' => 'Nuevo',
      'image' => 'img/optimized/home/taza.webp',
      'gallery' => [],
      'variants' => ['Taza 11 oz', 'Termo metálico', 'Cilindro'],
      'sizes' => [],
      'materials' => ['Cerámica', 'Acero inoxidable', 'Plástico'],
      'finishes' => ['Sublimación', 'Impresión a color'],
      'customizableFields' => ['Logo', 'Nombre', 'Frase', 'Color'],
      'productionTime' => '3 a 5 días hábiles',
      'notes' => 'Confirmar disponibilidad de modelo y color antes de producir.',
      'tags' => ['regalos', 'empresas', 'personalizados'],
      'sortOrder' => 10
    ],
    [
      'id' => 'SHOP-002',
      'sku' => 'TEXTIL-DTF',
      'title' => 'Playeras y sudaderas',
      'slug' => 'playeras-sudaderas',
      'category' => 'Textil',
      'type' => 'Personalizable',
      'description' => 'DTF y vinil textil para tirajes cortos con colores vivos.',
      'shortDescription' => 'Prendas con logo, diseño o nombre.',
      'price' => 190,
      'priceMax' => 420,
      'priceLabel' => '$190 - $420',
      'unit' => 'pieza',
      'stock' => 40,
      'minQuantity' => 1,
      'status' => 'active',
      'featured' => true,
      'badge' => 'Top ventas',
      'image' => 'img/optimized/playera-bordada.webp',
      'gallery' => [],
      'variants' => ['Playera', 'Sudadera', 'Gorra'],
      'sizes' => ['CH', 'M', 'G', 'EG'],
      'materials' => ['Algodón', 'Poliéster', 'Mezcla'],
      'finishes' => ['DTF', 'Vinil textil', 'Bordado'],
      'customizableFields' => ['Logo', 'Texto', 'Talla', 'Color'],
      'productionTime' => '4 a 7 días hábiles',
      'notes' => 'Precio sujeto a prenda, talla, técnica y cantidad.',
      'tags' => ['uniformes', 'eventos', 'equipos'],
      'sortOrder' => 20
    ],
    [
      'id' => 'SHOP-003',
      'sku' => 'LONA-GF',
      'title' => 'Gran formato',
      'slug' => 'gran-formato',
      'category' => 'Lonas y vinil',
      'type' => 'Servicio',
      'description' => 'Lonas, vinil y microperforado con instalación supervisada.',
      'shortDescription' => 'Lonas, vinil y microperforado por medida.',
      'price' => 220,
      'priceMax' => 0,
      'priceLabel' => '$220 m2',
      'unit' => 'm2',
      'stock' => 999,
      'minQuantity' => 1,
      'status' => 'active',
      'featured' => true,
      'badge' => '',
      'image' => 'img/optimized/lona-impresa.webp',
      'gallery' => [],
      'variants' => ['Lona', 'Vinil impreso', 'Microperforado'],
      'sizes' => ['Por medida'],
      'materials' => ['Lona front', 'Vinil', 'Microperforado'],
      'finishes' => ['Bastilla', 'Ojillos', 'Laminado', 'Instalación'],
      'customizableFields' => ['Medida', 'Material', 'Archivo', 'Instalación'],
      'productionTime' => '2 a 5 días hábiles',
      'notes' => 'Confirmar archivo, medida final y zona de instalación.',
      'tags' => ['lonas', 'anuncios', 'fachadas'],
      'sortOrder' => 30
    ],
    [
      'id' => 'SHOP-004',
      'sku' => 'TARJ-PRES',
      'title' => 'Tarjetas de presentación',
      'slug' => 'tarjetas-presentacion',
      'category' => 'Impresión',
      'type' => 'Producto',
      'description' => 'Tarjetas de presentación con acabados limpios para negocios y profesionistas.',
      'shortDescription' => 'Tarjetas impresas por paquete.',
      'price' => 380,
      'priceMax' => 0,
      'priceLabel' => 'Desde $380',
      'unit' => 'paquete',
      'stock' => 100,
      'minQuantity' => 1,
      'status' => 'active',
      'featured' => false,
      'badge' => '',
      'image' => 'img/optimized/graficos-impresos.webp',
      'gallery' => [],
      'variants' => ['Mate', 'Brillante', 'Premium'],
      'sizes' => ['9 x 5 cm'],
      'materials' => ['Cartulina sulfatada', 'Opalina', 'Couché'],
      'finishes' => ['Frente', 'Frente y vuelta', 'Laminado'],
      'customizableFields' => ['Nombre', 'Puesto', 'Teléfono', 'Logo'],
      'productionTime' => '2 a 4 días hábiles',
      'notes' => 'Pedir datos finales y revisar ortografía antes de imprimir.',
      'tags' => ['tarjetas', 'negocios', 'impresión'],
      'sortOrder' => 40
    ]
  ];
}

function default_store(): array {
  return ['products' => default_products(), 'updatedAt' => gmdate('c')];
}

function read_store(string $storeFile): array {
  if (!file_exists($storeFile)) {
    $data = default_store();
    write_store($storeFile, $data);
    return $data;
  }

  $raw = file_get_contents($storeFile);
  $data = json_decode($raw ?: '', true);
  if (!is_array($data)) {
    return default_store();
  }
  if (!isset($data['products']) || !is_array($data['products'])) {
    $data['products'] = [];
  }
  if (!isset($data['updatedAt'])) {
    $data['updatedAt'] = gmdate('c');
  }

  // Replace the three legacy catalog placeholders when the saved Hostinger
  // store predates the product-specific imagery shipped with the site.
  $catalogImages = [
    'SHOP-001' => ['img/ixmati/galeria-banner.jpg', 'img/optimized/home/taza.webp'],
    'SHOP-002' => ['img/ixmati/galeria-lona-vinil.jpg', 'img/optimized/playera-bordada.webp'],
    'SHOP-003' => ['img/ixmati/hero-lona-stand.jpg', 'img/optimized/lona-impresa.webp']
  ];
  $migrated = false;
  foreach ($data['products'] as &$product) {
    $id = $product['id'] ?? '';
    if (isset($catalogImages[$id]) && ($product['image'] ?? '') === $catalogImages[$id][0]) {
      $product['image'] = $catalogImages[$id][1];
      $migrated = true;
    }
  }
  unset($product);
  if ($migrated) {
    write_store($storeFile, $data);
  }
  return $data;
}

function write_store(string $storeFile, array $data): void {
  $data['updatedAt'] = gmdate('c');
  if (!is_dir(dirname($storeFile))) {
    mkdir(dirname($storeFile), 0775, true);
  }
  file_put_contents($storeFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function json_body(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);
  return is_array($data) ? $data : [];
}

function is_admin(): bool {
  return !empty($_SESSION['shop_admin']);
}

function require_admin(): void {
  if (!is_admin()) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
  }
}

function clean_text($value): string {
  return trim((string)$value);
}

function clean_list($value): array {
  if (is_array($value)) {
    $items = $value;
  } else {
    $items = preg_split('/[\n,]+/', (string)$value);
  }
  return array_values(array_filter(array_map(fn($item) => trim((string)$item), $items), fn($item) => $item !== ''));
}

function slugify(string $value): string {
  $value = iconv('UTF-8', 'ASCII//TRANSLIT', $value) ?: $value;
  $value = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $value));
  return trim($value ?: 'producto', '-');
}

function clean_file_name(string $value): string {
  $value = preg_replace('/[^a-zA-Z0-9._-]+/', '-', $value);
  return trim($value ?: 'archivo', '-');
}

function normalize_product(array $input, ?array $existing = null): array {
  $title = clean_text($input['title'] ?? ($existing['title'] ?? 'Producto sin título'));
  $id = clean_text($input['id'] ?? ($existing['id'] ?? ''));
  if ($id === '') {
    $id = 'SHOP-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
  }

  $slug = clean_text($input['slug'] ?? ($existing['slug'] ?? ''));
  if ($slug === '') {
    $slug = slugify($title);
  }

  $price = (float)($input['price'] ?? ($existing['price'] ?? 0));
  $priceMax = (float)($input['priceMax'] ?? ($existing['priceMax'] ?? 0));
  $priceLabel = clean_text($input['priceLabel'] ?? ($existing['priceLabel'] ?? ''));
  if ($priceLabel === '') {
    $priceLabel = $priceMax > $price ? '$' . number_format($price, 0) . ' - $' . number_format($priceMax, 0) : 'Desde $' . number_format($price, 0);
  }

  return [
    'id' => $id,
    'sku' => clean_text($input['sku'] ?? ($existing['sku'] ?? '')),
    'title' => $title,
    'slug' => $slug,
    'category' => clean_text($input['category'] ?? ($existing['category'] ?? 'General')),
    'type' => clean_text($input['type'] ?? ($existing['type'] ?? 'Producto')),
    'description' => clean_text($input['description'] ?? ($existing['description'] ?? '')),
    'shortDescription' => clean_text($input['shortDescription'] ?? ($existing['shortDescription'] ?? '')),
    'price' => $price,
    'priceMax' => $priceMax,
    'priceLabel' => $priceLabel,
    'unit' => clean_text($input['unit'] ?? ($existing['unit'] ?? 'pieza')),
    'stock' => max(0, (int)($input['stock'] ?? ($existing['stock'] ?? 0))),
    'minQuantity' => max(1, (int)($input['minQuantity'] ?? ($existing['minQuantity'] ?? 1))),
    'status' => clean_text($input['status'] ?? ($existing['status'] ?? 'draft')) === 'active' ? 'active' : 'draft',
    'featured' => (bool)($input['featured'] ?? ($existing['featured'] ?? false)),
    'badge' => clean_text($input['badge'] ?? ($existing['badge'] ?? '')),
    'image' => clean_text($input['image'] ?? ($existing['image'] ?? '')),
    'gallery' => clean_list($input['gallery'] ?? ($existing['gallery'] ?? [])),
    'variants' => clean_list($input['variants'] ?? ($existing['variants'] ?? [])),
    'sizes' => clean_list($input['sizes'] ?? ($existing['sizes'] ?? [])),
    'materials' => clean_list($input['materials'] ?? ($existing['materials'] ?? [])),
    'finishes' => clean_list($input['finishes'] ?? ($existing['finishes'] ?? [])),
    'customizableFields' => clean_list($input['customizableFields'] ?? ($existing['customizableFields'] ?? [])),
    'productionTime' => clean_text($input['productionTime'] ?? ($existing['productionTime'] ?? '')),
    'notes' => clean_text($input['notes'] ?? ($existing['notes'] ?? '')),
    'tags' => clean_list($input['tags'] ?? ($existing['tags'] ?? [])),
    'sortOrder' => (int)($input['sortOrder'] ?? ($existing['sortOrder'] ?? 100)),
    'updatedAt' => gmdate('c')
  ];
}

function public_products(array $store): array {
  $products = array_values(array_filter($store['products'], fn($product) => ($product['status'] ?? 'draft') === 'active'));
  usort($products, fn($a, $b) => ($a['sortOrder'] ?? 100) <=> ($b['sortOrder'] ?? 100));
  return $products;
}

$method = $_SERVER['REQUEST_METHOD'];
$store = read_store($storeFile);

if ($method === 'GET') {
  $admin = isset($_GET['admin']);
  if ($admin && !is_admin()) {
    http_response_code(401);
    echo json_encode(['authenticated' => false, 'products' => []]);
    exit;
  }
  echo json_encode([
    'authenticated' => is_admin(),
    'products' => $admin ? $store['products'] : public_products($store),
    'updatedAt' => $store['updatedAt']
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if ($method !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Método no permitido']);
  exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'login') {
  $username = login_slug((string)($_POST['username'] ?? ''));
  $password = trim((string)($_POST['password'] ?? ''));
  $users = adminweb_users();
  if (isset($users[$username]) && hash_equals(ADMINWEB_PASSWORD_HASH, hash('sha256', $password))) {
    $_SESSION['shop_admin'] = true;
    $_SESSION['shop_admin_user'] = ['username' => $username, 'role' => $users[$username]['role']];
    echo json_encode(['authenticated' => true, 'user' => $_SESSION['shop_admin_user']]);
    exit;
  }
  http_response_code(401);
  echo json_encode(['error' => 'Usuario o contraseña incorrectos']);
  exit;
}

if ($action === 'logout') {
  $_SESSION = [];
  session_destroy();
  echo json_encode(['authenticated' => false]);
  exit;
}

if ($action === 'uploadImage') {
  require_admin();
  if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió imagen']);
    exit;
  }

  $mime = mime_content_type($_FILES['image']['tmp_name']) ?: '';
  $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
  if (!isset($allowed[$mime])) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato no permitido. Usa JPG, PNG o WEBP.']);
    exit;
  }

  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
  }

  $safeName = time() . '-' . clean_file_name((string)$_FILES['image']['name']);
  $target = $uploadDir . '/' . $safeName;
  if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar la imagen']);
    exit;
  }

  echo json_encode(['path' => 'api/uploads/store/' . rawurlencode($safeName)]);
  exit;
}

$body = json_body();
$action = $body['action'] ?? $action;

if ($action === 'saveProduct') {
  require_admin();
  $input = is_array($body['product'] ?? null) ? $body['product'] : [];
  $id = clean_text($input['id'] ?? '');
  $existingIndex = null;
  $existing = null;

  foreach ($store['products'] as $index => $product) {
    if (($product['id'] ?? '') === $id && $id !== '') {
      $existingIndex = $index;
      $existing = $product;
      break;
    }
  }

  $product = normalize_product($input, $existing);
  if ($existingIndex === null) {
    $store['products'][] = $product;
  } else {
    $store['products'][$existingIndex] = $product;
  }

  write_store($storeFile, $store);
  echo json_encode(['product' => $product, 'products' => $store['products']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

if ($action === 'deleteProduct') {
  require_admin();
  $id = clean_text($body['id'] ?? '');
  $store['products'] = array_values(array_filter($store['products'], fn($product) => ($product['id'] ?? '') !== $id));
  write_store($storeFile, $store);
  echo json_encode(['products' => $store['products']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

http_response_code(400);
echo json_encode(['error' => 'Solicitud inválida']);
