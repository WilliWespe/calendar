<?php
// Get PDO connection
function getPDO(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $host = getenv('DB_HOST') ?: 'localhost';
        $db   = getenv('DB_NAME') ?: 'calendar';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";

        $pdo = new PDO(
            $dsn,
            $user,
            $pass,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}
?>