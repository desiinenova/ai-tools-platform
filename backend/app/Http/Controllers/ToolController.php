<?php

namespace App\Http\Controllers;

use App\Http\Requests\ToolRequest;
use App\Http\Resources\ToolResource;
use App\Models\Tool;
use App\Services\ToolWorkflowService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ToolController extends Controller
{
    public function index(Request $request)
    {
        $query = Tool::with(['creator', 'categories', 'roles', 'tags'])
            ->visibleTo($request->user());

        if ($request->filled('category_id')) {
            $query->whereHas('categories', fn ($q) => $q->where('categories.id', $request->query('category_id')));
        }

        if ($request->filled('role_id')) {
            $query->whereHas('roles', fn ($q) => $q->where('roles.id', $request->query('role_id')));
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->query('name').'%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('created_by')) {
            $query->where('created_by', $request->query('created_by'));
        }

        // Each tag ID gets its own whereHas, so the tool must match ALL of
        // them (AND), not just any one.
        foreach ((array) $request->query('tag_ids', []) as $tagId) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        return ToolResource::collection($query->latest()->get());
    }

    public function store(ToolRequest $request, ToolWorkflowService $workflow)
    {
        $data = $request->safe()->except(['category_ids', 'role_ids', 'tag_ids', 'image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('tools', 'public');
        }

        try {
            $tool = Tool::create([
                ...$data,
                'created_by' => $request->user()->id,
                'status' => $workflow->determineInitialStatus($request->user()),
            ]);
        } catch (QueryException $e) {
            $this->throwAsDuplicateToolError($e);
        }

        $tool->categories()->sync($request->input('category_ids', []));
        $tool->roles()->sync($request->input('role_ids', []));
        $tool->tags()->sync($request->input('tag_ids', []));

        return new ToolResource($tool->load(['creator', 'categories', 'roles', 'tags']));
    }

    public function show(Tool $tool)
    {
        $this->authorize('view', $tool);

        return new ToolResource($tool->load(['creator', 'categories', 'roles', 'tags']));
    }

    public function update(ToolRequest $request, Tool $tool, ToolWorkflowService $workflow)
    {
        $data = $request->safe()->except(['category_ids', 'role_ids', 'tag_ids', 'image']);

        if ($request->hasFile('image')) {
            if ($tool->image_path) {
                Storage::disk('public')->delete($tool->image_path);
            }

            $data['image_path'] = $request->file('image')->store('tools', 'public');
        }

        $data['status'] = $workflow->resolveStatusAfterUpdate($tool, $request->user());

        try {
            $tool->update($data);
        } catch (QueryException $e) {
            $this->throwAsDuplicateToolError($e);
        }

        $tool->categories()->sync($request->input('category_ids', []));
        $tool->roles()->sync($request->input('role_ids', []));
        $tool->tags()->sync($request->input('tag_ids', []));

        return new ToolResource($tool->load(['creator', 'categories', 'roles', 'tags']));
    }

    public function destroy(Tool $tool)
    {
        $this->authorize('delete', $tool);

        if ($tool->image_path) {
            Storage::disk('public')->delete($tool->image_path);
        }

        $tool->delete();

        return response()->noContent();
    }

    /**
     * ToolRequest's validation already catches duplicate name/website_url in
     * virtually every case — this only fires on the rare race where two
     * near-simultaneous requests both pass validation before either write
     * completes. Converts the database's unique-constraint violation into
     * the same 422 shape a normal validation failure would produce.
     */
    private function throwAsDuplicateToolError(QueryException $e): never
    {
        if ($e->getCode() !== '23000') {
            throw $e;
        }

        $field = str_contains($e->getMessage(), 'tools_website_url_unique') ? 'website_url' : 'name';
        $message = $field === 'name'
            ? 'A tool with this name already exists.'
            : 'A tool with this website URL already exists.';

        throw ValidationException::withMessages([$field => [$message]]);
    }

    public function approve(Tool $tool, ToolWorkflowService $workflow)
    {
        $this->authorize('moderate', $tool);

        $workflow->approve($tool);

        return new ToolResource($tool->load(['creator', 'categories', 'roles', 'tags']));
    }

    public function reject(Tool $tool, ToolWorkflowService $workflow)
    {
        $this->authorize('moderate', $tool);

        $workflow->reject($tool);

        return new ToolResource($tool->load(['creator', 'categories', 'roles', 'tags']));
    }
}
