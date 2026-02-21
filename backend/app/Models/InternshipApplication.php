<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Loggable;

class InternshipApplication extends Model
{
    use HasFactory, Loggable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'university',
        'major',
        'gender',
        'domicile',
        'duration',
        'tools_available',
        'internship_type',
        'ipk_score',
        'skill_score',
        'experience_score',
        'motivation_score',
        'saw_score',
        'ranking',
        'status',
        'notes',
    ];

    protected $casts = [
        'saw_score' => 'decimal:4',
    ];
}
