<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ToolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'website_url' => $this->website_url,
            'documentation_url' => $this->documentation_url,
            'description' => $this->description,
            'how_to_use' => $this->how_to_use,
            'examples' => $this->examples,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
