<?php

namespace App\Http\Controllers;

use App\Http\Requests\TagRequest;
use App\Models\Tag;

class TagController extends Controller
{
    public function index()
    {
        return Tag::all();
    }

    public function store(TagRequest $request)
    {
        return Tag::create($request->validated());
    }

    public function show(Tag $tag)
    {
        return $tag;
    }

    public function update(TagRequest $request, Tag $tag)
    {
        $tag->update($request->validated());

        return $tag;
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();

        return response()->noContent();
    }
}
