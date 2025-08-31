<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Post Feature Tests
 * 
 * Tests post CRUD operations and caching functionality.
 */
class PostTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $token;

    /**
     * Set up test environment
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user and get token
        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $loginResponse = $this->post('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $this->token = $loginResponse->json('token');
    }

    /**
     * Test getting all posts
     */
    public function test_can_get_all_posts()
    {
        // Create some posts
        Post::create([
            'title' => 'Test Post 1',
            'content' => 'This is test post content 1',
            'user_id' => $this->user->id,
        ]);

        Post::create([
            'title' => 'Test Post 2',
            'content' => 'This is test post content 2',
            'user_id' => $this->user->id,
        ]);

        $response = $this->get('/api/posts', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'content',
                            'created_at',
                            'updated_at',
                            'user' => [
                                'id',
                                'name',
                                'email',
                            ],
                        ],
                    ],
                    'cached',
                ]);

        $this->assertEquals(2, count($response->json('data')));
    }

    /**
     * Test creating a new post
     */
    public function test_can_create_post()
    {
        $postData = [
            'title' => 'New Test Post',
            'content' => 'This is a new test post content',
        ];

        $response = $this->post('/api/posts', $postData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id',
                        'title',
                        'content',
                        'user_id',
                        'created_at',
                        'updated_at',
                        'user',
                    ],
                ]);

        $this->assertDatabaseHas('posts', [
            'title' => 'New Test Post',
            'content' => 'This is a new test post content',
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * Test creating post with invalid data
     */
    public function test_cannot_create_post_with_invalid_data()
    {
        $postData = [
            'title' => '', // Empty title
            'content' => 'This is test content',
        ];

        $response = $this->post('/api/posts', $postData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'errors',
                ]);
    }

    /**
     * Test getting a single post
     */
    public function test_can_get_single_post()
    {
        $post = Post::create([
            'title' => 'Test Post',
            'content' => 'This is test post content',
            'user_id' => $this->user->id,
        ]);

        $response = $this->get('/api/posts/' . $post->id, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id',
                        'title',
                        'content',
                        'created_at',
                        'updated_at',
                        'user',
                    ],
                    'cached',
                ]);
    }

    /**
     * Test getting non-existent post
     */
    public function test_cannot_get_non_existent_post()
    {
        $response = $this->get('/api/posts/999', [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(404);
    }

    /**
     * Test updating own post
     */
    public function test_can_update_own_post()
    {
        $post = Post::create([
            'title' => 'Original Title',
            'content' => 'Original content',
            'user_id' => $this->user->id,
        ]);

        $updateData = [
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ];

        $response = $this->put('/api/posts/' . $post->id, $updateData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data',
                ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ]);
    }

    /**
     * Test updating other user's post (should fail)
     */
    public function test_cannot_update_other_users_post()
    {
        // Create another user
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => Hash::make('password123'),
        ]);

        $post = Post::create([
            'title' => 'Other User Post',
            'content' => 'This belongs to other user',
            'user_id' => $otherUser->id,
        ]);

        $updateData = [
            'title' => 'Hacked Title',
            'content' => 'Hacked content',
        ];

        $response = $this->put('/api/posts/' . $post->id, $updateData, [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test deleting own post
     */
    public function test_can_delete_own_post()
    {
        $post = Post::create([
            'title' => 'Post to Delete',
            'content' => 'This post will be deleted',
            'user_id' => $this->user->id,
        ]);

        $response = $this->delete('/api/posts/' . $post->id, [], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Post deleted successfully',
                ]);

        $this->assertDatabaseMissing('posts', [
            'id' => $post->id,
        ]);
    }

    /**
     * Test deleting other user's post (should fail)
     */
    public function test_cannot_delete_other_users_post()
    {
        // Create another user
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => Hash::make('password123'),
        ]);

        $post = Post::create([
            'title' => 'Other User Post',
            'content' => 'This belongs to other user',
            'user_id' => $otherUser->id,
        ]);

        $response = $this->delete('/api/posts/' . $post->id, [], [
            'Authorization' => 'Bearer ' . $this->token,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test accessing posts without authentication
     */
    public function test_cannot_access_posts_without_authentication()
    {
        $response = $this->get('/api/posts');
        $response->assertStatus(401);

        $response = $this->post('/api/posts', [
            'title' => 'Test',
            'content' => 'Test content',
        ]);
        $response->assertStatus(401);
    }
}
