<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\LazyCollection;


class AddressesTableSeeder extends Seeder
{

    /**
     * Run the seeder.
     *
     * @return void
     */
    public function run()
    {
        DB::disableQueryLog();
        LazyCollection::make(function () {
            $handle = fopen(public_path('uszipsmod.csv'), "r");

            while (($line = fgetcsv($handle, 2446)) !== false) {
                $dataString = implode(', ', $line);
                $row = explode(',', $dataString);
                yield $row;
            }
            fclose($handle);
        })->chunk(1000)->each(function(LazyCollection $chunk){
            $records = $chunk->map(function ($row) {
                return[
                    'zip'=>$row[0],
                    'lat'=>$row[1],
                    'lng'=>$row[2],
                    'city'=>$row[3],
                    'state_id'=>$row[4],
                    'state_name'=>$row[5],
                    'county_name'=>$row[6],
                    'timezone'=>$row[7],
                ];
        })->toArray();

        DB::table('addresses')->insert($records);
    });
    }
}