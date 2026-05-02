#!/usr/bin/env python3
"""
Platform Tracking Feature Test for My Optical Wallet
Tests the new platform tracking feature in analytics
"""

import requests
import json
import sys

# Backend URL
BACKEND_URL = "https://optical-rx-now.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}

def log_test(test_name: str, passed: bool, message: str = ""):
    """Log test result"""
    test_results["total"] += 1
    if passed:
        test_results["passed"].append(test_name)
        print(f"✅ PASS: {test_name}")
        if message:
            print(f"   {message}")
    else:
        test_results["failed"].append(test_name)
        print(f"❌ FAIL: {test_name}")
        if message:
            print(f"   {message}")

def test_health_check():
    """Test 1: Health check endpoint"""
    print("\n" + "="*80)
    print("TEST 1: Health Check Endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                log_test("Health Check", True, f"Response: {data}")
                return True
            else:
                log_test("Health Check", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("Health Check", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Health Check", False, f"Exception: {str(e)}")
        return False

def test_log_events_with_platform():
    """Test 2: Log events with platform data"""
    print("\n" + "="*80)
    print("TEST 2: Log Events with Platform Data")
    print("="*80)
    
    # Test events with different platforms
    test_events = [
        {"event_type": "app_open", "platform": "android", "metadata": {"platform": "android"}},
        {"event_type": "app_open", "platform": "ios", "metadata": {"platform": "ios"}},
        {"event_type": "app_open", "platform": "web", "metadata": {"platform": "web"}},
        {"event_type": "share_click", "platform": "android", "metadata": {"platform": "android"}},
        {"event_type": "banner_view", "platform": "ios", "metadata": {"platform": "ios"}},
        {"event_type": "affiliate_click", "platform": "web", "metadata": {"platform": "web"}},
    ]
    
    all_passed = True
    for i, event in enumerate(test_events, 1):
        try:
            response = requests.post(f"{API_BASE}/analytics/event", json=event, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "logged":
                    log_test(f"Log Event {i} ({event['event_type']} - {event['platform']})", 
                            True, f"Response: {data}")
                else:
                    log_test(f"Log Event {i} ({event['event_type']} - {event['platform']})", 
                            False, f"Unexpected response: {data}")
                    all_passed = False
            else:
                log_test(f"Log Event {i} ({event['event_type']} - {event['platform']})", 
                        False, f"Status: {response.status_code}, Response: {response.text}")
                all_passed = False
        except Exception as e:
            log_test(f"Log Event {i} ({event['event_type']} - {event['platform']})", 
                    False, f"Exception: {str(e)}")
            all_passed = False
    
    return all_passed

def test_analytics_dashboard_with_platform():
    """Test 3: Analytics Dashboard with platform breakdown"""
    print("\n" + "="*80)
    print("TEST 3: Analytics Dashboard with Platform Breakdown")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for required keys
            required_keys = ["events", "summary", "affiliate_stats", "banner_stats"]
            missing_keys = [key for key in required_keys if key not in data]
            
            if missing_keys:
                log_test("Analytics Dashboard - Standard Keys", False, 
                        f"Missing keys: {missing_keys}")
                return False
            else:
                log_test("Analytics Dashboard - Standard Keys", True, 
                        f"All standard keys present: {required_keys}")
            
            # Check for platform_breakdown key
            if "platform_breakdown" not in data:
                log_test("Analytics Dashboard - Platform Breakdown Key", False, 
                        "Missing 'platform_breakdown' key in response")
                return False
            else:
                platform_breakdown = data["platform_breakdown"]
                log_test("Analytics Dashboard - Platform Breakdown Key", True, 
                        f"Platform breakdown: {platform_breakdown}")
                
                # Verify platform counts
                expected_platforms = ["android", "ios", "web"]
                found_platforms = [p for p in expected_platforms if p in platform_breakdown]
                
                if found_platforms:
                    log_test("Analytics Dashboard - Platform Counts", True, 
                            f"Found platforms: {found_platforms} with counts: {[platform_breakdown[p] for p in found_platforms]}")
                else:
                    log_test("Analytics Dashboard - Platform Counts", False, 
                            f"No expected platforms found in breakdown: {platform_breakdown}")
            
            # Check for platform_events key
            if "platform_events" not in data:
                log_test("Analytics Dashboard - Platform Events Key", False, 
                        "Missing 'platform_events' key in response")
                return False
            else:
                platform_events = data["platform_events"]
                log_test("Analytics Dashboard - Platform Events Key", True, 
                        f"Platform events structure present with {len(platform_events)} platforms")
                
                # Verify structure of platform_events
                if platform_events:
                    sample_platform = list(platform_events.keys())[0]
                    sample_events = platform_events[sample_platform]
                    log_test("Analytics Dashboard - Platform Events Structure", True, 
                            f"Sample platform '{sample_platform}' has events: {sample_events}")
                else:
                    log_test("Analytics Dashboard - Platform Events Structure", False, 
                            "Platform events is empty")
            
            return True
        else:
            log_test("Analytics Dashboard", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Analytics Dashboard", False, f"Exception: {str(e)}")
        return False

def test_backward_compatibility():
    """Test 4: Backward compatibility - events without platform field"""
    print("\n" + "="*80)
    print("TEST 4: Backward Compatibility (No Platform Field)")
    print("="*80)
    
    try:
        # Log event without platform field
        event = {"event_type": "app_open"}
        response = requests.post(f"{API_BASE}/analytics/event", json=event, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "logged":
                log_test("Log Event Without Platform", True, 
                        f"Event logged successfully without platform field. Response: {data}")
                
                # Verify it appears in dashboard with "unknown" platform
                dashboard_response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
                if dashboard_response.status_code == 200:
                    dashboard_data = dashboard_response.json()
                    platform_breakdown = dashboard_data.get("platform_breakdown", {})
                    
                    if "unknown" in platform_breakdown:
                        log_test("Backward Compatibility - Unknown Platform", True, 
                                f"Event without platform defaulted to 'unknown'. Count: {platform_breakdown['unknown']}")
                    else:
                        log_test("Backward Compatibility - Unknown Platform", False, 
                                f"'unknown' platform not found in breakdown: {platform_breakdown}")
                else:
                    log_test("Backward Compatibility - Dashboard Check", False, 
                            f"Failed to fetch dashboard: {dashboard_response.status_code}")
                
                return True
            else:
                log_test("Log Event Without Platform", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("Log Event Without Platform", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Log Event Without Platform", False, f"Exception: {str(e)}")
        return False

def test_financial_dashboard():
    """Test 5: Financial dashboard still works"""
    print("\n" + "="*80)
    print("TEST 5: Financial Dashboard (Regression Test)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/finance/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["commission", "invoices", "total_revenue"]
            missing_keys = [key for key in required_keys if key not in data]
            
            if missing_keys:
                log_test("Financial Dashboard", False, f"Missing keys: {missing_keys}")
                return False
            else:
                log_test("Financial Dashboard", True, 
                        f"All required keys present. Commission: {data.get('commission')}, "
                        f"Invoices: {data.get('invoices')}, Revenue: {data.get('total_revenue')}")
                return True
        else:
            log_test("Financial Dashboard", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Financial Dashboard", False, f"Exception: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {len(test_results['passed'])}")
    print(f"Failed: {len(test_results['failed'])}")
    
    if test_results['failed']:
        print("\n❌ Failed Tests:")
        for test in test_results['failed']:
            print(f"  - {test}")
    
    if test_results['passed']:
        print("\n✅ Passed Tests:")
        for test in test_results['passed']:
            print(f"  - {test}")
    
    print("\n" + "="*80)
    
    # Return exit code
    return 0 if len(test_results['failed']) == 0 else 1

def main():
    """Run all tests"""
    print("="*80)
    print("PLATFORM TRACKING FEATURE TEST SUITE")
    print("="*80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    
    # Run tests in order
    test_health_check()
    test_log_events_with_platform()
    test_analytics_dashboard_with_platform()
    test_backward_compatibility()
    test_financial_dashboard()
    
    # Print summary and exit
    exit_code = print_summary()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
