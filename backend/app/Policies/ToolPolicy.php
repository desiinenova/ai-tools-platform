<?php

namespace App\Policies;

use App\Models\Tool;
use App\Models\User;

class ToolPolicy
{
    public function view(User $user, Tool $tool): bool
    {
        return $tool->isVisibleTo($user);
    }

    public function update(User $user, Tool $tool): bool
    {
        return $user->isOwner() || $user->id === $tool->created_by;
    }

    public function delete(User $user, Tool $tool): bool
    {
        return $this->update($user, $tool);
    }

    /** Approving/rejecting a submission is an Owner-only moderation action. */
    public function moderate(User $user, Tool $tool): bool
    {
        return $user->isOwner();
    }
}
