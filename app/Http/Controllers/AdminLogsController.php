<?php

namespace App\Http\Controllers;

use App\Models\AdminLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminLogsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Retrieve all admin logs
        $adminLogs = AdminLog::all();

        return response()->json(['status' => 'success', 'data' => $adminLogs], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'action' => 'required|string',
            'details' => 'nullable|string',
        ]);

        // Create a new admin log
        $adminLog = AdminLog::create([
            'user_id' => Auth::id(), // Assuming you are using Sanctum for authentication
            'action' => $validatedData['action'],
            'details' => $validatedData['details'],
        ]);

        return response()->json(['status' => 'success', 'data' => $adminLog], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\AdminLog  $adminLog
     * @return \Illuminate\Http\Response
     */
    public function show(AdminLog $adminLog)
    {
        return response()->json(['status' => 'success', 'data' => $adminLog], 200);
    }

    // Other methods (update, destroy, etc.) can be added as needed
}
