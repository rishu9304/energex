<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Testing Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration overrides for the testing environment.
    | These settings will be applied when APP_ENV=testing
    |
    */

    'database' => [
        'default' => 'sqlite',
        'connections' => [
            'sqlite' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
            ],
        ],
    ],

    'cache' => [
        'default' => 'array',
    ],

    'jwt' => [
        'secret' => 'test_jwt_secret_key_for_testing_environment_12345',
        'blacklist_enabled' => false,
    ],

    'redis' => [
        'client' => 'predis',
        'default' => [
            'host' => '127.0.0.1',
            'port' => 6379,
            'database' => 0,
        ],
    ],
];
