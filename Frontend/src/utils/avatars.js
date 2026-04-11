// Utility for generating random profile pictures and default avatars

// Array of avatar URLs - using DiceBear API for random consistent avatars
export const getRandomAvatar = (username = "user") => {
  const styles = ['avataaars', 'big-ears', 'big-smile', 'pixel-art', 'personas'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${username || 'default'}`;
};

// Get avatar with fallback to random
export const getAvatarUrl = (profileImage, username = "user") => {
  if (profileImage) return profileImage;
  return getRandomAvatar(username);
};

// Get a consistent avatar for a username
export const getConsistentAvatar = (username) => {
  if (!username) username = 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};
