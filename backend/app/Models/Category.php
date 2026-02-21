<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Loggable;

class Category extends Model
{
    use Loggable;
    protected $fillable = [
        'name',
        'slug',
        'description'
    ];

    public function news()
    {
        return $this->hasMany(News::class, 'category_id');
    }
}
