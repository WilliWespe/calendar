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

?>