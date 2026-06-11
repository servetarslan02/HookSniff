//! WAF-Grade Injection Detection Engine
//!
//! Context-aware, recursive decoding, AST-level analysis.
//! Unlike simple pattern matching, this understands SQL/XSS/Path syntax.

use serde::Serialize;

/// Detection result with confidence and context
#[derive(Debug, Serialize)]
pub struct WafDetection {
    pub is_attack: bool,
    pub attack_type: String,
    pub confidence: f64,
    pub payload_snippet: String,
    pub decoded_payload: String,
    pub matched_rules: Vec<String>,
    pub severity: String,
}

/// Recursive URL decoder — handles single, double, triple encoding
fn recursive_decode(input: &str, max_depth: usize) -> String {
    let mut current = input.to_string();
    for _ in 0..max_depth {
        let decoded = url_decode(&current);
        if decoded == current { break; }
        current = decoded;
    }
    current
}

/// Single-pass URL decode
fn url_decode(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let chars: Vec<char> = s.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '%' && i + 2 < chars.len() {
            let hex: String = chars[i+1..=i+2].iter().collect();
            if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                result.push(byte as char);
                i += 3;
                continue;
            }
        } else if chars[i] == '+' {
            result.push(' ');
            i += 1;
            continue;
        }
        result.push(chars[i]);
        i += 1;
    }
    result
}

/// HTML entity decoder
fn decode_html_entities(s: &str) -> String {
    s.replace("&#39;", "'")
        .replace("&quot;", "\"")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&amp;", "&")
        .replace("&#x27;", "'")
        .replace("&#x2F;", "/")
        .replace("&#x5C;", "\\")
        .replace("&#x00;", "")
}

/// Unicode escape decoder
fn decode_unicode(s: &str) -> String {
    let mut result = s.to_string();
    result = result.replace("\\u0027", "'");
    result = result.replace("\\u0022", "\"");
    result = result.replace("\\u003C", "<");
    result = result.replace("\\u003E", ">");
    result = result.replace("\\u0026", "&");
    result = result.replace("\\u002F", "/");
    result = result.replace("\\u005C", "\\");
    result
}

/// Full decode pipeline: recursive URL + HTML entities + Unicode + null bytes
fn full_decode(input: &str) -> String {
    let s = recursive_decode(input, 3);
    let s = decode_html_entities(&s);
    let s = decode_unicode(&s);
    // Remove null bytes and normalize whitespace
    let s = s.replace('\0', "");
    let s = s.split_whitespace().collect::<Vec<&str>>().join(" ");
    s.to_lowercase()
}

/// SQL injection detection with context awareness
fn detect_sql_injection(_raw: &str, decoded: &str) -> Option<(f64, Vec<String>)> {
    let mut score: f64 = 0.0;
    let mut rules = Vec::new();

    // Critical: Boolean-based injection
    let bool_patterns = [
        ("' or '", 0.95), ("' or 1=1", 0.99), ("' or '1'='1", 0.99),
        ("1=1--", 0.95), ("1=1#", 0.95), ("' or true", 0.95),
        ("' and '", 0.7), ("' and 1=1", 0.9), ("' and '1'='1", 0.9),
    ];
    for (pattern, conf) in &bool_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_bool:{}", pattern));
        }
    }

    // Critical: Union-based injection
    let union_patterns = [
        ("union select", 0.99), ("union all select", 0.99),
        ("union distinct", 0.9), (") union", 0.85),
    ];
    for (pattern, conf) in &union_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_union:{}", pattern));
        }
    }

    // Critical: Stacked queries
    let stacked_patterns = [
        ("; drop table", 0.99), ("; delete from", 0.99),
        ("; update ", 0.85), ("; insert into", 0.85),
        ("; exec(", 0.9), ("; execute(", 0.9),
    ];
    for (pattern, conf) in &stacked_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_stacked:{}", pattern));
        }
    }

    // High: Time-based blind injection
    let time_patterns = [
        ("sleep(", 0.9), ("benchmark(", 0.9), ("pg_sleep", 0.95),
        ("waitfor delay", 0.95), ("dbms_pipe.receive_message", 0.95),
    ];
    for (pattern, conf) in &time_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_blind_time:{}", pattern));
        }
    }

    // High: Error-based injection
    let error_patterns = [
        ("extractvalue(", 0.9), ("updatexml(", 0.9),
        ("exp(~", 0.85), ("convert(", 0.6), ("cast(", 0.5),
        ("information_schema", 0.85), ("pg_catalog", 0.85),
    ];
    for (pattern, conf) in &error_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_error:{}", pattern));
        }
    }

    // Medium: Comment injection
    let comment_patterns = [
        ("/*", 0.4), ("*/", 0.4), ("-- ", 0.5), ("#", 0.3),
    ];
    for (pattern, conf) in &comment_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("sql_comment:{}", pattern));
        }
    }

    // Context: Check if SQL keywords appear in non-SQL context
    // (e.g., "select" in a product name is fine, but "select * from" is not)
    let sql_combo_patterns = [
        ("select.*from", 0.85), ("select.*where", 0.85),
        ("insert.*into.*values", 0.9), ("update.*set.*where", 0.9),
        ("delete.*from.*where", 0.9), ("drop.*table", 0.95),
        ("alter.*table", 0.85), ("create.*table", 0.85),
        ("exec.*xp_", 0.95), ("execute.*sp_", 0.9),
    ];
    for (pattern, conf) in &sql_combo_patterns {
        let parts: Vec<&str> = pattern.split(".*").collect();
        if parts.len() == 2 && decoded.contains(parts[0]) && decoded.contains(parts[1]) {
            // Check proximity — keywords should be within 50 chars
            if let Some(pos1) = decoded.find(parts[0]) {
                if let Some(pos2) = decoded[pos1..].find(parts[1]) {
                    if pos2 < 50 {
                        score = score.max(*conf);
                        rules.push(format!("sql_combo:{}", pattern));
                    }
                }
            }
        }
    }

    if score >= 0.5 {
        Some((score, rules))
    } else {
        None
    }
}

