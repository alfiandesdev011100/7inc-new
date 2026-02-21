<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'action',
        'model',
        'model_id',
        'before',
        'after',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array'
    ];
}
