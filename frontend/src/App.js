import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:8000/api';
const CACHE_BASE = 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useCache, setUseCache] = useState(true);
  const [message, setMessage] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: 'john@example.com',
    password: 'password123'
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchPosts();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let response;
      if (useCache) {
        response = await axios.get(`${CACHE_BASE}/cache/posts`);
      } else {
        response = await axios.get(`${API_BASE}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (response.data.success) {
        setPosts(response.data.data);
        setMessage(`Posts loaded from ${response.data.cached ? 'cache' : 'database'}`);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage('Error loading posts');
    }
    setLoading(false);
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/login`, loginData);
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful!');
      } else {
        setMessage('Login failed: ' + response.data.message);
      }
    } catch (error) {
      setMessage('Login error: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const register = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.password_confirmation) {
      setMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/register`, registerData);
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        setMessage('Registration successful! Welcome!');
        setShowRegister(false);
      } else {
        setMessage('Registration failed: ' + response.data.message);
      }
    } catch (error) {
      setMessage('Registration error: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setPosts([]);
    setMessage('Logged out successfully');
    setShowRegister(false);
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/posts`, newPost, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNewPost({ title: '', content: '' });
        setMessage('Post created successfully!');
        fetchPosts(); // Refresh posts
      } else {
        setMessage('Error creating post: ' + response.data.message);
      }
    } catch (error) {
      setMessage('Error creating post: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="App">
        <div className="container">
          <h1>🚀 Energex Assessment</h1>
          
          {!showRegister ? (
            // Login Form
            <div className="auth-form">
              <h2>Login</h2>
              <form onSubmit={login}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <div className="auth-switch">
                <p>Don't have an account? 
                  <button 
                    type="button" 
                    className="link-btn"
                    onClick={() => setShowRegister(true)}
                  >
                    Register here
                  </button>
                </p>
              </div>
              {message && <div className="message">{message}</div>}
            </div>
          ) : (
            // Registration Form
            <div className="auth-form">
              <h2>Register</h2>
              <form onSubmit={register}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={registerData.password_confirmation}
                  onChange={(e) => setRegisterData({...registerData, password_confirmation: e.target.value})}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <div className="auth-switch">
                <p>Already have an account? 
                  <button 
                    type="button" 
                    className="link-btn"
                    onClick={() => setShowRegister(false)}
                  >
                    Login here
                  </button>
                </p>
              </div>
              {message && <div className="message">{message}</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🚀 Energex Assessment</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}!</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </header>

        {message && <div className="message">{message}</div>}

        {/* Cache Toggle */}
        <div className="cache-toggle">
          <label>
            <input
              type="checkbox"
              checked={useCache}
              onChange={(e) => setUseCache(e.target.checked)}
            />
            Use Cache Service (Node.js) - {useCache ? '⚡ Fast' : '🐌 Direct API'}
          </label>
          <button onClick={fetchPosts} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Posts'}
          </button>
        </div>

        {/* Create Post Form */}
        <div className="create-post">
          <h3>Create New Post</h3>
          <form onSubmit={createPost}>
            <input
              type="text"
              placeholder="Post Title"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Post Content"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              rows="4"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-section">
          <h3>Posts ({posts.length})</h3>
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <div className="post-meta">
                    <small>By: {post.user?.name || 'Unknown'}</small>
                    <small>Created: {new Date(post.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {posts.length === 0 && !loading && (
            <div className="no-posts">
              No posts found. Create your first post above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
