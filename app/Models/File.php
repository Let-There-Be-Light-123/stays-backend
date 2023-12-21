<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;

class File extends Model
{
   use HasFactory;
   protected $fillable = [
      // 'id',
      'proeprty_id',
      'booking_reference',
      'social_security',
      'filename',
      'filepath',
      'filetype',
   ];
   public function property()
   {
      return $this->belongsTo(Property::class, 'property_id');
   }
   /**
    * Define a relationship with the Booking model.
    */
   public function booking()
   {
      return $this->belongsTo(Booking::class, 'booking_reference');
   }

   /**
    * Define a relationship with the User model.
    */
    public function user()
    {
        return $this->belongsTo(User::class, 'social_security', 'social_security');
    }
    

 /**
     * Scope a query to get files linked to a specific property.
     *
     * @param  Builder  $query
     * @param  string  $propertyId
     * @return Builder
     */
   public function scopePropertyFiles($query, $propertyId)
   {
      return $query->where('property_id', $propertyId);
   }

     /**
     * Scope a query to get files linked to a specific booking.
     *
     * @param  Builder  $query
     * @param  string  $bookingId
     * @return Builder
     */
   public function scopeBookingFiles($query, $bookingId)
   {
      return $query->where('booking_reference', $bookingId);
   }

  /**
     * Scope a query to get files linked to a specific user.
     *
     * @param  Builder  $query
     * @param  string  $userId
     * @return Builder
     */
   public function scopeUserFiles($query, $userId)
   {
      return $query->where('social_security', $userId);
   }
}