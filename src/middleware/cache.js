const NodeCache = require("node-cache");

// Create a cache with 5-minute TTL (standard check: 10 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 10 });

// Middleware to serve from cache if available
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== "GET") {
    return next();
  }

  // Create cache key from URL and query params
  const cacheKey = `${req.method}:${req.url}`;
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    res.set("X-Cache", "HIT");
    return res.json(cachedResponse);
  }

  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to cache response
  res.json = function (data) {
    const cacheKey = `${req.method}:${req.url}`;
    cache.set(cacheKey, data);
    res.set("X-Cache", "MISS");
    return originalJson(data);
  };

  next();
};

// Helper function to invalidate cache on write operations
const invalidateCache = () => {
  cache.flushAll();
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cache,
};
