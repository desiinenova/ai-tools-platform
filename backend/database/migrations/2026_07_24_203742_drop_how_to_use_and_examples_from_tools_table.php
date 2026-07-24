<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn(['how_to_use', 'examples']);
        });
    }

    /**
     * Restores the columns' schema, not their data — that was already merged
     * into documentation_body by the previous migration and can't be split
     * back out reliably.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->text('how_to_use')->nullable()->after('description');
            $table->text('examples')->nullable()->after('how_to_use');
        });
    }
};
