<?php

namespace Tests;

use Laravel\Lumen\Testing\TestCase as BaseTestCase;

/**
 * Base Test Case
 * 
 * Provides common functionality for all test cases.
 */
abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     *
     * @return \Laravel\Lumen\Application
     */
    public function createApplication()
    {
        return require __DIR__.'/../bootstrap/app.php';
    }
}