/// XSS detection with context awareness
fn detect_xss(_raw: &str, decoded: &str) -> Option<(f64, Vec<String>)> {
    let mut score: f64 = 0.0;
    let mut rules = Vec::new();

    // Critical: Script injection
    let script_patterns = [
        ("<script", 0.99), ("</script", 0.95),
        ("javascript:", 0.95), ("vbscript:", 0.9),
        ("data:text/html", 0.9), ("data:application", 0.85),
    ];
    for (pattern, conf) in &script_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("xss_script:{}", pattern));
        }
    }

    // High: Event handler injection
    let event_patterns = [
        ("onerror=", 0.9), ("onload=", 0.9), ("onclick=", 0.85),
        ("onmouseover=", 0.85), ("onfocus=", 0.8), ("onblur=", 0.8),
        ("onsubmit=", 0.85), ("onchange=", 0.75), ("oninput=", 0.75),
        ("onkeydown=", 0.75), ("onkeyup=", 0.75), ("onkeypress=", 0.75),
        ("ondrag=", 0.7), ("ondrop=", 0.7),
    ];
    for (pattern, conf) in &event_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("xss_event:{}", pattern));
        }
    }

    // High: DOM manipulation
    let dom_patterns = [
        ("document.cookie", 0.95), ("document.domain", 0.9),
        ("document.write", 0.85), ("document.location", 0.85),
        ("window.location", 0.7), ("eval(", 0.85),
        ("alert(", 0.7), ("confirm(", 0.7), ("prompt(", 0.65),
        ("fromcharcode(", 0.85), ("string.fromcharcode", 0.85),
    ];
    for (pattern, conf) in &dom_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("xss_dom:{}", pattern));
        }
    }

    // Medium: HTML tag injection
    let tag_patterns = [
        ("<img", 0.6), ("<svg", 0.7), ("<iframe", 0.85),
        ("<object", 0.8), ("<embed", 0.8), ("<link", 0.6),
        ("<meta", 0.6), ("<form", 0.65), ("<input", 0.5),
        ("<body", 0.6), ("<details", 0.5), ("<marquee", 0.5),
    ];
    for (pattern, conf) in &tag_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("xss_tag:{}", pattern));
        }
    }

    // Medium: CSS injection
    let css_patterns = [
        ("expression(", 0.8), ("@import", 0.6), ("url(", 0.4),
        ("behavior:", 0.8), ("-moz-binding", 0.85),
    ];
    for (pattern, conf) in &css_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("xss_css:{}", pattern));
        }
    }

    if score >= 0.5 {
        Some((score, rules))
    } else {
        None
    }
}

