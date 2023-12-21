<?php
// Notification.php in the app/Models directory

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Notification extends Model
{
    use HasFactory;

    protected $keyType = 'uuid';
    public $incrementing = false;
    protected $fillable = [
        'id',
        'user_id',
        'notifiable_type',
        'notifiable_id',
        'message',
        'type',
        'data',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
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
     * Define a polymorphic relationship with the notifiable entity.
     */
    public function notifiable()
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to get unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
