#!/usr/bin/env python3
import json, requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

SA_KEY = "/tmp/build-output.json"
SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

def get_token():
    creds = service_account.Credentials.from_service_account_file(SA_KEY, scopes=SCOPES)
    creds.refresh(Request())
    return creds.token

def main():
    token = get_token()
    h = {"Authorization": f"Bearer {token}"}
    
    build_id = "5d4892de-174b-431c-8d09-6036402f5d46"
    
    # Get build details
    full = requests.get(f"https://cloudbuild.googleapis.com/v1/projects/hooksniff-app/builds/{build_id}", headers=h).json()
    
    # Get the log URL and try to fetch log contents via Cloud Logging API
    log_url = full.get("logUrl", "")
    print(f"Log URL: {log_url}")
    
    # Use Cloud Logging API to get build logs
    # The log name for Cloud Build is "cloudbuild"
    project_num = "1046140057667"
    
    # Try fetching logs via Logging API
    filter_str = f'resource.type="build" AND resource.labels.build_id="{build_id}"'
    log_url_api = "https://logging.googleapis.com/v2/entries:list"
    payload = {
        "resourceNames": [f"projects/hooksniff-app"],
        "filter": filter_str,
        "pageSize": 100,
        "orderBy": "timestamp asc"
    }
    
    r = requests.post(log_url_api, headers={**h, "Content-Type": "application/json"}, json=payload)
    print(f"Logging API status: {r.status_code}")
    
    if r.status_code == 200:
        data = r.json()
        entries = data.get("entries", [])
        print(f"Found {len(entries)} log entries\n")
        
        # Filter for the build-api step (step 1) which failed
        for entry in entries:
            text = entry.get("textPayload", "")
            insert_id = entry.get("insertId", "")
            labels = entry.get("labels", {})
            step_id = labels.get("step_id", "")
            
            if text:
                # Show errors and important lines
                if any(kw in text.lower() for kw in ["error", "failed", "abort", "fatal", "cannot", "unable", "panic"]):
                    print(f"[{step_id}] {text[:500]}")
                elif "step_id" in labels and step_id == "build-api":
                    # Show all build-api step output (might be truncated)
                    if len(text) > 100:  # Skip tiny entries
                        print(f"[{step_id}] {text[:500]}")
    else:
        print(f"Error: {r.text[:1000]}")
    
    # Also try: get the build's results which may contain logs
    results = full.get("results", {})
    if results:
        print(f"\nResults: {json.dumps(results, indent=2)[:3000]}")
    
    # Try fetching the actual log from the log URL pattern
    # Cloud Build stores logs in: cloudbuild.googleapis.com%2Fbuild_id
    print("\n--- Trying direct log fetch ---")
    log_filter = f'logName="projects/hooksniff-app/logs/cloudbuild" AND resource.labels.build_id="{build_id}"'
    payload2 = {
        "resourceNames": [f"projects/hooksniff-app"],
        "filter": log_filter,
        "pageSize": 500,
        "orderBy": "timestamp asc"
    }
    r2 = requests.post("https://logging.googleapis.com/v2/entries:list", headers={**h, "Content-Type": "application/json"}, json=payload2)
    if r2.status_code == 200:
        entries2 = r2.json().get("entries", [])
        print(f"Found {len(entries2)} cloudbuild log entries")
        
        # Find the build-api step output - look for cargo errors
        for entry in entries2:
            text = entry.get("textPayload", "")
            labels = entry.get("labels", {})
            step_id = labels.get("step_id", "")
            
            if step_id == "build-api" and text:
                # Look for Rust/cargo errors
                lines = text.split("\n")
                error_lines = [l for l in lines if any(kw in l.lower() for kw in ["error[", "error:", "aborting", "could not compile", "failed to compile"])]
                if error_lines:
                    print(f"\n=== COMPILATION ERRORS (build-api step) ===")
                    for el in error_lines[:50]:
                        print(el)
                    print(f"=== END ({len(error_lines)} error lines) ===")
    else:
        print(f"Error: {r2.text[:1000]}")

if __name__ == "__main__":
    main()