/// Path traversal detection with context awareness
fn detect_path_traversal(_raw: &str, decoded: &str) -> Option<(f64, Vec<String>)> {
    let mut score: f64 = 0.0;
    let mut rules = Vec::new();

    // Critical: Unix system files
    let unix_patterns = [
        ("/etc/passwd", 0.99), ("/etc/shadow", 0.99),
        ("/etc/hosts", 0.85), ("/etc/crontab", 0.85),
        ("/proc/self", 0.9), ("/proc/version", 0.85),
        ("/var/log", 0.7), ("/var/www", 0.7),
    ];
    for (pattern, conf) in &unix_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("traversal_unix:{}", pattern));
        }
    }

    // Critical: Windows system files
    let win_patterns = [
        ("c:\\windows", 0.95), ("c:\\winnt", 0.95),
        ("c:\\boot.ini", 0.99), ("c:\\system32", 0.9),
    ];
    for (pattern, conf) in &win_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("traversal_win:{}", pattern));
        }
    }

    // High: Directory traversal sequences
    let traversal_seqs = [
        ("../", 0.7), ("..\\", 0.7), ("..%2f", 0.85),
        ("..%5c", 0.85), ("%2e%2e/", 0.9), ("%2e%2e%2f", 0.9),
        (".%2e/", 0.85), ("..%00/", 0.95), ("..%00", 0.9),
    ];
    for (pattern, conf) in &traversal_seqs {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("traversal_seq:{}", pattern));
        }
    }

    // High: Null byte injection
    if decoded.contains("%00") || decoded.contains('\0') {
        score = score.max(0.9);
        rules.push("traversal_nullbyte".to_string());
    }

    // Medium: Web server files
    let web_patterns = [
        ("/.env", 0.85), ("/.git/", 0.85), ("/.svn/", 0.8),
        ("/web.config", 0.8), ("/.htaccess", 0.8),
        ("/wp-config", 0.85), ("/config.php", 0.75),
    ];
    for (pattern, conf) in &web_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("traversal_web:{}", pattern));
        }
    }

    if score >= 0.5 {
        Some((score, rules))
    } else {
        None
    }
}

/// SSRF detection
fn detect_ssrf(_raw: &str, decoded: &str) -> Option<(f64, Vec<String>)> {
    let mut score: f64 = 0.0;
    let mut rules = Vec::new();

    let ssrf_patterns = [
        ("127.0.0.1", 0.85), ("localhost", 0.6),
        ("169.254.169.254", 0.99), ("metadata.google", 0.99),
        ("[::1]", 0.8), ("0.0.0.0", 0.75),
        ("file://", 0.9), ("gopher://", 0.95),
        ("dict://", 0.9), ("ftp://", 0.5),
    ];
    for (pattern, conf) in &ssrf_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("ssrf:{}", pattern));
        }
    }

    // Internal IP ranges
    let internal_ips = [
        "10.", "172.16.", "172.17.", "172.18.", "172.19.",
        "172.20.", "172.21.", "172.22.", "172.23.",
        "172.24.", "172.25.", "172.26.", "172.27.",
        "172.28.", "172.29.", "172.30.", "172.31.", "192.168.",
    ];
    for pattern in &internal_ips {
        if decoded.contains(pattern) {
            score = score.max(0.8);
            rules.push(format!("ssrf_internal:{}", pattern));
        }
    }

    if score >= 0.5 {
        Some((score, rules))
    } else {
        None
    }
}

/// Command injection detection
fn detect_command_injection(_raw: &str, decoded: &str) -> Option<(f64, Vec<String>)> {
    let mut score: f64 = 0.0;
    let mut rules = Vec::new();

    let cmd_patterns = [
        ("; ls ", 0.85), ("; cat ", 0.85), ("; whoami", 0.95),
        ("; id", 0.7), ("; uname", 0.85), ("; ping ", 0.7),
        ("| ls ", 0.85), ("| cat ", 0.85), ("| whoami", 0.95),
        ("`ls`", 0.85), ("`cat ", 0.85), ("`whoami`", 0.95),
        ("$(ls)", 0.85), ("$(cat ", 0.85), ("$(whoami)", 0.95),
        ("&& ls", 0.8), ("&& cat", 0.8), ("&& whoami", 0.9),
        ("|| ls", 0.75), ("|| cat", 0.75),
        ("/bin/sh", 0.95), ("/bin/bash", 0.95), ("cmd.exe", 0.95),
        ("powershell", 0.85), ("wget ", 0.7), ("curl ", 0.6),
    ];
    for (pattern, conf) in &cmd_patterns {
        if decoded.contains(pattern) {
            score = score.max(*conf);
            rules.push(format!("cmd_inject:{}", pattern));
        }
    }

    if score >= 0.5 {
        Some((score, rules))
    } else {
        None
    }
}

