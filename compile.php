<?php
require_once __DIR__ . '/vendor/autoload.php'; // Composer autoloader

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

// 1. Point to the templates folder
$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig = new Environment($loader);

// 2. Map templates to output files
$pages = [
    'pages/landing.twig' => 'dist/index.html',
    'pages/auth-login.twig' => 'dist/login.html',
    'pages/auth-signup.twig' => 'dist/signup.html',
    'pages/dashboard.twig' => 'dist/dashboard.html',
    'pages/tickets.twig' => 'dist/tickets.html',
];

// 3. Ensure dist folder exists
if (!file_exists(__DIR__ . '/dist')) {
    mkdir(__DIR__ . '/dist', 0777, true);
}

// 4. Compile templates
foreach ($pages as $template => $outputFile) {
    $html = $twig->render($template, []); // You can pass variables here
    file_put_contents(__DIR__ . '/' . $outputFile, $html);
    echo "Compiled $template -> $outputFile\n";
}
