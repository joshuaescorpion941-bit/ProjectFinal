
import { useEffect, useState } from "react";
import { FavoritesContext } from "./favoritesContextValue";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("threadscope-favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      "threadscope-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  function toggleFavorite(id) {
    const productId = String(id);
    const isFavorite = favorites.includes(productId);

    setFavorites((previousFavorites) => (
      isFavorite
        ? previousFavorites.filter((favoriteId) => favoriteId !== productId)
        : [...previousFavorites, productId]
    ));

    if (!isFavorite) {
      setNotificationCount((count) => count + 1);
    }
  }

  function clearNotifications() {
    setNotificationCount(0);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        notificationCount,
        clearNotifications,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
