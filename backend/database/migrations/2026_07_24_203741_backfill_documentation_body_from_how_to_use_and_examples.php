<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Merge the soon-to-be-dropped how_to_use/examples columns into the new
     * documentation_body markdown field, so no existing tool loses content.
     */
    public function up(): void
    {
        DB::table('tools')->orderBy('id')->chunkById(100, function ($tools) {
            foreach ($tools as $tool) {
                $sections = [];

                if (filled($tool->how_to_use)) {
                    $sections[] = "# Usage\n\n{$tool->how_to_use}";
                }

                if (filled($tool->examples)) {
                    $sections[] = "# Examples\n\n{$tool->examples}";
                }

                if ($sections === []) {
                    continue;
                }

                DB::table('tools')->where('id', $tool->id)->update([
                    'documentation_body' => implode("\n\n", $sections),
                ]);
            }
        });
    }

    /**
     * Not meaningfully reversible: the merge is one-directional, and
     * documentation_body may have been edited since. Nothing to undo here —
     * the how_to_use/examples columns themselves are restored by the next
     * migration's down(), which is where schema reversibility lives.
     */
    public function down(): void
    {
        //
    }
};
