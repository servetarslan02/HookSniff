import Foundation

/// Internal JSON parsing helpers shared across resource classes.
enum JSONHelpers {
    /// Extract a `[[String: Any]]` array from an API response body.
    /// Handles both `{ "data": [...] }` envelope and raw array responses.
    static func dataArray(from body: Any?) -> [[String: Any]] {
        if let dict = body as? [String: Any], let data = dict["data"] as? [[String: Any]] {
            return data
        }
        if let arr = body as? [[String: Any]] {
            return arr
        }
        return []
    }

    /// Extract `has_more` boolean from a paginated response.
    static func hasMore(from body: Any?) -> Bool {
        if let dict = body as? [String: Any], let hm = dict["has_more"] as? Bool {
            return hm
        }
        return false
    }

    /// Cast body to `[String: Any]` dictionary, defaulting to empty.
    static func dict(from body: Any?) -> [String: Any] {
        (body as? [String: Any]) ?? [:]
    }

    /// Extract a list of dicts from a response (data envelope or raw array).
    static func list(from body: Any?) -> [[String: Any]] {
        if let dict = body as? [String: Any], let data = dict["data"] as? [[String: Any]] {
            return data
        }
        if let arr = body as? [[String: Any]] {
            return arr
        }
        return []
    }
}
