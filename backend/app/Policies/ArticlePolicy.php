<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\Admin;
use Illuminate\Auth\Access\Response;

class ArticlePolicy
{
    /**
     * Determine if the user can update the article.
     * Only owner can edit in draft/rejected state. Admins can edit everything.
     */
    public function update($user, Article $article): bool
    {
        if ($user->role === Admin::ROLE_ADMIN) {
            return true;
        }

        return $user->id === $article->author_id && 
               in_array($article->status, [Article::STATUS_DRAFT, Article::STATUS_REJECTED]);
    }

    /**
     * Determine if the user can submit the article for review.
     */
    public function submit($user, Article $article): bool
    {
        return $user->id === $article->author_id && 
               $article->status === Article::STATUS_DRAFT;
    }

    /**
     * Determine if the user can review (approve/reject) the article.
     * Reviewers and Admins can review.
     */
    public function review($user, Article $article): bool
    {
        return in_array($user->role, [Admin::ROLE_ADMIN, Admin::ROLE_REVIEWER]);
    }

    /**
     * Determine if the user can publish the article.
     * Only Admin can publish (final step).
     */
    public function publish($user, Article $article): bool
    {
        return $user->role === Admin::ROLE_ADMIN;
    }

    /**
     * Determine if the user can delete the article.
     */
    public function delete($user, Article $article): bool
    {
        if ($user->role === Admin::ROLE_ADMIN) {
            return true;
        }

        return $user->id === $article->author_id && 
               $article->status === Article::STATUS_DRAFT;
    }
}
