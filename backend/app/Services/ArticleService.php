<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Facades\Auth;
use Exception;

class ArticleService
{
    /**
     * Transition an article to a new status with validation.
     */
    public function transitionStatus(Article $article, string $newStatus, array $extraData = [])
    {
        $oldStatus = $article->status;

        // State Machine Validation
        if (!$article->canTransitionTo($newStatus)) {
            throw new Exception("Transisi status tidak valid dari {$oldStatus} ke {$newStatus}");
        }

        $updateData = ['status' => $newStatus];

        switch ($newStatus) {
            case Article::STATUS_APPROVED:
            case Article::STATUS_REJECTED:
                $updateData['reviewer_id'] = Auth::id();
                if (isset($extraData['rejection_reason'])) {
                    $updateData['rejection_reason'] = $extraData['rejection_reason'];
                }
                break;

            case Article::STATUS_PUBLISHED:
                $updateData['published_at'] = now();
                break;
        }

        $article->update($updateData);

        // Dispatch status change notification event
        \App\Events\ArticleStatusChanged::dispatch($article, $oldStatus, $newStatus);

        return $article;
    }
}
