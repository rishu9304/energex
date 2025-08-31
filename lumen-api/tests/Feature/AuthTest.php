<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Authentication Feature Tests
 * 
 * Tests authentication endpoints including registration, login, and JWT functionality.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user registration with valid data
     */
    public function test_user_can_register_with_valid_data()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->post('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token'
                ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);
    }

    /**
     * Test user registration with invalid email
     */
    public function test_user_cannot_register_with_invalid_email()
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'invalid-email',
            'password' => 'password123',
        ];

        $response = $this->post('/api/register', $userData);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'errors'
                ]);
    }

    /**
     * Test user registration with duplicate email
     */
    public function test_user_cannot_register_with_duplicate_email()
    {
        // Create a user first
        User::create([
            'name' => 'Existing User',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->post('/api/register', $userData);

        $response->assertStatus(422);
    }

    /**
     * Test user login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials()
    {
        // Create a user
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'password123',
        ];

        $response = $this->post('/api/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token'
                ]);
    }

    /**
     * Test user login with invalid credentials
     */
    public function test_user_cannot_login_with_invalid_credentials()
    {
        // Create a user
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginData = [
            'email' => 'john@example.com',
            'password' => 'wrongpassword',
        ];

        $response = $this->post('/api/login', $loginData);

        $response->assertStatus(401)
                ->assertJson([
                    'success' => false,
                    'message' => 'Invalid credentials',
                ]);
    }

    /**
     * Test accessing protected route without token
     */
    public function test_cannot_access_protected_route_without_token()
    {
        $response = $this->get('/api/me');

        $response->assertStatus(401);
    }

    /**
     * Test accessing protected route with valid token
     */
    public function test_can_access_protected_route_with_valid_token()
    {
        // Create and authenticate user
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginResponse = $this->post('/api/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $token = $loginResponse->json('token');

        $response = $this->get('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                ]);
    }
}
