<?php

namespace App\Listeners;

use App\Events\ArticleStatusChanged;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Request;

class LogArticleStatusChange
{
    /**
     * Handle the event.
     */
    public function handle(ArticleStatusChanged $event): void
    {
        $article = $event->article;
        
        ActivityLog::create([
            'user_id' => auth()->id() ?? $article->author_id,
            'role' => auth()->user()->role ?? 'system',
            'action' => 'article_status_notification',
            'model' => 'Article',
            'after' => [
                'article_id' => $article->id,
                'title' => $article->title,
                'old_status' => $event->oldStatus,
                'new_status' => $event->newStatus,
                'message' => "Artikel '{$article->title}' berubah status dari {$event->oldStatus} ke {$event->newStatus}."
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
