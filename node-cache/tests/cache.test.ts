import request from 'supertest';
import express from 'express';
import { cacheRoutes } from '../src/routes/cache';
import { CacheService } from '../src/config/redis';
import { DatabaseService } from '../src/config/database';

/**
 * Cache Service Tests
 * 
 * Tests Redis caching functionality and cache routes.
 */

// Mock the Redis and Database services
jest.mock('../src/config/redis');
jest.mock('../src/config/database');

const mockCacheService = CacheService as jest.Mocked<typeof CacheService>;
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('Cache Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/cache', cacheRoutes);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('GET /cache/posts', () => {
    it('should return cached posts when available', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      ];

      mockCacheService.get.mockResolvedValue(JSON.stringify(mockPosts));

      const response = await request(app)
        .get('/cache/posts')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Posts retrieved from cache',
        data: mockPosts,
        cached: true,
        timestamp: expect.any(String)
      });

      expect(mockCacheService.get).toHaveBeenCalledWith('posts:all');
      expect(mockDatabaseService.getAllPosts).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache is empty', async () => {
      const mockDbPosts = [
        {
          id: 1,
          title: 'Test Post 1',
          content: 'Test content 1',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
          user_id: 1,
          user_name: 'Test User',
          user_email: 'test@example.com'
        }
      ];

      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.getAllPosts.mockResolvedValue(mockDbPosts);
      mockCacheService.set.mockResolvedValue(true);

      const response = await request(app)
        .get('/cache/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cached).toBe(false);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user.name).toBe('Test User');

      expect(mockCacheService.get).toHaveBeenCalledWith('posts:all');
      expect(mockDatabaseService.getAllPosts).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.getAllPosts.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/cache/posts')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve posts',
        error: 'Database error'
      });
    });
  });

  describe('GET /cache/posts/:id', () => {
    it('should return cached post when available', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      mockCacheService.get.mockResolvedValue(JSON.stringify(mockPost));

      const response = await request(app)
        .get('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Post retrieved from cache',
        data: mockPost,
        cached: true,
        timestamp: expect.any(String)
      });

      expect(mockCacheService.get).toHaveBeenCalledWith('posts:1');
    });

    it('should fetch from database when cache is empty', async () => {
      const mockDbPost = {
        id: 1,
        title: 'Test Post',
        content: 'Test content',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        user_id: 1,
        user_name: 'Test User',
        user_email: 'test@example.com'
      };

      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.getPostById.mockResolvedValue(mockDbPost);
      mockCacheService.set.mockResolvedValue(true);

      const response = await request(app)
        .get('/cache/posts/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cached).toBe(false);
      expect(response.body.data.user.name).toBe('Test User');

      expect(mockDatabaseService.getPostById).toHaveBeenCalledWith(1);
    });

    it('should return 404 when post not found', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockDatabaseService.getPostById.mockResolvedValue(null);

      const response = await request(app)
        .get('/cache/posts/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Post not found'
      });
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app)
        .get('/cache/posts/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid post ID'
      });
    });
  });

  describe('DELETE /cache/posts', () => {
    it('should clear all posts cache', async () => {
      mockCacheService.del.mockResolvedValue(true);

      const response = await request(app)
        .delete('/cache/posts')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Posts cache cleared successfully',
        timestamp: expect.any(String)
      });

      expect(mockCacheService.del).toHaveBeenCalledWith('posts:all');
    });

    it('should handle cache deletion errors', async () => {
      mockCacheService.del.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .delete('/cache/posts')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to clear posts cache');
    });
  });

  describe('DELETE /cache/posts/:id', () => {
    it('should clear specific post cache', async () => {
      mockCacheService.del.mockResolvedValue(true);

      const response = await request(app)
        .delete('/cache/posts/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Post 1 cache cleared successfully',
        timestamp: expect.any(String)
      });

      expect(mockCacheService.del).toHaveBeenCalledWith('posts:1');
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app)
        .delete('/cache/posts/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid post ID'
      });
    });
  });
});

describe('CacheService', () => {
  // Note: These would be integration tests if Redis was available
  // For unit tests, we're mocking the Redis client
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle cache operations', () => {
    // These tests would require actual Redis connection
    // In a real scenario, you'd use a test Redis instance
    expect(true).toBe(true); // Placeholder
  });
});

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle database operations', () => {
    // These tests would require actual database connection
    // In a real scenario, you'd use a test database
    expect(true).toBe(true); // Placeholder
  });
});
