<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SawAnalysisResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'candidate_name',
        'criteria_scores',
        'final_score',
        'ranking',
        'admin_id'
    ];

    protected $casts = [
        'criteria_scores' => 'array',
        'final_score' => 'decimal:4'
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
