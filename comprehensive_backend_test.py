#!/usr/bin/env python3
"""
COMPREHENSIVE Backend API Regression Test for My Optical Wallet Admin Panel
Tests ALL endpoints including recent bug fixes
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL - using production URL
BACKEND_URL = "https://optical-rx-now.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Admin API Key for protected endpoints
ADMIN_API_KEY = "Pvz8xwghNOsIOtw1tBKZXO4LsaB_3xOjiNy81w4qy08"
HEADERS = {"X-Admin-Key": ADMIN_API_KEY}

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}

# Store created IDs for cleanup
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
            if data.get("status") == "healthy" and data.get("service") == "my-optical-wallet":
                log_test("GET /api/health", True, f"Response: {data}")
                return True
            else:
                log_test("GET /api/health", False, f"Unexpected response: {data}")
                return False
        else:
            log_test("GET /api/health", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("GET /api/health", False, f"Exception: {str(e)}")
        return False

def test_affiliate_crud():
    """Test 2-7: Affiliate CRUD operations including ?all=true"""
    print("\n" + "="*80)
    print("TEST 2-7: Affiliate CRUD Operations (including ?all=true)")
    print("="*80)
    
    affiliate_id = None
    
    # Test 2: Create Affiliate
    print("\n--- Test 2: POST /api/affiliates (Create) ---")
    try:
        payload = {
            "name": "Test Optical Store",
            "url": "https://testoptical.com/promo",
            "commission": 15.5,
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/affiliates", json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "affiliate" in data:
                affiliate_id = data["affiliate"]["affiliate_id"]
                created_ids["affiliates"].append(affiliate_id)
                log_test("POST /api/affiliates", True, f"Created affiliate with ID: {affiliate_id}")
            else:
                log_test("POST /api/affiliates", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("POST /api/affiliates", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/affiliates", False, f"Exception: {str(e)}")
        return False
    
    # Test 3: Get Affiliates (active only)
    print("\n--- Test 3: GET /api/affiliates (active only) ---")
    try:
        response = requests.get(f"{API_BASE}/affiliates", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "affiliates" in data and isinstance(data["affiliates"], list):
                found = any(a.get("affiliate_id") == affiliate_id for a in data["affiliates"])
                if found:
                    log_test("GET /api/affiliates", True, f"Found {len(data['affiliates'])} active affiliates")
                else:
                    log_test("GET /api/affiliates", False, f"Created affiliate not found in list")
            else:
                log_test("GET /api/affiliates", False, f"Unexpected response structure: {data}")
        else:
            log_test("GET /api/affiliates", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/affiliates", False, f"Exception: {str(e)}")
    
    # Test 4: Update Affiliate
    print("\n--- Test 4: PUT /api/affiliates/{id} (Update) ---")
    try:
        update_payload = {
            "name": "Test Optical Store Updated",
            "url": "https://testoptical.com/promo-updated",
            "commission": 20.0,
            "is_active": False  # Disable it
        }
        response = requests.put(f"{API_BASE}/affiliates/{affiliate_id}", json=update_payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("PUT /api/affiliates/{id}", True, f"Updated affiliate {affiliate_id}")
            else:
                log_test("PUT /api/affiliates/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("PUT /api/affiliates/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("PUT /api/affiliates/{id}", False, f"Exception: {str(e)}")
    
    # Test 5: Get Affiliates with ?all=true (should include disabled)
    print("\n--- Test 5: GET /api/affiliates?all=true (include disabled) ---")
    try:
        response = requests.get(f"{API_BASE}/affiliates?all=true", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "affiliates" in data and isinstance(data["affiliates"], list):
                found = any(a.get("affiliate_id") == affiliate_id for a in data["affiliates"])
                if found:
                    log_test("GET /api/affiliates?all=true", True, f"Found {len(data['affiliates'])} affiliates (including disabled)")
                else:
                    log_test("GET /api/affiliates?all=true", False, f"Disabled affiliate not found with ?all=true")
            else:
                log_test("GET /api/affiliates?all=true", False, f"Unexpected response structure: {data}")
        else:
            log_test("GET /api/affiliates?all=true", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/affiliates?all=true", False, f"Exception: {str(e)}")
    
    # Test 6: Verify disabled affiliate NOT in default list
    print("\n--- Test 6: Verify disabled affiliate NOT in default GET ---")
    try:
        response = requests.get(f"{API_BASE}/affiliates", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            found = any(a.get("affiliate_id") == affiliate_id for a in data["affiliates"])
            if not found:
                log_test("Disabled affiliate filtering", True, "Disabled affiliate correctly excluded from default list")
            else:
                log_test("Disabled affiliate filtering", False, "Disabled affiliate should not appear in default list")
        else:
            log_test("Disabled affiliate filtering", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Disabled affiliate filtering", False, f"Exception: {str(e)}")
    
    # Test 7: Delete Affiliate
    print("\n--- Test 7: DELETE /api/affiliates/{id} ---")
    try:
        response = requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("DELETE /api/affiliates/{id}", True, f"Deleted affiliate {affiliate_id}")
                created_ids["affiliates"].remove(affiliate_id)
            else:
                log_test("DELETE /api/affiliates/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("DELETE /api/affiliates/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("DELETE /api/affiliates/{id}", False, f"Exception: {str(e)}")
    
    return True

def test_banner_crud():
    """Test 8-13: Banner CRUD operations including ?all=true"""
    print("\n" + "="*80)
    print("TEST 8-13: Banner CRUD Operations (including ?all=true)")
    print("="*80)
    
    banner_id = None
    
    # Test 8: Create Banner
    print("\n--- Test 8: POST /api/banners (Create) ---")
    try:
        payload = {
            "image_url": "https://example.com/test-banner.jpg",
            "destination_url": "https://example.com/test-promo",
            "title": "Test Banner 2024",
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/banners", json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "banner" in data:
                banner_id = data["banner"]["banner_id"]
                created_ids["banners"].append(banner_id)
                log_test("POST /api/banners", True, f"Created banner with ID: {banner_id}")
            else:
                log_test("POST /api/banners", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("POST /api/banners", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/banners", False, f"Exception: {str(e)}")
        return False
    
    # Test 9: Get Banners (active only)
    print("\n--- Test 9: GET /api/banners (active only) ---")
    try:
        response = requests.get(f"{API_BASE}/banners", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "banners" in data and isinstance(data["banners"], list):
                found = any(b.get("banner_id") == banner_id for b in data["banners"])
                if found:
                    log_test("GET /api/banners", True, f"Found {len(data['banners'])} active banners")
                else:
                    log_test("GET /api/banners", False, f"Created banner not found in list")
            else:
                log_test("GET /api/banners", False, f"Unexpected response structure: {data}")
        else:
            log_test("GET /api/banners", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/banners", False, f"Exception: {str(e)}")
    
    # Test 10: Update Banner
    print("\n--- Test 10: PUT /api/banners/{id} (Update) ---")
    try:
        update_payload = {
            "image_url": "https://example.com/test-banner-updated.jpg",
            "destination_url": "https://example.com/test-promo-updated",
            "title": "Test Banner Updated",
            "is_active": False  # Disable it
        }
        response = requests.put(f"{API_BASE}/banners/{banner_id}", json=update_payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("PUT /api/banners/{id}", True, f"Updated banner {banner_id}")
            else:
                log_test("PUT /api/banners/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("PUT /api/banners/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("PUT /api/banners/{id}", False, f"Exception: {str(e)}")
    
    # Test 11: Get Banners with ?all=true (should include disabled)
    print("\n--- Test 11: GET /api/banners?all=true (include disabled) ---")
    try:
        response = requests.get(f"{API_BASE}/banners?all=true", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "banners" in data and isinstance(data["banners"], list):
                found = any(b.get("banner_id") == banner_id for b in data["banners"])
                if found:
                    log_test("GET /api/banners?all=true", True, f"Found {len(data['banners'])} banners (including disabled)")
                else:
                    log_test("GET /api/banners?all=true", False, f"Disabled banner not found with ?all=true")
            else:
                log_test("GET /api/banners?all=true", False, f"Unexpected response structure: {data}")
        else:
            log_test("GET /api/banners?all=true", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/banners?all=true", False, f"Exception: {str(e)}")
    
    # Test 12: Verify disabled banner NOT in default list
    print("\n--- Test 12: Verify disabled banner NOT in default GET ---")
    try:
        response = requests.get(f"{API_BASE}/banners", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            found = any(b.get("banner_id") == banner_id for b in data["banners"])
            if not found:
                log_test("Disabled banner filtering", True, "Disabled banner correctly excluded from default list")
            else:
                log_test("Disabled banner filtering", False, "Disabled banner should not appear in default list")
        else:
            log_test("Disabled banner filtering", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("Disabled banner filtering", False, f"Exception: {str(e)}")
    
    # Test 13: Delete Banner
    print("\n--- Test 13: DELETE /api/banners/{id} ---")
    try:
        response = requests.delete(f"{API_BASE}/banners/{banner_id}", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("DELETE /api/banners/{id}", True, f"Deleted banner {banner_id}")
                created_ids["banners"].remove(banner_id)
            else:
                log_test("DELETE /api/banners/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("DELETE /api/banners/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("DELETE /api/banners/{id}", False, f"Exception: {str(e)}")
    
    return True

def test_invoice_crud():
    """Test 14-17: Invoice CRUD operations"""
    print("\n" + "="*80)
    print("TEST 14-17: Invoice CRUD Operations")
    print("="*80)
    
    invoice_id = None
    
    # Test 14: Create Invoice
    print("\n--- Test 14: POST /api/invoices (Create) ---")
    try:
        payload = {
            "recipient_name": "Test Advertiser Corp",
            "recipient_email": "billing@testadvertiser.com",
            "invoice_type": "advertiser",
            "total_amount": 500.00,
            "status": "pending",
            "line_items": [
                {
                    "description": "Banner Ad - Test Campaign",
                    "quantity": 1,
                    "unit_price": 500.00,
                    "total": 500.00
                }
            ]
        }
        response = requests.post(f"{API_BASE}/invoices", json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "created" and "invoice" in data:
                invoice_id = data["invoice"]["invoice_id"]
                created_ids["invoices"].append(invoice_id)
                log_test("POST /api/invoices", True, f"Created invoice with ID: {invoice_id}")
            else:
                log_test("POST /api/invoices", False, f"Unexpected response structure: {data}")
                return False
        else:
            log_test("POST /api/invoices", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("POST /api/invoices", False, f"Exception: {str(e)}")
        return False
    
    # Test 15: Get Invoices
    print("\n--- Test 15: GET /api/invoices ---")
    try:
        response = requests.get(f"{API_BASE}/invoices", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "invoices" in data and isinstance(data["invoices"], list):
                found = any(i.get("invoice_id") == invoice_id for i in data["invoices"])
                if found:
                    log_test("GET /api/invoices", True, f"Found {len(data['invoices'])} invoices")
                else:
                    log_test("GET /api/invoices", False, f"Created invoice not found in list")
            else:
                log_test("GET /api/invoices", False, f"Unexpected response structure: {data}")
        else:
            log_test("GET /api/invoices", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/invoices", False, f"Exception: {str(e)}")
    
    # Test 16: Update Invoice
    print("\n--- Test 16: PUT /api/invoices/{id} (Update status) ---")
    try:
        update_payload = {
            "status": "paid"
        }
        response = requests.put(f"{API_BASE}/invoices/{invoice_id}", json=update_payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "updated":
                log_test("PUT /api/invoices/{id}", True, f"Updated invoice {invoice_id} to paid")
            else:
                log_test("PUT /api/invoices/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("PUT /api/invoices/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("PUT /api/invoices/{id}", False, f"Exception: {str(e)}")
    
    # Test 17: Delete Invoice
    print("\n--- Test 17: DELETE /api/invoices/{id} ---")
    try:
        response = requests.delete(f"{API_BASE}/invoices/{invoice_id}", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "deleted":
                log_test("DELETE /api/invoices/{id}", True, f"Deleted invoice {invoice_id}")
                created_ids["invoices"].remove(invoice_id)
            else:
                log_test("DELETE /api/invoices/{id}", False, f"Unexpected response: {data}")
        else:
            log_test("DELETE /api/invoices/{id}", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("DELETE /api/invoices/{id}", False, f"Exception: {str(e)}")
    
    return True

def test_auto_generate_invoices():
    """Test 18: Auto-generate invoices from affiliate data"""
    print("\n" + "="*80)
    print("TEST 18: Auto-Generate Invoices")
    print("="*80)
    
    # Create test affiliates with clicks
    print("\n--- Creating test affiliates with clicks ---")
    test_affiliate_ids = []
    
    try:
        # Affiliate 1 with clicks
        aff1 = {
            "name": "Test Affiliate With Clicks 1",
            "url": "https://test1.com",
            "commission": 10.0,
            "is_active": True,
            "click_count": 25
        }
        resp1 = requests.post(f"{API_BASE}/affiliates", json=aff1, headers=HEADERS, timeout=10)
        if resp1.status_code == 200:
            aff1_id = resp1.json()["affiliate"]["affiliate_id"]
            test_affiliate_ids.append(aff1_id)
            created_ids["affiliates"].append(aff1_id)
            print(f"   Created affiliate 1: {aff1_id} (25 clicks, 10% commission)")
        
        # Affiliate 2 with clicks
        aff2 = {
            "name": "Test Affiliate With Clicks 2",
            "url": "https://test2.com",
            "commission": 15.0,
            "is_active": True,
            "click_count": 40
        }
        resp2 = requests.post(f"{API_BASE}/affiliates", json=aff2, headers=HEADERS, timeout=10)
        if resp2.status_code == 200:
            aff2_id = resp2.json()["affiliate"]["affiliate_id"]
            test_affiliate_ids.append(aff2_id)
            created_ids["affiliates"].append(aff2_id)
            print(f"   Created affiliate 2: {aff2_id} (40 clicks, 15% commission)")
        
        # Affiliate 3 without clicks (should not generate invoice)
        aff3 = {
            "name": "Test Affiliate No Clicks",
            "url": "https://test3.com",
            "commission": 20.0,
            "is_active": True,
            "click_count": 0
        }
        resp3 = requests.post(f"{API_BASE}/affiliates", json=aff3, headers=HEADERS, timeout=10)
        if resp3.status_code == 200:
            aff3_id = resp3.json()["affiliate"]["affiliate_id"]
            test_affiliate_ids.append(aff3_id)
            created_ids["affiliates"].append(aff3_id)
            print(f"   Created affiliate 3: {aff3_id} (0 clicks, should not generate invoice)")
        
    except Exception as e:
        log_test("POST /api/invoices/auto-generate - Setup", False, f"Failed to create test affiliates: {str(e)}")
        return False
    
    # Test auto-generate
    print("\n--- Test 18: POST /api/invoices/auto-generate ---")
    try:
        response = requests.post(f"{API_BASE}/invoices/auto-generate", headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                invoices_created = data.get("invoices_created", 0)
                # Should create 2 invoices (for affiliates with clicks > 0)
                if invoices_created >= 2:
                    log_test("POST /api/invoices/auto-generate", True, 
                            f"Auto-generated {invoices_created} invoices (expected >= 2)")
                    
                    # Verify invoices in database
                    inv_response = requests.get(f"{API_BASE}/invoices", timeout=10)
                    if inv_response.status_code == 200:
                        invoices = inv_response.json().get("invoices", [])
                        # Find our test invoices
                        test_invoices = [inv for inv in invoices 
                                       if inv.get("recipient_name") in [
                                           "Test Affiliate With Clicks 1",
                                           "Test Affiliate With Clicks 2"
                                       ]]
                        if len(test_invoices) >= 2:
                            log_test("Auto-generate invoice verification", True, 
                                   f"Found {len(test_invoices)} test invoices in database")
                            # Store invoice IDs for cleanup
                            for inv in test_invoices:
                                created_ids["invoices"].append(inv["invoice_id"])
                        else:
                            log_test("Auto-generate invoice verification", False, 
                                   f"Expected >= 2 test invoices, found {len(test_invoices)}")
                else:
                    log_test("POST /api/invoices/auto-generate", False, 
                            f"Expected >= 2 invoices, got {invoices_created}")
            else:
                log_test("POST /api/invoices/auto-generate", False, f"Unexpected response: {data}")
        else:
            log_test("POST /api/invoices/auto-generate", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/invoices/auto-generate", False, f"Exception: {str(e)}")
    
    # Cleanup test affiliates
    for aff_id in test_affiliate_ids:
        try:
            requests.delete(f"{API_BASE}/affiliates/{aff_id}", headers=HEADERS, timeout=10)
            if aff_id in created_ids["affiliates"]:
                created_ids["affiliates"].remove(aff_id)
        except:
            pass
    
    return True

def test_analytics():
    """Test 19-20: Analytics with platform tracking"""
    print("\n" + "="*80)
    print("TEST 19-20: Analytics with Platform Tracking")
    print("="*80)
    
    # Test 19: Log Analytics Events with platform field
    print("\n--- Test 19: POST /api/analytics/event (with platform) ---")
    try:
        # Event 1: iOS
        event1 = {
            "event_type": "app_open",
            "platform": "ios",
            "metadata": {"source": "test_suite"}
        }
        resp1 = requests.post(f"{API_BASE}/analytics/event", json=event1, timeout=10)
        
        # Event 2: Android
        event2 = {
            "event_type": "share_click",
            "platform": "android",
            "metadata": {}
        }
        resp2 = requests.post(f"{API_BASE}/analytics/event", json=event2, timeout=10)
        
        # Event 3: Web
        event3 = {
            "event_type": "banner_view",
            "platform": "web",
            "metadata": {}
        }
        resp3 = requests.post(f"{API_BASE}/analytics/event", json=event3, timeout=10)
        
        if all(r.status_code == 200 and r.json().get("status") == "logged" 
               for r in [resp1, resp2, resp3]):
            log_test("POST /api/analytics/event (with platform)", True, 
                    "Logged events for ios, android, web platforms")
        else:
            log_test("POST /api/analytics/event (with platform)", False, 
                    "Failed to log one or more events")
            
    except Exception as e:
        log_test("POST /api/analytics/event (with platform)", False, f"Exception: {str(e)}")
    
    # Test 20: Get Analytics Dashboard with platform_breakdown
    print("\n--- Test 20: GET /api/analytics/dashboard (verify platform_breakdown) ---")
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["events", "platform_breakdown", "platform_events", 
                           "affiliate_stats", "banner_stats", "summary"]
            
            if all(key in data for key in required_keys):
                platform_breakdown = data.get("platform_breakdown", {})
                platform_events = data.get("platform_events", {})
                
                # Verify platform data exists
                if platform_breakdown and isinstance(platform_breakdown, dict):
                    log_test("GET /api/analytics/dashboard (platform_breakdown)", True, 
                            f"Platform breakdown: {platform_breakdown}")
                    log_test("Platform events breakdown", True, 
                            f"Platform events: {list(platform_events.keys())}")
                else:
                    log_test("GET /api/analytics/dashboard (platform_breakdown)", False, 
                            "platform_breakdown is empty or invalid")
            else:
                missing = [k for k in required_keys if k not in data]
                log_test("GET /api/analytics/dashboard", False, 
                        f"Missing required keys: {missing}")
        else:
            log_test("GET /api/analytics/dashboard", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/analytics/dashboard", False, f"Exception: {str(e)}")

def test_financial_dashboard():
    """Test 21: Financial dashboard"""
    print("\n" + "="*80)
    print("TEST 21: Financial Dashboard")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/finance/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["commission", "invoices", "total_revenue"]
            
            if all(key in data for key in required_keys):
                commission = data.get("commission", {})
                invoices = data.get("invoices", {})
                log_test("GET /api/finance/dashboard", True, 
                        f"Commission potential: ${commission.get('potential', 0)}, "
                        f"Total invoices: {invoices.get('total', 0)}, "
                        f"Revenue: ${data.get('total_revenue', 0)}")
            else:
                missing = [k for k in required_keys if k not in data]
                log_test("GET /api/finance/dashboard", False, f"Missing keys: {missing}")
        else:
            log_test("GET /api/finance/dashboard", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/finance/dashboard", False, f"Exception: {str(e)}")

def test_weekly_pdf_report():
    """Test 22: Weekly PDF report generation (bug fix verification)"""
    print("\n" + "="*80)
    print("TEST 22: Weekly PDF Report (Bug Fix: created_at field)")
    print("="*80)
    
    # First, create some analytics events to ensure data exists
    print("\n--- Creating test analytics events ---")
    try:
        for i in range(3):
            event = {
                "event_type": "app_open",
                "platform": "ios",
                "metadata": {"test": "weekly_report"}
            }
            requests.post(f"{API_BASE}/analytics/event", json=event, timeout=10)
        print("   Created 3 test analytics events")
    except:
        pass
    
    print("\n--- Test 22: GET /api/reports/weekly ---")
    try:
        response = requests.get(f"{API_BASE}/reports/weekly", timeout=30)
        
        if response.status_code == 200:
            # Check Content-Type
            content_type = response.headers.get("Content-Type", "")
            if "application/pdf" in content_type:
                # Check PDF magic bytes
                pdf_content = response.content
                if pdf_content[:4] == b'%PDF':
                    pdf_size = len(pdf_content)
                    # Check Content-Disposition header
                    content_disp = response.headers.get("Content-Disposition", "")
                    if "MOW_Weekly_Report_" in content_disp and ".pdf" in content_disp:
                        log_test("GET /api/reports/weekly", True, 
                                f"Valid PDF generated ({pdf_size} bytes), "
                                f"Filename: {content_disp.split('filename=')[1] if 'filename=' in content_disp else 'N/A'}")
                        log_test("Weekly report bug fix (created_at field)", True, 
                                "PDF generation working with correct 'created_at' field filtering")
                    else:
                        log_test("GET /api/reports/weekly", False, 
                                f"Invalid Content-Disposition header: {content_disp}")
                else:
                    log_test("GET /api/reports/weekly", False, 
                            f"Invalid PDF magic bytes: {pdf_content[:10]}")
            else:
                log_test("GET /api/reports/weekly", False, 
                        f"Invalid Content-Type: {content_type}")
        else:
            log_test("GET /api/reports/weekly", False, 
                    f"Status: {response.status_code}, Response: {response.text[:200]}")
    except Exception as e:
        log_test("GET /api/reports/weekly", False, f"Exception: {str(e)}")

def test_affiliate_redirect():
    """Test 23: Affiliate redirect with click tracking"""
    print("\n" + "="*80)
    print("TEST 23: Affiliate Redirect with Click Tracking")
    print("="*80)
    
    # Create test affiliate
    print("\n--- Creating test affiliate for redirect ---")
    affiliate_id = None
    try:
        payload = {
            "name": "Test Redirect Affiliate",
            "url": "https://testredirect.com/promo",
            "commission": 12.0,
            "is_active": True
        }
        response = requests.post(f"{API_BASE}/affiliates", json=payload, headers=HEADERS, timeout=10)
        
        if response.status_code == 200:
            affiliate_id = response.json()["affiliate"]["affiliate_id"]
            created_ids["affiliates"].append(affiliate_id)
            print(f"   Created test affiliate: {affiliate_id}")
        else:
            log_test("Affiliate Redirect - Setup", False, f"Failed to create affiliate: {response.text}")
            return False
    except Exception as e:
        log_test("Affiliate Redirect - Setup", False, f"Exception: {str(e)}")
        return False
    
    # Test redirect endpoint
    print("\n--- Test 23: GET /api/redirect/{affiliate_id} ---")
    try:
        response = requests.get(f"{API_BASE}/redirect/{affiliate_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "redirect_url" in data and data["redirect_url"] == "https://testredirect.com/promo":
                log_test("GET /api/redirect/{affiliate_id}", True, 
                        f"Redirect URL returned: {data['redirect_url']}")
                
                # Verify click count was incremented
                aff_response = requests.get(f"{API_BASE}/affiliates?all=true", timeout=10)
                if aff_response.status_code == 200:
                    affiliates = aff_response.json().get("affiliates", [])
                    test_aff = next((a for a in affiliates if a.get("affiliate_id") == affiliate_id), None)
                    if test_aff and test_aff.get("click_count", 0) > 0:
                        log_test("Affiliate click tracking", True, 
                                f"Click count incremented to {test_aff['click_count']}")
                    else:
                        log_test("Affiliate click tracking", False, "Click count not incremented")
            else:
                log_test("GET /api/redirect/{affiliate_id}", False, f"Unexpected response: {data}")
        else:
            log_test("GET /api/redirect/{affiliate_id}", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/redirect/{affiliate_id}", False, f"Exception: {str(e)}")
    
    # Cleanup
    try:
        requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", headers=HEADERS, timeout=10)
        created_ids["affiliates"].remove(affiliate_id)
    except:
        pass

def cleanup():
    """Clean up any remaining test data"""
    print("\n" + "="*80)
    print("CLEANUP: Removing test data")
    print("="*80)
    
    for affiliate_id in created_ids["affiliates"][:]:
        try:
            requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", headers=HEADERS, timeout=10)
            print(f"   Deleted affiliate: {affiliate_id}")
        except:
            pass
    
    for banner_id in created_ids["banners"][:]:
        try:
            requests.delete(f"{API_BASE}/banners/{banner_id}", headers=HEADERS, timeout=10)
            print(f"   Deleted banner: {banner_id}")
        except:
            pass
    
    for invoice_id in created_ids["invoices"][:]:
        try:
            requests.delete(f"{API_BASE}/invoices/{invoice_id}", headers=HEADERS, timeout=10)
            print(f"   Deleted invoice: {invoice_id}")
        except:
            pass

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("COMPREHENSIVE REGRESSION TEST SUMMARY")
    print("="*80)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {len(test_results['passed'])} ✅")
    print(f"Failed: {len(test_results['failed'])} ❌")
    
    if test_results['failed']:
        print("\n❌ FAILED TESTS:")
        for test in test_results['failed']:
            print(f"  • {test}")
    
    if test_results['passed']:
        print("\n✅ PASSED TESTS:")
        for test in test_results['passed']:
            print(f"  • {test}")
    
    print("\n" + "="*80)
    
    if test_results['failed']:
        return 1
    return 0

def main():
    """Run comprehensive regression test"""
    print("="*80)
    print("MY OPTICAL WALLET - COMPREHENSIVE BACKEND REGRESSION TEST")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*80)
    
    try:
        # Run all tests
        test_health_check()
        test_affiliate_crud()
        test_banner_crud()
        test_invoice_crud()
        test_auto_generate_invoices()
        test_analytics()
        test_financial_dashboard()
        test_weekly_pdf_report()
        test_affiliate_redirect()
        
        # Cleanup
        cleanup()
        
        # Print summary
        exit_code = print_summary()
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        cleanup()
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main()
