<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Email extends Model
{
    use HasFactory;
    protected $keyType = 'uuid';
    protected $fillable = [
        'id',
        'user_id',
        'subject',
        'body',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
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
     * Scope a query to get unread emails.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
