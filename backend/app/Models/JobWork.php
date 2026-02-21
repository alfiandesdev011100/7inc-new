<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Loggable;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobWork extends Model
{
    use HasFactory, Loggable, SoftDeletes;

    protected $table = 'job_works';

    protected $fillable = [
        'title',
        'company',
        'location',
        'close_date',
        'is_active',
    ];
}
