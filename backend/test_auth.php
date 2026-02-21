<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

// 1. Simulate Login
echo "Simulating Login for admin@seveninc.com...\n";
$response = $kernel->handle(
    $request = Request::create('/api/auth/login', 'POST', [
        'email' => 'admin@seveninc.com',
        'password' => 'password123',
    ])
);

$data = json_decode($response->getContent(), true);
if (isset($data['data']['token'])) {
    $token = $data['data']['token'];
    echo "Login Successful! Token: $token\n";

    // 2. Simulate Authenticated Request
    echo "Simulating Access to /api/operator/data with Token...\n";
    $request = Request::create('/api/operator/data', 'GET');
    $request->headers->set('Authorization', 'Bearer ' . $token);
    $request->headers->set('Accept', 'application/json');
    
    $response = $kernel->handle($request);
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Content: " . $response->getContent() . "\n";
} else {
    echo "Login Failed!\n";
    print_r($data);
}
