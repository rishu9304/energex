<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Post Controller
 * 
 * Handles CRUD operations for posts with Redis caching integration.
 * Implements caching strategies to improve API performance and reduce database queries.
 */
class PostController extends Controller
{
    /**
     * Cache expiration time in seconds (1 hour)
     */
    private const CACHE_TTL = 3600;

    /**
     * Get all posts with Redis caching
     * 
     * Retrieves all posts from cache if available, otherwise fetches from database
     * and stores in cache for future requests.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $cacheKey = 'posts:all';
            
            // Try to get posts from Redis cache
            $cachedPosts = Redis::get($cacheKey);
            
            if ($cachedPosts) {
                $posts = json_decode($cachedPosts, true);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Posts retrieved from cache',
                    'data' => $posts,
                    'cached' => true,
                ]);
            }

            // If not in cache, get from database
            $posts = Post::with('user:id,name,email')->latest()->get();
            
            // Store in Redis cache
            Redis::setex($cacheKey, self::CACHE_TTL, $posts->toJson());

            return response()->json([
                'success' => true,
                'message' => 'Posts retrieved successfully',
                'data' => $posts,
                'cached' => false,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve posts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new post
     * 
     * Creates a new post and invalidates relevant cache entries.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $this->validate($request, [
                'title' => 'required|string|max:255',
                'content' => 'required|string',
            ]);

            $user = JWTAuth::parseToken()->authenticate();

            $post = Post::create([
                'title' => $request->title,
                'content' => $request->content,
                'user_id' => $user->id,
            ]);

            $post->load('user:id,name,email');

            // Clear cache
            $this->clearPostsCache();

            return response()->json([
                'success' => true,
                'message' => 'Post created successfully',
                'data' => $post,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create post',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific post with Redis caching
     * 
     * Retrieves a single post by ID from cache if available, otherwise fetches
     * from database and stores in cache.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $cacheKey = "posts:{$id}";
            
            // Try to get post from Redis cache
            $cachedPost = Redis::get($cacheKey);
            
            if ($cachedPost) {
                $post = json_decode($cachedPost, true);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Post retrieved from cache',
                    'data' => $post,
                    'cached' => true,
                ]);
            }

            // If not in cache, get from database
            $post = Post::with('user:id,name,email')->find($id);
            
            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found',
                ], 404);
            }
            
            // Store in Redis cache
            Redis::setex($cacheKey, self::CACHE_TTL, $post->toJson());

            return response()->json([
                'success' => true,
                'message' => 'Post retrieved successfully',
                'data' => $post,
                'cached' => false,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve post',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a specific post
     * 
     * Updates a post and invalidates relevant cache entries.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $this->validate($request, [
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
            ]);

            $user = JWTAuth::parseToken()->authenticate();
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found',
                ], 404);
            }

            // Check if user owns the post
            if ($post->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this post',
                ], 403);
            }

            $post->update($request->only(['title', 'content']));
            $post->load('user:id,name,email');

            // Clear cache
            $this->clearPostsCache();
            Redis::del("posts:{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Post updated successfully',
                'data' => $post,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update post',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a specific post
     * 
     * Deletes a post and invalidates relevant cache entries.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $post = Post::find($id);

            if (!$post) {
                return response()->json([
                    'success' => false,
                    'message' => 'Post not found',
                ], 404);
            }

            // Check if user owns the post
            if ($post->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this post',
                ], 403);
            }

            $post->delete();

            // Clear cache
            $this->clearPostsCache();
            Redis::del("posts:{$id}");

            return response()->json([
                'success' => true,
                'message' => 'Post deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete post',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear posts cache
     * 
     * Helper method to clear all posts-related cache entries.
     */
    private function clearPostsCache()
    {
        Redis::del('posts:all');
    }
}
