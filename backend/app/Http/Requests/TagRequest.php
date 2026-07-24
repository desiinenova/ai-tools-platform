<?php

namespace App\Http\Requests;

use App\Models\Tag;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tag = $this->route('tag');

        return $tag
            ? $this->user()->can('update', $tag)
            : $this->user()->can('create', Tag::class);
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tags', 'name')->ignore($this->route('tag')),
            ],
        ];
    }
}
