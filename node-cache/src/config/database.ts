import mysql from 'mysql2/promise';

/**
 * MySQL Database Configuration
 * 
 * Configures and exports MySQL connection for database operations.
 * Provides connection pooling and error handling.
 */

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'energex',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
};

/**
 * MySQL connection pool
 */
export const dbConnection = mysql.createPool(dbConfig);

/**
 * Database utility functions
 */
export class DatabaseService {
    /**
     * Execute a query with parameters
     */
    static async query(sql: string, params: any[] = []): Promise<any> {
        try {
            const [rows] = await dbConnection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    /**
     * Get all posts from database
     */
    static async getAllPosts(): Promise<any[]> {
        const sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.created_at,
                p.updated_at,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `;
        
        return await this.query(sql);
    }

    /**
     * Get a single post by ID
     */
    static async getPostById(id: number): Promise<any | null> {
        const sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.created_at,
                p.updated_at,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `;
        
        const results = await this.query(sql, [id]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Test database connection
     */
    static async testConnection(): Promise<boolean> {
        try {
            await this.query('SELECT 1');
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}