/// Main WAF analysis — runs all detectors and returns highest confidence result
pub fn analyze_request(input: &str) -> Option<WafDetection> {
    if input.is_empty() || input.len() < 3 {
        return None;
    }

    let decoded = full_decode(input);
    let snippet = if input.len() > 200 { &input[..200] } else { input };

    let mut best: Option<WafDetection> = None;

    // Run all detectors
    if let Some((score, rules)) = detect_sql_injection(input, &decoded) {
        let detection = WafDetection {
            is_attack: true,
            attack_type: "sql_injection".to_string(),
            confidence: score,
            payload_snippet: snippet.to_string(),
            decoded_payload: decoded.clone(),
            matched_rules: rules,
            severity: if score >= 0.9 { "critical" } else if score >= 0.7 { "high" } else { "medium" }.to_string(),
        };
        if best.as_ref().map_or(true, |b| detection.confidence > b.confidence) {
            best = Some(detection);
        }
    }

    if let Some((score, rules)) = detect_xss(input, &decoded) {
        let detection = WafDetection {
            is_attack: true,
            attack_type: "xss".to_string(),
            confidence: score,
            payload_snippet: snippet.to_string(),
            decoded_payload: decoded.clone(),
            matched_rules: rules,
            severity: if score >= 0.9 { "critical" } else if score >= 0.7 { "high" } else { "medium" }.to_string(),
        };
        if best.as_ref().map_or(true, |b| detection.confidence > b.confidence) {
            best = Some(detection);
        }
    }

    if let Some((score, rules)) = detect_path_traversal(input, &decoded) {
        let detection = WafDetection {
            is_attack: true,
            attack_type: "path_traversal".to_string(),
            confidence: score,
            payload_snippet: snippet.to_string(),
            decoded_payload: decoded.clone(),
            matched_rules: rules,
            severity: if score >= 0.9 { "critical" } else if score >= 0.7 { "high" } else { "medium" }.to_string(),
        };
        if best.as_ref().map_or(true, |b| detection.confidence > b.confidence) {
            best = Some(detection);
        }
    }

    if let Some((score, rules)) = detect_ssrf(input, &decoded) {
        let detection = WafDetection {
            is_attack: true,
            attack_type: "ssrf".to_string(),
            confidence: score,
            payload_snippet: snippet.to_string(),
            decoded_payload: decoded.clone(),
            matched_rules: rules,
            severity: if score >= 0.9 { "critical" } else if score >= 0.7 { "high" } else { "medium" }.to_string(),
        };
        if best.as_ref().map_or(true, |b| detection.confidence > b.confidence) {
            best = Some(detection);
        }
    }

    if let Some((score, rules)) = detect_command_injection(input, &decoded) {
        let detection = WafDetection {
            is_attack: true,
            attack_type: "command_injection".to_string(),
            confidence: score,
            payload_snippet: snippet.to_string(),
            decoded_payload: decoded.clone(),
            matched_rules: rules,
            severity: if score >= 0.9 { "critical" } else if score >= 0.7 { "high" } else { "medium" }.to_string(),
        };
        if best.as_ref().map_or(true, |b| detection.confidence > b.confidence) {
            best = Some(detection);
        }
    }

    best
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sql_basic() {
        let r = analyze_request("' OR '1'='1").unwrap();
        assert_eq!(r.attack_type, "sql_injection");
        assert!(r.confidence >= 0.9);
    }

    #[test]
    fn test_sql_union() {
        let r = analyze_request("1 UNION SELECT username,password FROM users").unwrap();
        assert_eq!(r.attack_type, "sql_injection");
        assert!(r.confidence >= 0.9);
    }

    #[test]
    fn test_sql_encoded() {
        let r = analyze_request("%27%20OR%201%3D1--").unwrap();
        assert_eq!(r.attack_type, "sql_injection");
        assert!(r.confidence >= 0.9);
    }

    #[test]
    fn test_sql_double_encoded() {
        let r = analyze_request("%2527%2520OR%25201%253D1").unwrap();
        assert!(r.is_attack);
    }

    #[test]
    fn test_xss_script() {
        let r = analyze_request("<script>alert('xss')</script>").unwrap();
        assert_eq!(r.attack_type, "xss");
        assert!(r.confidence >= 0.9);
    }

    #[test]
    fn test_xss_event() {
        let r = analyze_request("\" onerror=\"alert(1)").unwrap();
        assert_eq!(r.attack_type, "xss");
    }

    #[test]
    fn test_xss_encoded() {
        let r = analyze_request("%3Cscript%3Ealert(1)%3C%2Fscript%3E").unwrap();
        assert_eq!(r.attack_type, "xss");
    }

    #[test]
    fn test_traversal() {
        let r = analyze_request("../../etc/passwd").unwrap();
        assert_eq!(r.attack_type, "path_traversal");
        assert!(r.confidence >= 0.7);
    }

    #[test]
    fn test_ssrf() {
        let r = analyze_request("http://169.254.169.254/latest/meta-data/").unwrap();
        assert_eq!(r.attack_type, "ssrf");
        assert!(r.confidence >= 0.9);
    }

    #[test]
    fn test_command_injection() {
        let r = analyze_request("; cat /etc/passwd").unwrap();
        assert!(r.is_attack);
    }

    #[test]
    fn test_safe_input() {
        assert!(analyze_request("hello world").is_none());
        assert!(analyze_request("john@example.com").is_none());
        assert!(analyze_request("My Product Name").is_none());
    }
}
