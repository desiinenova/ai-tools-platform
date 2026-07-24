<?php

namespace App\Services;

use App\Enums\ToolStatus;
use App\Models\Tool;
use App\Models\User;

class ToolWorkflowService
{
    /** Owner submissions go live immediately; everyone else's need review. */
    public function determineInitialStatus(User $creator): ToolStatus
    {
        return $creator->isOwner() ? ToolStatus::Approved : ToolStatus::Pending;
    }

    /** A non-Owner edit sends a tool back for re-review; an Owner edit doesn't change its status. */
    public function resolveStatusAfterUpdate(Tool $tool, User $editor): ToolStatus
    {
        return $editor->isOwner() ? $tool->status : ToolStatus::Pending;
    }

    public function approve(Tool $tool): Tool
    {
        $tool->update(['status' => ToolStatus::Approved]);

        return $tool;
    }

    public function reject(Tool $tool): Tool
    {
        $tool->update(['status' => ToolStatus::Rejected]);

        return $tool;
    }
}
