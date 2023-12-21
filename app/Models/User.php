<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;



class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $primaryKey = 'social_security';

    protected $fillable = [
        'social_security',
        'name',
        'email',
        'phone',
        'role_id',
        'is_verified',
        'is_active',
        'password',
        'address_id',
        'address',
        'is_homeless',
        'lat', // Added lat field
        'lng', // Added lng field
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'lat' => 'double',
        'lng' => 'double',
        'is_homeless' => 'boolean'
    ];
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
    // Method to get the role name
    public function roleName()
    {
        return $this->role ? $this->role->role_name : null;
    }

    public function assignRole($roleName)
    {
        $role = Role::where('role_name', $roleName)->first();

        if ($role) {
            $this->role()->associate($role);
            $this->save();
            return true;
        }
        return false;
    }

    public function syncRoles(array $roleNames)
    {
        // Find the roles by names
        $roles = Role::whereIn('role_name', $roleNames)->get();

        if ($roles->count() > 0) {
            // Sync the roles to the user
            $this->roles()->sync($roles->pluck('id')->toArray());

            return true;
        }

        return false;
    }
    public function files()
    {
        return $this->hasMany(File::class, 'social_security', 'social_security');
    }
    public function adminLogs()
    {
        return $this->belongsTo(AdminLog::class, 'user_id');
    }
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'user_permissions', 'user_id', 'permission_id')->withTimestamps();
    }
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'booked_by', 'social_security');
    }
    
    public function userBookings()
    {
        return $this->belongsToMany(Booking::class, 'booking_guests', 'user_id', 'booking_id');
    }
 
    public function guestBookings()
    {
        return $this->belongsToMany(Booking::class, 'booking_guests', 'social_security', 'booking_id');
    }

    public static function findOrCreateBySocialSecurity($socialSecurity, $attributes = [])
    {
        return static::firstOrCreate(['social_security' => $socialSecurity], $attributes);
    }

    public function favoriteProperties()
    {
        return $this->belongsToMany(Property::class, 'user_favorite_properties', 'social_security', 'property_id')
            ->withTimestamps();
    }

    public function toggleFavoriteProperty($propertyId)
    {
        $property = Property::find($propertyId);

        if (!$property) {
            return false;
        }

        if ($this->favoriteProperties()->toggle($property)) {
            return true;
        }

        return false;
    }

    public function getFavoriteProperties()
    {
        return $this->favoriteProperties()->get();
    }
}
