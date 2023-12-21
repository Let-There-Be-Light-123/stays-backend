<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class UserFavoriteProperty extends Model
{
    use HasFactory;
    protected $table = 'user_favorite_properties';
    protected $fillable = [
        'social_security',
        'property_id',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'social_security', 'social_security');
    }
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id', 'property_id');
    }
}
