import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { cacheRoutes } from './routes/cache';
import { redisClient } from './config/redis';
import { dbConnection } from './config/database';

// Load environment variables
dotenv.config();

/**
 * Express Application Setup
 * 
 * Initializes the Node.js cache service with Express framework,
 * Redis caching, and MySQL database connectivity.
 */
class CacheServer {
    private app: express.Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = parseInt(process.env.PORT || '3000', 10);
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    /**
     * Initialize middleware
     */
    private initializeMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    /**
     * Initialize routes
     */
    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Node.js Cache Service',
                version: '1.0.0'
            });
        });

        // Cache routes
        this.app.use('/cache', cacheRoutes);

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Energex Node.js Cache Service',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    posts: '/cache/posts',
                    singlePost: '/cache/posts/:id'
                }
            });
        });
    }

    /**
     * Initialize error handling
     */
    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
                path: req.originalUrl
            });
        });

        // Global error handler
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        });
    }

    /**
     * Start the server
     */
    public async start(): Promise<void> {
        try {
            // Test Redis connection
            await redisClient.ping();
            console.log('✅ Redis connection established');

            // Test MySQL connection
            await dbConnection.execute('SELECT 1');
            console.log('✅ MySQL connection established');

            // Start server
            this.app.listen(this.port, () => {
                console.log(`🚀 Cache service running on port ${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
            });

        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Start the server
const server = new CacheServer();
server.start().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    await redisClient.quit();
    await dbConnection.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    await redisClient.quit();
    await dbConnection.end();
    process.exit(0);
});
