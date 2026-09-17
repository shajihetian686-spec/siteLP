<?php
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method']);
  exit;
}

if (!empty($_POST['website'])) {
  echo json_encode(['ok' => true]);
  exit;
}

function field($key) {
  return trim((string) ($_POST[$key] ?? ''));
}

function header_safe($value) {
  return str_replace(["\r", "\n", "\0"], '', $value);
}

$name = field('name');
$company = field('company');
$email = field('email');
$tel = field('tel');
$message = field('message');

if ($name === '' || $email === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'required']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'email']);
  exit;
}

$admin = 'sp@taisei.sh';
$from = 'sp@taisei.sh';

$subject = '【ホームページ制作】お問い合わせ';

$lines = [
  'ホームページ制作LPからお問い合わせがありました。',
  '',
  'お名前: ' . $name,
  '会社名・団体名: ' . ($company !== '' ? $company : '（未入力）'),
  'メールアドレス: ' . $email,
  '電話番号: ' . ($tel !== '' ? $tel : '（未入力）'),
  '',
  'ご相談内容:',
  $message,
];
$body = implode("\n", $lines) . "\n";

if (function_exists('mb_language')) {
  mb_language('Japanese');
  mb_internal_encoding('UTF-8');
}

function send_text_mail($to, $subjectLine, $text, $replyTo) {
  global $from;
  $encoded = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader($subjectLine, 'UTF-8')
    : $subjectLine;
  $headers = implode("\r\n", [
    'From: ' . $from,
    'Reply-To: ' . header_safe($replyTo),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ]);
  return @mail($to, $encoded, $text, $headers, '-f' . $from);
}

$sent = send_text_mail($admin, $subject, $body, $email);

if (!$sent) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'send']);
  exit;
}

$thanksSubject = '【システムハウジングタイセイ】お問い合わせを受け付けました';
$thanksLines = [
  $name . ' 様',
  '',
  'ホームページ制作に関するお問い合わせを受け付けました。',
  '内容を確認のうえ、担当者よりご連絡いたします。',
  '',
  '―― 送信内容 ――',
  'お名前: ' . $name,
  '会社名・団体名: ' . ($company !== '' ? $company : '（未入力）'),
  'メールアドレス: ' . $email,
  '電話番号: ' . ($tel !== '' ? $tel : '（未入力）'),
  '',
  'ご相談内容:',
  $message,
  '',
  '――――――――――',
  '有限会社システムハウジングタイセイ',
  '〒820-0001 福岡県飯塚市鯰田1716-1',
  'Tel. 0948-23-5156',
  'https://taisei.sh/website/',
];
$thanksBody = implode("\n", $thanksLines) . "\n";
send_text_mail($email, $thanksSubject, $thanksBody, $admin);

echo json_encode(['ok' => true]);
