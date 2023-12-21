<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Permission extends Model
{
    use HasFactory;
    protected $primaryKey = 'permission_id';

    public $incrementing = false;

    protected $fillable = [
        'permission_id',
        'permission_name',
        'permission_description'
    ];
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_permissions', 'permission_id', 'user_id')->withTimestamps();
    }
    
}
