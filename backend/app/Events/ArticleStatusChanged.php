<?php

namespace App\Events;

use App\Models\Article;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArticleStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $article;
    public $oldStatus;
    public $newStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Article $article, string $oldStatus, string $newStatus)
    {
        $this->article = $article;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
