<?php

function getConfig(): array {
    static $config = null;
    if ($config === null) {
        $configFile = __DIR__ . '/../app.config';
        if (!file_exists($configFile)) {
            throw new RuntimeException("Configuration file missing: {$configFile}");
        }
        $config = parse_ini_file($configFile, true); // true parses sections into multidimensional arrays
    }
    return $config;
}

/**
 * Custom function to parse and load a .env file into environment variables during developement. Can 
 *
 * @param string $filePath Absolute path to the .env file.
 */
function loadEnv(string $filePath): void {
    if (!file_exists($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comment lines
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        // Split into key and value by the first '='
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Remove surrounding quotes (single or double) if present
            if (preg_match('/^"(.*)"$/', $value, $matches) || preg_match("/^'(.*)'$/", $value, $matches)) {
                $value = $matches[1];
            }

            // Set environment variables if not already defined
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("$name=$value");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

?>