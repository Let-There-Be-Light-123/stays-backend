<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class NameClass extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:name-class';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'this commnad is executed for the custom migration order';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
