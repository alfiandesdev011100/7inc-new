<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Loggable;

class JobApplication extends Model
{
    use HasFactory, Loggable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'job_work_id',
        'school',
        'major',
        'gender',
        'domicile',
        'internship_type',
        'current_status',
        'shift_availability',
        'own_equipment',
        'equipment_details',
        'start_date',
        'duration',
        'info_source',
        'other_activities',
        'education_score',
        'experience_score',
        'skill_score',
        'interview_score',
        'saw_score',
        'ranking',
        'status',
        'notes',
    ];

    protected $casts = [
        'saw_score' => 'decimal:4',
    ];

    // Relationship: Job Application belongs to Job Work
    public function jobWork()
    {
        return $this->belongsTo(JobWork::class, 'job_work_id');
    }
}
