<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        // Retrieve all roles
        $roles = Role::all();
        return response()->json(['roles' => $roles], 200);
    }

    public function show($id)
    {
        // Retrieve a specific role
        $role = Role::find($id);

        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        return response()->json(['role' => $role], 200);
    }

    public function store(Request $request)
    {
        // Store a new role
        $request->validate([
            'name' => 'required|unique:roles,name',
        ]);

        $role = Role::create([
            'name' => $request->input('name'),
        ]);

        return response()->json(['role' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        // Update a specific role
        $request->validate([
            'name' => 'required|unique:roles,name,' . $id,
        ]);

        $role = Role::find($id);

        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        $role->name = $request->input('name');
        $role->save();

        return response()->json(['role' => $role], 200);
    }

    public function destroy($id)
    {
        // Delete a specific role
        $role = Role::find($id);

        if (!$role) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully'], 200);
    }
}
