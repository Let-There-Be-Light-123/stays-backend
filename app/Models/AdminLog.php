<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'id',
        'user_id',
        'action',
        'details',
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
     * Scope a query to get logs for a specific user.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUserLogs($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to get logs for a specific action.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $action
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActionLogs($query, $action)
    {
        return $query->where('action', $action);
    }
}