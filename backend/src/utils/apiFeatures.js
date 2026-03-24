/**
 * APIFeatures — chainable query builder for Mongoose
 *
 * Handles: filtering, sorting, field selection (projection), pagination
 *
 * Usage in a controller:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .filter()
 *     .sort()
 *     .project()
 *     .paginate();
 *
 *   const docs = await features.query;
 */
class APIFeatures {
    /**
     * @param {mongoose.Query} query      - Mongoose query object e.g. Model.find()
     * @param {object}         queryString - req.query from Express
     */
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // ─── Filtering ─────────────────────────────────────────────────────────────
    /**
     * Strips reserved keys (page, limit, sort, fields, search) from the query
     * string, then converts comparison operators (gte, gt, lte, lt) to MongoDB
     * syntax ($gte, $gt, $lte, $lt).
     *
     * Example: GET /posts?status=published&views[gte]=100
     */
    filter() {
        const reserved = ["page", "limit", "sort", "fields", "search"];
        const queryObj = { ...this.queryString };
        reserved.forEach((key) => delete queryObj[key]);

        // Replace operators: { views: { gte: "100" } } → { views: { $gte: "100" } }
        const queryStr = JSON.stringify(queryObj).replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // ─── Full-text / keyword search ────────────────────────────────────────────
    /**
     * Adds a $text search if a `search` param is present.
     * Requires a text index on the model.
     *
     * Example: GET /posts?search=cybersecurity
     */
    search(fields = []) {
        if (this.queryString.search) {
            if (fields.length > 0) {
                // Regex-based search across specified fields (no text index needed)
                const regex = new RegExp(this.queryString.search, "i");
                this.query = this.query.find({
                    $or: fields.map((field) => ({ [field]: regex })),
                });
            } else {
                // Fallback: MongoDB $text search (requires text index on model)
                this.query = this.query.find({
                    $text: { $search: this.queryString.search },
                });
            }
        }
        return this;
    }

    // ─── Sorting ───────────────────────────────────────────────────────────────
    /**
     * Sorts by comma-separated fields. Prefix with `-` for descending.
     * Defaults to newest first (-createdAt).
     *
     * Example: GET /posts?sort=-createdAt,title
     */
    sort() {
        const sortBy = this.queryString.sort
            ? this.queryString.sort.split(",").join(" ")
            : "-createdAt";

        this.query = this.query.sort(sortBy);
        return this;
    }

    // ─── Field projection ──────────────────────────────────────────────────────
    /**
     * Limits fields returned (projection). Comma-separated.
     * Always strips __v.
     *
     * Example: GET /posts?fields=title,slug,createdAt
     */
    project() {
        const fields = this.queryString.fields
            ? this.queryString.fields.split(",").join(" ")
            : "-__v";

        this.query = this.query.select(fields);
        return this;
    }

    // ─── Pagination ────────────────────────────────────────────────────────────
    /**
     * Applies skip/limit pagination.
     * Defaults: page=1, limit=10. Hard cap at 100 per page.
     *
     * Example: GET /posts?page=2&limit=20
     */
    paginate() {
        const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
        const limit = Math.min(100, parseInt(this.queryString.limit, 10) || 10);
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // Attach meta so controllers can pass it to the response
        this.pagination = { page, limit, skip };
        return this;
    }
}

module.exports = APIFeatures;