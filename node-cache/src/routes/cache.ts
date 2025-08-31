import { Router, Request, Response } from 'express';
import { CacheService } from '../config/redis';
import { DatabaseService } from '../config/database';

/**
 * Cache Routes
 * 
 * Handles caching operations for posts data.
 * Implements cache-first strategy with database fallback.
 */

export const cacheRoutes = Router();

/**
 * Cache TTL in seconds (1 hour)
 */
const CACHE_TTL = 3600;

/**
 * GET /cache/posts
 * 
 * Retrieves all posts from cache if available, otherwise fetches from database
 * and stores in cache for future requests.
 */
cacheRoutes.get('/posts', async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheKey = 'posts:all';
        
        // Try to get from cache first
        const cachedData = await CacheService.get(cacheKey);
        
        if (cachedData) {
            const posts = JSON.parse(cachedData);
            res.json({
                success: true,
                message: 'Posts retrieved from cache',
                data: posts,
                cached: true,
                timestamp: new Date().toISOString()
            });
            return;
        }

        // If not in cache, get from database
        const posts = await DatabaseService.getAllPosts();
        
        // Transform data to match expected format
        const transformedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: {
                id: post.user_id,
                name: post.user_name,
                email: post.user_email
            }
        }));

        // Store in cache
        await CacheService.set(cacheKey, JSON.stringify(transformedPosts), CACHE_TTL);

        res.json({
            success: true,
            message: 'Posts retrieved from database and cached',
            data: transformedPosts,
            cached: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in /cache/posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve posts',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /cache/posts/:id
 * 
 * Retrieves a single post by ID from cache if available, otherwise fetches
 * from database and stores in cache.
 */
cacheRoutes.get('/posts/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id || '0', 10);
        
        if (isNaN(postId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid post ID'
            });
            return;
        }

        const cacheKey = `posts:${postId}`;
        
        // Try to get from cache first
        const cachedData = await CacheService.get(cacheKey);
        
        if (cachedData) {
            const post = JSON.parse(cachedData);
            res.json({
                success: true,
                message: 'Post retrieved from cache',
                data: post,
                cached: true,
                timestamp: new Date().toISOString()
            });
            return;
        }

        // If not in cache, get from database
        const post = await DatabaseService.getPostById(postId);
        
        if (!post) {
            res.status(404).json({
                success: false,
                message: 'Post not found'
            });
            return;
        }

        // Transform data to match expected format
        const transformedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: {
                id: post.user_id,
                name: post.user_name,
                email: post.user_email
            }
        };

        // Store in cache
        await CacheService.set(cacheKey, JSON.stringify(transformedPost), CACHE_TTL);

        res.json({
            success: true,
            message: 'Post retrieved from database and cached',
            data: transformedPost,
            cached: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in /cache/posts/:id:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve post',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * DELETE /cache/posts
 * 
 * Clears all posts from cache
 */
cacheRoutes.delete('/posts', async (req: Request, res: Response): Promise<void> => {
    try {
        await CacheService.del('posts:all');
        
        res.json({
            success: true,
            message: 'Posts cache cleared successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error clearing posts cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear posts cache',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * DELETE /cache/posts/:id
 * 
 * Clears specific post from cache
 */
cacheRoutes.delete('/posts/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = parseInt(req.params.id || '0', 10);
        
        if (isNaN(postId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid post ID'
            });
            return;
        }

        const cacheKey = `posts:${postId}`;
        await CacheService.del(cacheKey);
        
        res.json({
            success: true,
            message: `Post ${postId} cache cleared successfully`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error clearing post cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear post cache',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});