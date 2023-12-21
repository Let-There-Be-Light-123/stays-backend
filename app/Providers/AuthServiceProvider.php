<?php

namespace App\Providers;
// use Laravel\Passport\Passport;  //import Passport here


// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        'App\Models\Model' => 'App\Policies\ModelPolicy', //uncomment
    ];
    public function boot(): void
    {
        // Passport::loadKeysFrom(__DIR__.'/../secrets/oauth');
        // $this->registerPolicies();
        // Passport::routes(); 
    }
}
