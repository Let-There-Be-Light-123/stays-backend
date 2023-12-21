<?php

// app/Models/Review.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Review extends Model
{
    use HasFactory;
    protected $keyType = 'uuid';
    public $incrementing = false;
    protected $fillable = [
        'id',
        'user_id',
        'property_id',
        'rating',
        'comment',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->id = Str::uuid();
        });
    }
    /**
     * Define a relationship with the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    /**
     * Define a relationship with the Property model.
     */
    public function property()
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}
