<?php
// app\Models\Address.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'id',
        'zip',
        'lat',
        'lng',
        'city',
        'state_id',
        'state_name',
        'county_name',
        'timezone',
    ];
}
