<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Loggable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, Loggable, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'target_page',
        'display_type',
        'assigned_to',
        'assigned_by',
        'due_date',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    // Relationship: Task assigned to Writer
    public function writer()
    {
        return $this->belongsTo(Admin::class, 'assigned_to');
    }

    // Relationship: Task assigned by Admin
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'assigned_by');
    }
}
