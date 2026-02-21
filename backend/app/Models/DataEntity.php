<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DataEntity extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'data_entities';

    protected $fillable = [
        'title',
        'content',
        'status',
    ];
}
