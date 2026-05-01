/**
 * Shared image resolution utility.
 * Used by both Bodycontent and Favorites to ensure identical image display.
 */

const MENU_IMAGES_MAP = {
  "samosa.jpg": "/footer-images/vegitem.jpg",
  "paneer-tikka.jpg": "/footer-images/vegitem.jpg",
  "spring-rolls.jpg": "/footer-images/veggies.jpg",
  "aloo-tikki.jpg": "/footer-images/vegitem.jpg",
  "corn-fritters.jpg": "/footer-images/vegitem.jpg",
  "chicken-tikka.jpg": "/footer-images/chicken.png",
  "tandoori-prawns.jpg": "/footer-images/chicken.png",
  "fish-amritsari.jpg": "/footer-images/seafood.jpg",
  "chicken-pakora.jpg": "/footer-images/chicken.png",
  "mutton-seekh.jpg": "/footer-images/meat.png",
  "tandoori-chicken-half.jpg": "/footer-images/meat.png",
  "tandoori-fish.jpg": "/footer-images/seafood.jpg",
  "tandoori-mushroom.jpg": "/footer-images/vegitem.jpg",
  "tandoori-paneer.jpg": "/footer-images/vegitem.jpg",
  "tomato-soup.jpg": "/footer-images/soups.jpg",
  "chicken-soup.jpg": "/footer-images/soups.jpg",
  "mulligatawny.jpg": "/footer-images/soups.jpg",
  "veg-soup.jpg": "/footer-images/soups.jpg",
  "greek-salad.jpg": "/footer-images/salads.jpg",
  "chicken-salad.jpg": "/footer-images/salads.jpg",
  "caesar-salad.jpg": "/footer-images/salads.jpg",
  "veg-manchurian.jpg": "/footer-images/veggies.jpg",
  "chicken-manchurian.jpg": "/footer-images/chicken.png",
  "veg-fried-rice.jpg": "/footer-images/food.png",
  "chicken-fried-rice.jpg": "/footer-images/food.png",
  "paneer-butter-masala.jpg": "/footer-images/food.png",
  "butter-chicken.jpg": "/footer-images/chicken.png",
  "mutton-biryani.jpg": "/footer-images/chicken.png",
  "hyd-biryani.jpg": "/footer-images/chicken.png",
  "gulab-jamun.jpg": "/footer-images/desserts.jpg",
  "rasmalai.jpg": "/footer-images/desserts.jpg",
  "kheer.jpg": "/footer-images/desserts.jpg",
  "ice-cream.jpg": "/footer-images/ice_cream.jpg",
};

// Generic category fallbacks (used only when no name-based image is available)
const CATEGORY_FALLBACK = {
  "Veg Starters": "/footer-images/vegitem.jpg",
  "Non-Veg Starters": "/footer-images/nonvegitem.jpg",
  "Tandooris": "/footer-images/meat.png",
  "Soups": "/footer-images/soups.jpg",
  "Salads": "/footer-images/salads.jpg",
  "Sandwiches": "/footer-images/burger.png",
  "Signature Dishes": "/footer-images/food.png",
  "Biryanis": "/footer-images/chicken.png",
  "Main Course": "/footer-images/maincourse.jpg",
  "Rice & Breads": "/footer-images/food.png",
  "South Indian": "/footer-images/food.png",
  "Chinese": "/footer-images/chinese.png",
  "Chinese/Indo-Chinese": "/footer-images/chinese.png",
  "Beverages": "/footer-images/drinks.jpg",
  "Cocktails/Mocktails": "/footer-images/cooldrinks.png",
  "Desserts": "/footer-images/desserts.jpg",
  "Fruits": "/banner-images/banner0.jpg",
  "Vegetables": "/banner-images/banner1.jpg",
  "Drinks": "/banner-images/banner2.jpg",
  "Bakery": "/banner-images/banner3.jpg",
};

/**
 * Resolves the best image src for a menu item.
 * Priority:
 *   1. /menu-images/ path → mapped local file or name-based Unsplash
 *   2. Any other explicit image field (not a generic category fallback)
 *   3. Name-based Picsum seed (unique per item, consistent across renders)
 *   4. Category fallback
 */
export function resolveItemImage(item) {
  const name = item?.name || item?.title || "";
  const category = item?.category || "";

  // If it's already a Picsum or Unsplash URL, return it directly to avoid re-resolution
  const candidate = item?.image || item?.img || item?.imageUrl;
  if (candidate?.includes("picsum.photos") || candidate?.includes("unsplash.com") || candidate?.includes("mixkit.co")) {
    return candidate;
  }

  // All known generic category fallback paths
  const genericPaths = new Set(Object.values(CATEGORY_FALLBACK));

  // Handle /menu-images/ paths
  if (candidate?.startsWith("/menu-images/")) {
    const filename = candidate.split("/").pop()?.toLowerCase();
    const mapped = MENU_IMAGES_MAP[filename];
    if (mapped) return mapped;
    // Unmapped menu-image → use item name for Unsplash
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(name || category || "food")}`;
  }

  // If candidate is a real unique image (not a generic category fallback), use it
  if (candidate && !genericPaths.has(candidate)) {
    return candidate;
  }

  // Use deterministic name-based seed for unique, consistent image per item
  const seed = (name || category || "food").replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
}
