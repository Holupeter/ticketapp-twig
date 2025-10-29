<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

// Twig loader: templates/ is sibling of public/
$loader = new FilesystemLoader(__DIR__ . '/../templates');
$twig = new Environment($loader, [
    'cache' => false, // set to a path in prod
    'debug' => true,
]);

// Basic router: map path to template
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalize trailing slash
$path = rtrim($path, '/');

switch ($path) {
    case '':
    case '/':
        echo $twig->render('pages/landing.twig');
        break;
    case '/auth/login':
        echo $twig->render('pages/auth-login.twig');
        break;
    case '/auth/signup':
        echo $twig->render('pages/auth-signup.twig');
        break;
    case '/dashboard':
        echo $twig->render('pages/dashboard.twig');
        break;
    case '/tickets':
        echo $twig->render('pages/tickets.twig');
        break;
    default:
        // 404
        header("HTTP/1.0 404 Not Found");
        echo $twig->render('pages/landing.twig', ['not_found' => true]);
        break;
}
