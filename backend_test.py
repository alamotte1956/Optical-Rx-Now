#!/usr/bin/env python3
"""
Backend API Testing for My Optical Wallet Admin Panel
Tests all CRUD operations for affiliates, banners, invoices, analytics, and financial dashboard
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://optical-rx-now.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}

# Store created IDs for cleanup and testing
created_ids = {
    "affiliates": [],
    "banners": [],
    "invoices": []
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

def test_affiliate_crud():
    """Test 2-5: Affiliate CRUD operations"""
    print("\n" + "="*80)
    print("TEST 2-5: Affiliate CRUD Operations")
    print("="*80)
    
    affiliate_id = None
    
    # Test 2: Create Affiliate
    print("\n--- Test 2: Create Affiliate ---")
    try:
        payload = {
            "name": "LensCrafters Premium",
            "url": "https://lenscrafters.com/optical-wallet",
            "commission": 15.5,
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/affiliates", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "affiliate" in data:
                affiliate_id = data["affiliate"]["affiliate_id"]
                created_ids["affiliates"].append(affiliate_id)
                log_test("Create Affiliate", True, f"Created affiliate with ID: {affiliate_id}")
            else:
                log_test("Create Affiliate", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("Create Affiliate", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Create Affiliate", False, f"Exception: {str(e)}")
        return False
    
    # Test 3: Get Affiliates (List)
    print("\n--- Test 3: Get Affiliates ---")
    try:
        response = requests.get(f"{API_BASE}/affiliates", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "affiliates" in data and isinstance(data["affiliates"], list):
                found = any(a.get("affiliate_id") == affiliate_id for a in data["affiliates"])
                if found:
                    log_test("Get Affiliates", True, f"Found {len(data['affiliates'])} affiliates, including created one")
                else:
                    log_test("Get Affiliates", False, f"Created affiliate not found in list")
            else:
                log_test("Get Affiliates", False, f"Unexpected response structure: {data}")
        else:
            log_test("Get Affiliates", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Get Affiliates", False, f"Exception: {str(e)}")
    
    # Test 4: Update Affiliate
    print("\n--- Test 4: Update Affiliate ---")
    try:
        update_payload = {
            "name": "LensCrafters Premium Updated",
            "url": "https://lenscrafters.com/optical-wallet-updated",
            "commission": 20.0,
            "is_active": True
        }
        response = requests.put(f"{API_BASE}/affiliates/{affiliate_id}", json=update_payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("Update Affiliate", True, f"Updated affiliate {affiliate_id}")
            else:
                log_test("Update Affiliate", False, f"Unexpected response: {data}")
        else:
            log_test("Update Affiliate", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Update Affiliate", False, f"Exception: {str(e)}")
    
    # Test 5: Delete Affiliate
    print("\n--- Test 5: Delete Affiliate ---")
    try:
        response = requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("Delete Affiliate", True, f"Deleted affiliate {affiliate_id}")
                created_ids["affiliates"].remove(affiliate_id)
            else:
                log_test("Delete Affiliate", False, f"Unexpected response: {data}")
        else:
            log_test("Delete Affiliate", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Delete Affiliate", False, f"Exception: {str(e)}")
    
    return True

def test_banner_crud():
    """Test 6-9: Banner CRUD operations"""
    print("\n" + "="*80)
    print("TEST 6-9: Banner CRUD Operations")
    print("="*80)
    
    banner_id = None
    
    # Test 6: Create Banner
    print("\n--- Test 6: Create Banner ---")
    try:
        payload = {
            "image_url": "https://example.com/banner-spring-sale.jpg",
            "destination_url": "https://example.com/spring-sale",
            "title": "Spring Sale 2024",
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/banners", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "banner" in data:
                banner_id = data["banner"]["banner_id"]
                created_ids["banners"].append(banner_id)
                log_test("Create Banner", True, f"Created banner with ID: {banner_id}")
            else:
                log_test("Create Banner", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("Create Banner", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Create Banner", False, f"Exception: {str(e)}")
        return False
    
    # Test 7: Get Banners (List)
    print("\n--- Test 7: Get Banners ---")
    try:
        response = requests.get(f"{API_BASE}/banners", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "banners" in data and isinstance(data["banners"], list):
                found = any(b.get("banner_id") == banner_id for b in data["banners"])
                if found:
                    log_test("Get Banners", True, f"Found {len(data['banners'])} banners, including created one")
                else:
                    log_test("Get Banners", False, f"Created banner not found in list")
            else:
                log_test("Get Banners", False, f"Unexpected response structure: {data}")
        else:
            log_test("Get Banners", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Get Banners", False, f"Exception: {str(e)}")
    
    # Test 8: Update Banner
    print("\n--- Test 8: Update Banner ---")
    try:
        update_payload = {
            "image_url": "https://example.com/banner-summer-sale.jpg",
            "destination_url": "https://example.com/summer-sale",
            "title": "Summer Sale 2024",
            "is_active": True
        }
        response = requests.put(f"{API_BASE}/banners/{banner_id}", json=update_payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("Update Banner", True, f"Updated banner {banner_id}")
            else:
                log_test("Update Banner", False, f"Unexpected response: {data}")
        else:
            log_test("Update Banner", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Update Banner", False, f"Exception: {str(e)}")
    
    # Test 9: Delete Banner
    print("\n--- Test 9: Delete Banner ---")
    try:
        response = requests.delete(f"{API_BASE}/banners/{banner_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("Delete Banner", True, f"Deleted banner {banner_id}")
                created_ids["banners"].remove(banner_id)
            else:
                log_test("Delete Banner", False, f"Unexpected response: {data}")
        else:
            log_test("Delete Banner", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Delete Banner", False, f"Exception: {str(e)}")
    
    return True

def test_invoice_crud():
    """Test 10-13: Invoice CRUD operations"""
    print("\n" + "="*80)
    print("TEST 10-13: Invoice CRUD Operations")
    print("="*80)
    
    invoice_id = None
    
    # Test 10: Create Invoice
    print("\n--- Test 10: Create Invoice ---")
    try:
        payload = {
            "recipient_name": "Acme Optical Corp",
            "recipient_email": "billing@acmeoptical.com",
            "invoice_type": "advertiser",
            "total_amount": 750.00,
            "status": "pending",
            "line_items": [
                {
                    "description": "Banner Ad Placement - March 2024",
                    "quantity": 1,
                    "unit_price": 500.00,
                    "total": 500.00
                },
                {
                    "description": "Featured Listing",
                    "quantity": 1,
                    "unit_price": 250.00,
                    "total": 250.00
                }
            ]
        }
        response = requests.post(f"{API_BASE}/invoices", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "invoice" in data:
                invoice_id = data["invoice"]["invoice_id"]
                created_ids["invoices"].append(invoice_id)
                log_test("Create Invoice", True, f"Created invoice with ID: {invoice_id}")
            else:
                log_test("Create Invoice", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("Create Invoice", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Create Invoice", False, f"Exception: {str(e)}")
        return False
    
    # Test 11: Get Invoices (List)
    print("\n--- Test 11: Get Invoices ---")
    try:
        response = requests.get(f"{API_BASE}/invoices", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "invoices" in data and isinstance(data["invoices"], list):
                found = any(i.get("invoice_id") == invoice_id for i in data["invoices"])
                if found:
                    log_test("Get Invoices", True, f"Found {len(data['invoices'])} invoices, including created one")
                else:
                    log_test("Get Invoices", False, f"Created invoice not found in list")
            else:
                log_test("Get Invoices", False, f"Unexpected response structure: {data}")
        else:
            log_test("Get Invoices", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Get Invoices", False, f"Exception: {str(e)}")
    
    # Test 12: Update Invoice (change status to paid)
    print("\n--- Test 12: Update Invoice ---")
    try:
        update_payload = {
            "status": "paid"
        }
        response = requests.put(f"{API_BASE}/invoices/{invoice_id}", json=update_payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("Update Invoice", True, f"Updated invoice {invoice_id} to paid status")
            else:
                log_test("Update Invoice", False, f"Unexpected response: {data}")
        else:
            log_test("Update Invoice", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Update Invoice", False, f"Exception: {str(e)}")
    
    # Test 13: Delete Invoice
    print("\n--- Test 13: Delete Invoice ---")
    try:
        response = requests.delete(f"{API_BASE}/invoices/{invoice_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("Delete Invoice", True, f"Deleted invoice {invoice_id}")
                created_ids["invoices"].remove(invoice_id)
            else:
                log_test("Delete Invoice", False, f"Unexpected response: {data}")
        else:
            log_test("Delete Invoice", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Delete Invoice", False, f"Exception: {str(e)}")
    
    return True

def test_analytics():
    """Test 14-15: Analytics endpoints"""
    print("\n" + "="*80)
    print("TEST 14-15: Analytics Endpoints")
    print("="*80)
    
    # Test 14: Log Analytics Events
    print("\n--- Test 14: Log Analytics Events ---")
    try:
        # Log app_open event
        event1 = {
            "event_type": "app_open",
            "metadata": {"source": "test_suite", "platform": "ios"}
        }
        response1 = requests.post(f"{API_BASE}/analytics/event", json=event1, timeout=10)
        
        if response1.status_code == 200 and response1.json().get("status") == "logged":
            log_test("Log Analytics Event (app_open)", True, "Event logged successfully")
        else:
            log_test("Log Analytics Event (app_open)", False, f"Status: {response1.status_code}, Response: {response1.text}")
        
        # Log share_click event
        event2 = {
            "event_type": "share_click",
            "metadata": {"platform": "android"}
        }
        response2 = requests.post(f"{API_BASE}/analytics/event", json=event2, timeout=10)
        
        if response2.status_code == 200 and response2.json().get("status") == "logged":
            log_test("Log Analytics Event (share_click)", True, "Event logged successfully")
        else:
            log_test("Log Analytics Event (share_click)", False, f"Status: {response2.status_code}, Response: {response2.text}")
            
    except Exception as e:
        log_test("Log Analytics Events", False, f"Exception: {str(e)}")
    
    # Test 15: Get Analytics Dashboard
    print("\n--- Test 15: Get Analytics Dashboard ---")
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["events", "affiliate_stats", "banner_stats", "summary"]
            if all(key in data for key in required_keys):
                # Check if our logged events are reflected
                events = data.get("events", {})
                summary = data.get("summary", {})
                log_test("Get Analytics Dashboard", True, 
                        f"Dashboard data retrieved. Events: {events}, Summary: {summary}")
            else:
                log_test("Get Analytics Dashboard", False, f"Missing required keys. Data: {data}")
        else:
            log_test("Get Analytics Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Get Analytics Dashboard", False, f"Exception: {str(e)}")

def test_financial_dashboard():
    """Test 16: Financial dashboard endpoint"""
    print("\n" + "="*80)
    print("TEST 16: Financial Dashboard Endpoint")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/finance/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["commission", "invoices", "total_revenue"]
            if all(key in data for key in required_keys):
                commission = data.get("commission", {})
                invoices = data.get("invoices", {})
                log_test("Get Financial Dashboard", True, 
                        f"Commission: {commission}, Invoices: {invoices}, Revenue: {data.get('total_revenue')}")
            else:
                log_test("Get Financial Dashboard", False, f"Missing required keys. Data: {data}")
        else:
            log_test("Get Financial Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Get Financial Dashboard", False, f"Exception: {str(e)}")

def test_affiliate_redirect():
    """Test 17: Affiliate redirect with click tracking"""
    print("\n" + "="*80)
    print("TEST 17: Affiliate Redirect with Click Tracking")
    print("="*80)
    
    # First create an affiliate for testing
    print("\n--- Creating test affiliate for redirect ---")
    affiliate_id = None
    try:
        payload = {
            "name": "Vision Direct",
            "url": "https://visiondirect.com/optical-wallet",
            "commission": 12.0,
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/affiliates", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            affiliate_id = data["affiliate"]["affiliate_id"]
            created_ids["affiliates"].append(affiliate_id)
            print(f"   Created test affiliate with ID: {affiliate_id}")
        else:
            log_test("Affiliate Redirect - Setup", False, f"Failed to create test affiliate: {response.text}")
            return False
    except Exception as e:
        log_test("Affiliate Redirect - Setup", False, f"Exception creating affiliate: {str(e)}")
        return False
    
    # Test redirect endpoint
    print("\n--- Testing redirect endpoint ---")
    try:
        response = requests.get(f"{API_BASE}/redirect/{affiliate_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "redirect_url" in data and data["redirect_url"] == "https://visiondirect.com/optical-wallet":
                log_test("Affiliate Redirect", True, f"Redirect URL returned: {data['redirect_url']}")
                
                # Verify click count was incremented
                affiliates_response = requests.get(f"{API_BASE}/affiliates", timeout=10)
                if affiliates_response.status_code == 200:
                    affiliates = affiliates_response.json().get("affiliates", [])
                    test_affiliate = next((a for a in affiliates if a.get("affiliate_id") == affiliate_id), None)
                    if test_affiliate and test_affiliate.get("click_count", 0) > 0:
                        log_test("Affiliate Click Tracking", True, f"Click count incremented to {test_affiliate['click_count']}")
                    else:
                        log_test("Affiliate Click Tracking", False, "Click count not incremented")
            else:
                log_test("Affiliate Redirect", False, f"Unexpected response: {data}")
        else:
            log_test("Affiliate Redirect", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("Affiliate Redirect", False, f"Exception: {str(e)}")
    
    # Cleanup: delete test affiliate
    try:
        requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", timeout=10)
        created_ids["affiliates"].remove(affiliate_id)
    except:
        pass

def cleanup():
    """Clean up any remaining test data"""
    print("\n" + "="*80)
    print("CLEANUP: Removing any remaining test data")
    print("="*80)
    
    for affiliate_id in created_ids["affiliates"][:]:
        try:
            requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", timeout=10)
            print(f"   Deleted affiliate: {affiliate_id}")
        except:
            pass
    
    for banner_id in created_ids["banners"][:]:
        try:
            requests.delete(f"{API_BASE}/banners/{banner_id}", timeout=10)
            print(f"   Deleted banner: {banner_id}")
        except:
            pass
    
    for invoice_id in created_ids["invoices"][:]:
        try:
            requests.delete(f"{API_BASE}/invoices/{invoice_id}", timeout=10)
            print(f"   Deleted invoice: {invoice_id}")
        except:
            pass

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {len(test_results['passed'])} ✅")
    print(f"Failed: {len(test_results['failed'])} ❌")
    
    if test_results['failed']:
        print("\nFailed Tests:")
        for test in test_results['failed']:
            print(f"  ❌ {test}")
    
    print("\n" + "="*80)
    
    if test_results['failed']:
        return 1
    return 0

def main():
    """Run all tests"""
    print("="*80)
    print("MY OPTICAL WALLET - BACKEND API TEST SUITE")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*80)
    
    try:
        # Run all tests in order
        test_health_check()
        test_affiliate_crud()
        test_banner_crud()
        test_invoice_crud()
        test_analytics()
        test_financial_dashboard()
        test_affiliate_redirect()
        
        # Cleanup
        cleanup()
        
        # Print summary
        exit_code = print_summary()
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n\nTest suite interrupted by user")
        cleanup()
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()
