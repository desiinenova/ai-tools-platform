<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Case-insensitive uniqueness check that behaves the same on any database
 * driver. MySQL's utf8mb4_unicode_ci collation already compares case-
 * insensitively, but sqlite (used in tests) does not — comparing via
 * LOWER() on both sides makes this portable and testable rather than an
 * accident of the production database's collation.
 */
class CaseInsensitiveUnique implements ValidationRule
{
    public function __construct(
        private readonly string $table,
        private readonly string $column,
        private readonly string $message,
        private readonly ?int $ignoreId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        $exists = DB::table($this->table)
            ->whereRaw('LOWER('.$this->column.') = ?', [Str::lower($value)])
            ->when($this->ignoreId, fn ($query) => $query->where('id', '!=', $this->ignoreId))
            ->exists();

        if ($exists) {
            $fail($this->message);
        }
    }
}
