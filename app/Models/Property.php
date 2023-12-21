<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;


class Property extends Model
{
    use HasFactory;
    protected $primaryKey = 'property_id';

    protected $fillable = [
        'property_id',
        'property_name',
        'property_type',
        'is_active',
        'is_featured',
        'is_most_liked',
        'likes',
        'on_homepage',
        'property_description',
        'contact',
        'address',
        'location',
        'lat',
        'lng'
    ];
    protected $casts = [
        'property_id' => 'string',
        'lat' => 'double',
        'lng' => 'double',
        // 'location' => 'point'
        // 'location' => 'point', // Cast location attribute as POINT

    ];
    public function rooms()
    {
        return $this->hasMany(Room::class, 'property_id', 'property_id');
    }
    /**
     * Define a relationship with the File model.
     */
    public function files()
    {
        return $this->hasMany(File::class, 'property_id');
    }
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    public static function searchByLocation($location, $radiusInKm = 10)
    {
        $result = self::select('*')
            ->join('addresses', 'properties.address_id', '=', 'addresses.id')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(ST_Y(location))) * cos(radians(ST_X(location)) - radians(?)) + sin(radians(?)) * sin(radians(ST_Y(location))))) AS distance',
                [$location['lat'], $location['lng'], $location['lat']]
            )
            ->havingRaw("distance < ?", [$radiusInKm])
            ->orderBy('distance')
            ->get();

        return $result;
    }

    public function scopeWithinRadius($query, $latitude, $longitude, $radiusInKm)
    {
        $query->select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(ST_Y(location))) * cos(radians(ST_X(location)) - radians(?)) + sin(radians(?)) * sin(radians(ST_Y(location))))) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->havingRaw("distance < ?", [$radiusInKm])
            ->orderBy('distance');
    }
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'user_favorite_properties', 'property_id', 'social_security')
            ->withTimestamps();
    }
}
