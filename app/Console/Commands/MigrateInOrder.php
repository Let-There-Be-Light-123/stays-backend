<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MigrateInOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-in-order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute the migrations in the order specified in the file app/Console/Comands/MigrateInOrder.php \n Drop all the table in db before execute the command.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $migrations = [
            "0000_00_00_000000_create_websockets_statistics_entries_table.php",
            "2019_07_15_000000_create_firewall_ips_table.php",
            "2019_07_15_000000_create_firewall_logs_table.php",
            "2019_12_14_000001_create_personal_access_tokens_table.php",
            "2023_11_24_105017_create_address.php",
            "2023_11_24_114356_create_property_migration.php",
            "2023_11_24_114735_create_role_migration.php",
            "2023_11_24_114745_create_permission_migration.php",
            "2023_11_24_121859_create_user_table.php"
        ];

        foreach ($migrations as $migration) {
            $basePath = 'database/migrations/';
            $migrationName = trim($migration);
            $path = $basePath . $migrationName;
            $this->call('migrate:refresh', [
                '--path' => $path,
            ]);
        }
    }
}
