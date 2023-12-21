<?php
// app\Helpers\UserHelper.php

namespace App\Helpers;

use App\Models\User;
use App\Models\File;
use App\Models\Permission;

class UserHelper
{
    /**
     * Grant a permission to a user.
     *
     * @param int $userId
     * @param int $permissionId
     * @return void
     */
    public static function grantPermission($userId, $permissionId)
    {
        $user = User::find($userId);

        if ($user) {
            $user->permissions()->attach($permissionId);
        }
    }

    /**
     * Revoke a permission from a user.
     *
     * @param int $userId
     * @param int $permissionId
     * @return void
     */
    public static function revokePermission($userId, $permissionId)
    {
        $user = User::find($userId);

        if ($user) {
            $user->permissions()->detach($permissionId);
        }
    }

    /**
     * Check if a user has a specific permission.
     *
     * @param int $userId
     * @param int $permissionId
     * @return bool
     */
    public static function hasPermission($userId, $permissionId)
    {
        $user = User::find($userId);

        if ($user) {
            return $user->permissions->contains($permissionId);
        }

        return false;
    }

    /**
     * Retrieve files associated with a user.
     *
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getUserFiles($userId)
    {
        $user = User::with('files')->find($userId);

        return $user ? $user->files : collect();
    }
}
