<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
  exit;
}

$raw = file_get_contents('php://input') ?: '';
if (strlen($raw) > 180000) {
  http_response_code(413);
  echo json_encode(['ok' => false, 'error' => 'Solicitud demasiado grande']);
  exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
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

$sessionId = clean_text($data['id'] ?? '');
$answers = is_array($data['answers'] ?? null) ? clean_array($data['answers']) : [];
$recommendation = is_array($data['recommendation'] ?? null) ? clean_array($data['recommendation']) : [];
$actionFinal = clean_text($data['actionFinal'] ?? '');

$stored = store_fallback([
  'sessionId' => $sessionId,
  'answers' => $answers,
  'recommendation' => $recommendation,
  'actionFinal' => $actionFinal,
  'createdAt' => gmdate('c')
]);

$aiCopy = deterministic_copy($answers, $recommendation);
$openAiKey = getenv('OPENAI_API_KEY') ?: '';
if ($openAiKey !== '') {
  $generated = try_openai_copy($openAiKey, $answers, $recommendation);
  if ($generated !== '') {
    $aiCopy = $generated;
  }
}

echo json_encode([
  'ok' => true,
  'stored' => $stored,
  'copy' => $aiCopy,
  'mode' => $openAiKey !== '' ? 'ai_or_fallback' : 'deterministic_fallback'
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

function store_fallback(array $payload): bool {
  $dir = dirname(__DIR__) . '/webvision-data';
  if (!is_dir($dir)) {
    mkdir($dir, 0775, true);
  }
  $file = $dir . '/events.jsonl';
  return file_put_contents($file, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL, FILE_APPEND | LOCK_EX) !== false;
}

function deterministic_copy(array $answers, array $recommendation): string {
  $business = clean_text($answers['businessName'] ?? 'tu negocio', 80);
  $solution = clean_text($recommendation['customName'] ?? ($recommendation['solutionType'] ?? 'una solución web personalizada'), 180);
  return "Por lo que nos contaste, {$business} necesita {$solution}. La recomendación se calculó con reglas deterministas y puede ajustarse en una asesoría.";
}

function try_openai_copy(string $apiKey, array $answers, array $recommendation): string {
  $prompt = [
    'model' => getenv('WEBVISION_AI_MODEL') ?: 'gpt-4.1-mini',
    'messages' => [
      [
        'role' => 'system',
        'content' => 'Redacta un diagnóstico comercial breve en español. No inventes precios, funciones ni tiempos. Usa solo los datos proporcionados.'
      ],
      [
        'role' => 'user',
        'content' => json_encode(['answers' => $answers, 'recommendation' => $recommendation], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
      ]
    ],
    'temperature' => 0.4,
    'max_tokens' => 180
  ];

  $ch = curl_init('https://api.openai.com/v1/chat/completions');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_POSTFIELDS => json_encode($prompt, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 12
  ]);
  $response = curl_exec($ch);
  $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  curl_close($ch);
  if ($status < 200 || $status >= 300 || !is_string($response)) return '';
  $decoded = json_decode($response, true);
  return clean_text($decoded['choices'][0]['message']['content'] ?? '', 900);
}
