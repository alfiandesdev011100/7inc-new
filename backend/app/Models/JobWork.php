<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobWork extends Model
{
    use HasFactory;

    protected $table = 'job_works';

    protected $fillable = [
        'title',
        'company',
        'location',
        'close_date'
    ];
}
