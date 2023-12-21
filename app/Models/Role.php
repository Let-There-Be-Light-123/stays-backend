<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory;

    protected $primaryKey = 'role_id';

    protected $fillable = [
        'role_id',
        'role_name'
    ];
    public $timestamps = false; // Assum
    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }
}
