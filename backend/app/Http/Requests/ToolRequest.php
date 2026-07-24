<?php

namespace App\Http\Requests;

use App\Rules\CaseInsensitiveUnique;
use Illuminate\Foundation\Http\FormRequest;

class ToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool ? $this->user()->can('update', $tool) : true;
    }

    /**
     * Canonicalize name/website_url before validation runs, so the unique
     * checks below (and the database constraint) compare like with like:
     * trimmed names, and URLs without a trailing slash. Intentionally does
     * not touch scheme/host casing or www — trailing-slash normalization is
     * the only URL normalization this project applies.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name) ? trim($this->name) : $this->name,
            'website_url' => is_string($this->website_url)
                ? rtrim(trim($this->website_url), '/')
                : $this->website_url,
        ]);
    }

    public function rules(): array
    {
        $tool = $this->route('tool');

        return [
            'name' => [
                'required', 'string', 'max:255',
                new CaseInsensitiveUnique('tools', 'name', 'A tool with this name already exists.', $tool?->id),
            ],
            'website_url' => [
                'required', 'url', 'max:255',
                new CaseInsensitiveUnique(
                    'tools', 'website_url', 'A tool with this website URL already exists.', $tool?->id
                ),
            ],
            'documentation_url' => ['nullable', 'url', 'max:255'],
            'documentation_body' => ['nullable', 'string'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],

            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', 'exists:categories,id'],

            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],

            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'The file must be a valid image (JPG, JPEG, PNG, or WEBP).',
            'image.mimes' => 'The image must be a JPG, JPEG, PNG, or WEBP file.',
            'image.max' => 'The selected image exceeds the maximum allowed size (4 MB).',
        ];
    }
}
