<?php
require_once 'get-db-connection.php';
require_once 'helper-functions.php';

// Adjust this path to point to where your .env file lives relative to routing.php
loadEnv(__DIR__ . '/../.env');

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Encrypt a string using AES-256-CBC.
 * @param string $plaintext The text to encrypt.
 * @return string Base64-encoded (IV + ciphertext).
 * @throws Exception If encryption fails or key is missing.
 */
function encryptDescription(string $plaintext): string {
    $key = getenv('ENCRYPTION_KEY_CALENDAR');
    if (empty($key)) {
        throw new Exception("ENCRYPTION_KEY_CALENDAR environment variable is not set.");
    }
    if (strlen($key) < 32) {
        throw new Exception("ENCRYPTION_KEY_CALENDAR must be at least 32 bytes (256 bits).");
    }

    $iv = openssl_random_pseudo_bytes(16); // 16 bytes for AES
    $ciphertext = openssl_encrypt(
        $plaintext,
        'AES-256-CBC',
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );
    if ($ciphertext === false) {
        throw new Exception("Encryption failed: " . openssl_error_string());
    }
    return base64_encode($iv . $ciphertext);
}

/* ---------------------------------------------------------------------------------------------------------------------- */

/**
 * Decrypt a string using AES-256-CBC.
 * @param string $encrypted Base64-encoded (IV + ciphertext).
 * @return string The decrypted plaintext.
 * @throws Exception If decryption fails or key is missing.
 */
function decryptDescription(string $encrypted): string {
    $key = getenv('ENCRYPTION_KEY_CALENDAR');
    if (empty($key)) {
        throw new Exception("ENCRYPTION_KEY_CALENDAR environment variable is not set.");
    }
    if (strlen($key) < 32) {
        throw new Exception("ENCRYPTION_KEY_CALENDAR must be at least 32 bytes (256 bits).");
    }

    $data = base64_decode($encrypted);
    if ($data === false) {
        throw new Exception("Invalid base64 encoding.");
    }

    $iv = substr($data, 0, 16);
    $ciphertext = substr($data, 16);
    $plaintext = openssl_decrypt(
        $ciphertext,
        'AES-256-CBC',
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );
    if ($plaintext === false) {
        throw new Exception("Decryption failed: " . openssl_error_string());
    }
    return $plaintext;
}

?>