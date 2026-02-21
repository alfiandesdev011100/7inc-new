<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Loggable;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, Loggable, SoftDeletes;

    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'title',
        'content',
        'image',
        'slug',
        'status',
        'target_page',
        'display_type',
        'author_id',
        'reviewer_id',
        'rejection_reason',
        'published_at',
    ];

    protected $appends = ['image_url'];

    /**
     * Valid transitions for editorial workflow.
     */
    protected static $transitions = [
        self::STATUS_DRAFT => [self::STATUS_PENDING],
        self::STATUS_PENDING => [self::STATUS_APPROVED, self::STATUS_REJECTED],
        self::STATUS_REJECTED => [self::STATUS_PENDING],
        self::STATUS_APPROVED => [self::STATUS_PUBLISHED, self::STATUS_PENDING], // Admin might send back to pending for minor tweaks
        self::STATUS_PUBLISHED => [self::STATUS_DRAFT], // Unpublish
    ];

    public function canTransitionTo($newStatus)
    {
        $currentStatus = $this->status;
        
        if (!isset(self::$transitions[$currentStatus])) {
            return false;
        }

        return in_array($newStatus, self::$transitions[$currentStatus]);
    }

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // Relationship: Article belongs to Author (Writer)
    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function author()
    {
        return $this->belongsTo(Admin::class, 'author_id');
    }

    // Relationship: Article belongs to Reviewer (Admin)
    public function reviewer()
    {
        return $this->belongsTo(Admin::class, 'reviewer_id');
    }
}
