<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool ? $this->user()->can('update', $tool) : true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'website_url' => ['required', 'url', 'max:255'],
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
