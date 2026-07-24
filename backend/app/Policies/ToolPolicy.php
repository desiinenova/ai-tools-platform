<?php

namespace App\Policies;

use App\Models\Tool;
use App\Models\User;

class ToolPolicy
{
    public function update(User $user, Tool $tool): bool
    {
        return $user->isOwner() || $user->id === $tool->created_by;
    }

    public function delete(User $user, Tool $tool): bool
    {
        return $this->update($user, $tool);
    }
}
