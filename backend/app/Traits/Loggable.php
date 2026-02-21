<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Loggable
{
    public static function bootLoggable()
    {
        static::created(function ($model) {
            self::logActivity($model, 'create', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $before = array_intersect_key($model->getOriginal(), $model->getDirty());
            $after = $model->getDirty();
            self::logActivity($model, 'update', $before, $after);
        });

        static::deleted(function ($model) {
            self::logActivity($model, 'delete', $model->getAttributes(), null);
        });
    }

    protected static function logActivity($model, $action, $before = null, $after = null)
    {
        $user = Auth::user();
        
        ActivityLog::create([
            'user_id' => $user ? $user->id : null,
            'role' => $user ? $user->role : (Request::segment(1) === 'api' ? 'guest' : 'system'),
            'action' => $action,
            'model' => get_class($model),
            'model_id' => $model->id,
            'before' => $before,
            'after' => $after,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
