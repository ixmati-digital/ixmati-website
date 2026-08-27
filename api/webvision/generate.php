<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST');
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
  exit;
}

$raw = file_get_contents('php://input') ?: '';
if ($raw === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Payload vacío']);
  exit;
}

if (strlen($raw) > 200000) {
  http_response_code(413);
  echo json_encode(['ok' => false, 'error' => 'Solicitud demasiado grande']);
  exit;
}

$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($data) || $data === []) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'JSON inválido']);
  exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/ixmati_webvision_rate_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $ip);
$now = time();
$hits = [];
if (file_exists($rateFile)) {
  $hits = array_filter(array_map('intval', explode("\n", (string) file_get_contents($rateFile))), fn($hit) => $hit > $now - 60);
}
if (count($hits) >= 12) {
  http_response_code(429);
  echo json_encode(['ok' => false, 'error' => 'Demasiadas solicitudes']);
  exit;
}
$hits[] = $now;
file_put_contents($rateFile, implode("\n", $hits), LOCK_EX);

$payload = clean_payload($data);
$payload['receivedAt'] = gmdate('c');

try {
  $stored = store_lead($payload);
} catch (RuntimeException $exception) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el registro']);
  exit;
}

echo json_encode([
  'ok' => true,
  'stored' => $stored,
  'copy' => deterministic_copy(
    is_array($payload['answers'] ?? null) ? $payload['answers'] : [],
    is_array($payload['recommendation'] ?? null) ? $payload['recommendation'] : []
  ),
  'mode' => 'json_file'
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

function clean_text(mixed $value, int $max = 500): string {
  $value = trim((string) $value);
  $value = preg_replace('/[<>]/', '', $value) ?? '';
  $value = preg_replace('/\s+/', ' ', $value) ?? '';
  return mb_substr($value, 0, $max);
}

function clean_array(array $input): array {
  $output = [];
  foreach ($input as $key => $value) {
    $safeKey = preg_replace('/[^a-zA-Z0-9_.-]/', '', (string) $key);
    if ($safeKey === '') continue;
    if (is_array($value)) {
      $output[$safeKey] = clean_array($value);
    } elseif (is_bool($value) || is_numeric($value)) {
      $output[$safeKey] = $value;
    } else {
      $output[$safeKey] = clean_text($value);
    }
  }
  return $output;
}

function clean_payload(array $input): array {
  $blockedKeys = [
    'password' => true,
    'passwd' => true,
    'token' => true,
    'apikey' => true,
    'api_key' => true,
    'secret' => true,
    'cookie' => true,
    'cookies' => true,
    'authorization' => true
  ];
  $output = [];
  foreach ($input as $key => $value) {
    $safeKey = preg_replace('/[^a-zA-Z0-9_.-]/', '', (string) $key);
    if ($safeKey === '' || isset($blockedKeys[strtolower($safeKey)])) continue;
    if (is_array($value)) {
      $output[$safeKey] = clean_payload($value);
    } elseif (is_bool($value) || is_int($value) || is_float($value) || $value === null) {
      $output[$safeKey] = $value;
    } else {
      $output[$safeKey] = clean_text($value, 1200);
    }
  }
  return $output;
}

function store_lead(array $payload): bool {
  $file = resolve_leads_file();
  $dir = dirname($file);
  if (!is_dir($dir) && !mkdir($dir, 0775, true)) {
    throw new RuntimeException('Storage directory unavailable');
  }

  $handle = fopen($file, 'c+');
  if ($handle === false) {
    throw new RuntimeException('Storage file unavailable');
  }

  try {
    if (!flock($handle, LOCK_EX)) {
      throw new RuntimeException('Storage lock unavailable');
    }

    $raw = stream_get_contents($handle);
    $raw = is_string($raw) ? trim($raw) : '';
    if ($raw === '') {
      $records = [];
    } else {
      $records = json_decode($raw, true);
      if (json_last_error() !== JSON_ERROR_NONE || !is_array($records)) {
        $backup = $file . '.corrupt-' . gmdate('Ymd-His') . '.bak';
        copy($file, $backup);
        throw new RuntimeException('Storage JSON corrupt');
      }
    }

    if (has_duplicate_lead($records, $payload)) {
      flock($handle, LOCK_UN);
      fclose($handle);
      return false;
    }

    $records[] = $payload;
    $json = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (!is_string($json)) {
      throw new RuntimeException('Storage JSON encode failed');
    }

    ftruncate($handle, 0);
    rewind($handle);
    if (fwrite($handle, $json . PHP_EOL) === false) {
      throw new RuntimeException('Storage write failed');
    }
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return true;
  } catch (RuntimeException $exception) {
    flock($handle, LOCK_UN);
    fclose($handle);
    throw $exception;
  }
}

function resolve_leads_file(): string {
  $configured = getenv('WEBVISION_LEADS_FILE');
  if (is_string($configured) && $configured !== '') {
    return $configured;
  }

  $publicRoot = dirname(__DIR__, 2);
  $privateFile = dirname($publicRoot) . '/webvision-leads.json';
  $privateDir = dirname($privateFile);
  if (is_dir($privateDir) && is_writable($privateDir)) {
    return $privateFile;
  }

  $protectedDir = __DIR__ . '/webvision-data';
  protect_storage_dir($protectedDir);
  return $protectedDir . '/webvision-leads.json';
}

function protect_storage_dir(string $dir): void {
  if (!is_dir($dir)) {
    mkdir($dir, 0775, true);
  }
  $htaccess = $dir . '/.htaccess';
  if (!file_exists($htaccess)) {
    file_put_contents($htaccess, "Require all denied\nDeny from all\n", LOCK_EX);
  }
}

function has_duplicate_lead(array $records, array $payload): bool {
  $sessionId = lead_session_id($payload);
  $actionFinal = clean_text($payload['actionFinal'] ?? '', 120);
  if ($sessionId === '' || $actionFinal === '') return false;

  foreach ($records as $record) {
    if (!is_array($record)) continue;
    if (lead_session_id($record) === $sessionId && clean_text($record['actionFinal'] ?? '', 120) === $actionFinal) {
      return true;
    }
  }
  return false;
}

function lead_session_id(array $payload): string {
  if (isset($payload['session_id'])) return clean_text($payload['session_id'], 120);
  if (isset($payload['sessionId'])) return clean_text($payload['sessionId'], 120);
  if (isset($payload['id'])) return clean_text($payload['id'], 120);
  if (isset($payload['session']) && is_array($payload['session']) && isset($payload['session']['id'])) {
    return clean_text($payload['session']['id'], 120);
  }
  return '';
}

function deterministic_copy(array $answers, array $recommendation): string {
  $business = clean_text($answers['businessName'] ?? 'tu negocio', 80);
  $solution = clean_text($recommendation['customName'] ?? ($recommendation['solutionType'] ?? 'una solución web personalizada'), 180);
  return "Por lo que nos contaste, {$business} necesita {$solution}. La recomendación se calculó con reglas deterministas y puede ajustarse en una asesoría.";
}
