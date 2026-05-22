#!/usr/bin/env python3
import json, sys, requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

SA_KEY = "/tmp/build-output.json"
SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

def get_token():
    creds = service_account.Credentials.from_service_account_file(SA_KEY, scopes=SCOPES)
    creds.refresh(Request())
    return creds.token

def main():
    print("Authenticating...")
    token = get_token()
    print("✅ OK\n")
    h = {"Authorization": f"Bearer {token}"}

    # Recent builds
    r = requests.get("https://cloudbuild.googleapis.com/v1/projects/hooksniff-app/builds", headers=h, params={"pageSize": 5})
    r.raise_for_status()
    builds = r.json().get("builds", [])
    for b in builds:
        s = {"SUCCESS":"✅","FAILURE":"❌","WORKING":"🔄","QUEUED":"⏳"}.get(b.get("status"), "❓")
        print(f"  {s} {b.get('status'):10} {b.get('createTime','')}  id={b.get('id','')}")

    # Detailed log for first failed
    failed = [b for b in builds if b.get("status") in ("FAILURE","TIMEOUT","CANCELLED")]
    if failed:
        bid = failed[0]["id"]
        print(f"\n{'='*60}\nFAILED BUILD: {bid}\n{'='*60}")
        full = requests.get(f"https://cloudbuild.googleapis.com/v1/projects/hooksniff-app/builds/{bid}", headers=h).json()
        for i, step in enumerate(full.get("steps", [])):
            st = step.get("status","?")
            icon = "✅" if st=="SUCCESS" else "❌" if st=="FAILURE" else "❓"
            print(f"  Step {i}: {icon} {step.get('id','')} — exit={step.get('exitCode','?')}")
            if st == "FAILURE":
                args = step.get("args", [])
                print(f"    cmd: {' '.join(args[:8])}...")
        failure = full.get("failureInfo", {})
        if failure:
            print(f"\n  FailureInfo: {json.dumps(failure, indent=2)}")
        warnings = full.get("warnings", [])
        for w in warnings:
            print(f"  ⚠️  {w}")
        
        # Try to fetch actual log output
        log_url = full.get("logUrl", "")
        print(f"\n  Log URL: {log_url}")
    else:
        print("\n✅ No failed builds found")

if __name__ == "__main__":
    main()
