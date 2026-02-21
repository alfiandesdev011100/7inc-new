<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\Schema;

Schema::dropIfExists('contact_messages');
Schema::dropIfExists('internship_applications');
Schema::dropIfExists('job_applications');
Schema::dropIfExists('tasks'); // Just in case
Schema::dropIfExists('articles'); // Just in case, if migration order matters

echo "Dropped contact_messages, internship_applications, job_applications, tasks, articles tables.\n";
