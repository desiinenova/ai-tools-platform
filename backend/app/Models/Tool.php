<?php

namespace App\Models;

use App\Enums\ToolStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tool extends Model
{
    protected $fillable = [
        'name',
        'website_url',
        'documentation_url',
        'documentation_body',
        'description',
        'image_path',
        'created_by',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => ToolStatus::class,
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    /** Approved tools are public; pending/rejected ones are visible only to their creator and the Owner. */
    public function isVisibleTo(User $user): bool
    {
        return $this->status === ToolStatus::Approved
            || $this->created_by === $user->id
            || $user->isOwner();
    }

    /** Query-level equivalent of isVisibleTo(), for list endpoints. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isOwner()) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user) {
            $q->where('status', ToolStatus::Approved)
                ->orWhere('created_by', $user->id);
        });
    }
}
