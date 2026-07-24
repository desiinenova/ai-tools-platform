<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backfill existing rows to the same canonical form ToolRequest will
     * enforce going forward (no trailing slash), so the unique index below
     * doesn't choke on pre-existing inconsistencies.
     *
     * These indexes are a defense-in-depth safety net against exact-duplicate
     * races (two requests passing validation before either write completes),
     * not the primary enforcement of case-insensitive uniqueness — that's
     * ToolRequest's CaseInsensitiveUnique rule, which is portable across
     * database drivers. An index on a case-sensitive-collation column
     * wouldn't catch "ChatGPT" vs. "chatgpt" as a conflict on every driver.
     */
    public function up(): void
    {
        DB::table('tools')->orderBy('id')->chunkById(100, function ($tools) {
            foreach ($tools as $tool) {
                $normalized = rtrim($tool->website_url, '/');

                if ($normalized !== $tool->website_url) {
                    DB::table('tools')->where('id', $tool->id)->update(['website_url' => $normalized]);
                }
            }
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->unique('name');
            $table->unique('website_url');
        });
    }

    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->dropUnique(['website_url']);
        });
    }
};
