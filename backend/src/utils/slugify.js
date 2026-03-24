const slugify = require("slugify");

/**
 * generateSlug — creates a URL-safe slug from a string
 *
 * @param {string} value - Source string (e.g. post title)
 * @returns {string} slug
 *
 * Example: "Hello World! 2026" → "hello-world-2026"
 */
const generateSlug = (value) =>
    slugify(value, {
        lower: true,
        strict: true,  // strip special chars (keeps only alphanumeric + -)
        trim: true,
        replacement: "-",
    });

/**
 * generateUniqueSlug — generates a slug and ensures it doesn't already
 * exist in the given Mongoose model. Appends an incrementing suffix if needed.
 *
 * @param {string}          value   - Source string
 * @param {mongoose.Model}  Model   - Mongoose model to check uniqueness against
 * @param {string|null}     [excludeId] - Document ID to exclude (for updates)
 * @returns {Promise<string>} unique slug
 *
 * Example:
 *   "Firewall Setup" already exists → returns "firewall-setup-2"
 *   On update of the same doc      → returns "firewall-setup" (no suffix)
 */
const generateUniqueSlug = async (value, Model, excludeId = null) => {
    const baseSlug = generateSlug(value);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        // On updates, exclude the current document so it doesn't conflict with itself
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await Model.findOne(query).select("_id").lean();

        if (!existing) break; // slug is available

        // Collision — try "base-slug-2", "base-slug-3", …
        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }

    return slug;
};

module.exports = { generateSlug, generateUniqueSlug };