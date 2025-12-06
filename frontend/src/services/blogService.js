import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class BlogService {
  getAll(params = {}) {
    return axios.get(`${API_BASE_URL}/blog/posts/`, { params });
  }

  getPublished(params = {}) {
    return axios.get(`${API_BASE_URL}/blog/posts/published/`, { params });
  }

  getById(id) {
    return axios.get(`${API_BASE_URL}/blog/posts/${id}/`);
  }

  getBySlug(slug) {
    return axios.get(`${API_BASE_URL}/blog/posts/`, {
      params: { slug }
    });
  }

  create(data, token) {
    return axios.post(`${API_BASE_URL}/blog/posts/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  update(id, data, token) {
    return axios.put(`${API_BASE_URL}/blog/posts/${id}/`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  delete(id, token) {
    return axios.delete(`${API_BASE_URL}/blog/posts/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getCategories() {
    return axios.get(`${API_BASE_URL}/blog/posts/categories/`);
  }
}

export default new BlogService();