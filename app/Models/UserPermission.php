<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPermission extends Model
{
    use HasFactory;
    protected $primaryKey = 'id';
    protected $fillable = [
        'id', // Combination of user_id and permission_id
        'user_id',
        'permission_id',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the permission associated with the user.
     */
    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
