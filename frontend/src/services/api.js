const BASE_URL = 'http://localhost:3000';

let isRefreshing = false;

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (response.status === 401 && !isRefreshing && !endpoint.includes('/auth')) {
    isRefreshing = true;
    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        isRefreshing = false;
        return request(endpoint, options, true);
      } else {
        isRefreshing = false;
        if (refreshResponse.ok) {
          return request(endpoint, options, true);
        } else {
          // Ne pas rediriger — juste retourner null
          return null;
        }
      }
    } catch {
      isRefreshing = false;
      window.location.href = '/';
      return;
    }
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
};

// --- Auth ---
export const register = (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
export const login = (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const logout = () => request('/auth/logout', { method: 'POST' });
export const forgotPassword = (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });
export const resetPassword = (token, body) => request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(body) });

// --- Annonces ---
export const getAds = () => request('/ads');
export const getAdById = (id) => request(`/ads/${id}`);
export const createAd = (body) => request('/ads', { method: 'POST', body: JSON.stringify(body) });
export const updateAd = (id, body) => request(`/ads/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteAd = (id) => request(`/ads/${id}`, { method: 'DELETE' });
export const searchAds = (params) => request(`/ads/search?${new URLSearchParams(params)}`);
export const getTowns = () => request('/towns');

// --- Catégories ---
export const getCategories = () => request('/categories');
export const getAdsByCategory = (id) => request(`/categories/${id}`);

// --- Favoris ---
export const getFavorites = () => request('/favorites');
export const addFavorite = (adId) => request(`/favorites/${adId}`, { method: 'POST' });
export const removeFavorite = (adId) => request(`/favorites/${adId}`, { method: 'DELETE' });

// --- Profil ---
export const getProfile = () => request('/profile', {}, true);
export const updateProfile = (body) => request('/profile', { method: 'PUT', body: JSON.stringify(body) });
export const changePassword = (body) => request('/profile/password', { method: 'PUT', body: JSON.stringify(body) });
export const deleteAccount = () => request('/profile', { method: 'DELETE' });


// --- Messages ---
export const getConversations = () => request('/messages');
export const getConversation = (userId) => request(`/messages/${userId}`);
export const sendMessage = (body) => request('/messages', { method: 'POST', body: JSON.stringify(body) });
export const deleteMessage = (id) => request(`/messages/${id}`, { method: 'DELETE' });
export const getUserById = (id) => request(`/users/${id}`);

// --- Reviews ---
export const addReview = (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) });
export const getSellerReviews = (sellerId) => request(`/reviews/seller/${sellerId}`);

// --- Transactions ---
export const createTransaction = (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) });
export const getMyTransactions = () => request('/transactions');
export const cancelTransaction = (id) => request(`/transactions/${id}/cancel`, { method: 'PATCH' });

// --- Ajout et suppression des photos lors de la modification ---
export const addAdImages = async (adId, files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  const response = await fetch(`http://localhost:3000/ads/${adId}/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return response.json();
};

export const deleteAdImage = (adId, image_url) => request(`/ads/${adId}/images`, {
  method: 'DELETE',
  body: JSON.stringify({ image_url }),
});
