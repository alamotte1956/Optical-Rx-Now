#!/usr/bin/env python3
"""
Backend API Testing for My Optical Wallet - NEW ENDPOINTS
Tests the 2 new endpoints (weekly PDF report and auto-generate invoices)
Plus verifies existing endpoints still work (health, analytics, finance)
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://optical-rx-now.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}

# Store created IDs for cleanup
created_ids = {
    "affiliates": [],
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
    """Test 1: Health check endpoint (existing)"""
    print("\n" + "="*80)
    print("TEST 1: Health Check Endpoint (EXISTING)")
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

def test_analytics_dashboard():
    """Test 2: Analytics dashboard endpoint (existing)"""
    print("\n" + "="*80)
    print("TEST 2: Analytics Dashboard Endpoint (EXISTING)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/analytics/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["events", "affiliate_stats", "banner_stats", "summary"]
            if all(key in data for key in required_keys):
                events = data.get("events", {})
                summary = data.get("summary", {})
                log_test("Analytics Dashboard", True, 
                        f"Dashboard data retrieved. Events: {events}, Summary: {summary}")
                return True
            else:
                log_test("Analytics Dashboard", False, f"Missing required keys. Data: {data}")
                return False
        else:
            log_test("Analytics Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Analytics Dashboard", False, f"Exception: {str(e)}")
        return False

def test_financial_dashboard():
    """Test 3: Financial dashboard endpoint (existing)"""
    print("\n" + "="*80)
    print("TEST 3: Financial Dashboard Endpoint (EXISTING)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/finance/dashboard", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_keys = ["commission", "invoices", "total_revenue"]
            if all(key in data for key in required_keys):
                commission = data.get("commission", {})
                invoices = data.get("invoices", {})
                log_test("Financial Dashboard", True, 
                        f"Commission: {commission}, Invoices: {invoices}, Revenue: {data.get('total_revenue')}")
                return True
            else:
                log_test("Financial Dashboard", False, f"Missing required keys. Data: {data}")
                return False
        else:
            log_test("Financial Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Financial Dashboard", False, f"Exception: {str(e)}")
        return False

def test_weekly_pdf_report():
    """Test 4: Weekly PDF report endpoint (NEW)"""
    print("\n" + "="*80)
    print("TEST 4: Weekly PDF Report Endpoint (NEW)")
    print("="*80)
    
    try:
        response = requests.get(f"{API_BASE}/reports/weekly", timeout=30)
        
        if response.status_code == 200:
            # Check Content-Type header
            content_type = response.headers.get("Content-Type", "")
            if "application/pdf" not in content_type:
                log_test("Weekly PDF Report - Content-Type", False, 
                        f"Expected 'application/pdf', got '{content_type}'")
                return False
            else:
                log_test("Weekly PDF Report - Content-Type", True, 
                        f"Correct Content-Type: {content_type}")
            
            # Check if response starts with PDF magic bytes
            content = response.content
            if content[:4] == b'%PDF':
                log_test("Weekly PDF Report - PDF Format", True, 
                        f"Response is valid PDF (size: {len(content)} bytes)")
                
                # Check Content-Disposition header
                content_disposition = response.headers.get("Content-Disposition", "")
                if "attachment" in content_disposition and "MOW_Weekly_Report" in content_disposition:
                    log_test("Weekly PDF Report - Filename", True, 
                            f"Correct filename in header: {content_disposition}")
                else:
                    log_test("Weekly PDF Report - Filename", False, 
                            f"Missing or incorrect Content-Disposition: {content_disposition}")
                
                return True
            else:
                log_test("Weekly PDF Report - PDF Format", False, 
                        f"Response does not start with %PDF. First 10 bytes: {content[:10]}")
                return False
        else:
            log_test("Weekly PDF Report", False, 
                    f"Status: {response.status_code}, Response: {response.text[:200]}")
            return False
    except Exception as e:
        log_test("Weekly PDF Report", False, f"Exception: {str(e)}")
        return False

def test_auto_generate_invoices():
    """Test 5: Auto-generate invoices endpoint (NEW)"""
    print("\n" + "="*80)
    print("TEST 5: Auto-Generate Invoices Endpoint (NEW)")
    print("="*80)
    
    # First, create some test affiliates with click counts
    print("\n--- Setting up test affiliates with click data ---")
    affiliate_ids = []
    
    try:
        # Create affiliate 1 with clicks
        payload1 = {
            "name": "Warby Parker",
            "url": "https://warbyparker.com/optical-wallet",
            "commission": 10.0,
            "is_active": True,
            "click_count": 50
        }
        response1 = requests.post(f"{API_BASE}/affiliates", json=payload1, timeout=10)
        if response1.status_code == 200:
            aff1_id = response1.json()["affiliate"]["affiliate_id"]
            affiliate_ids.append(aff1_id)
            created_ids["affiliates"].append(aff1_id)
            print(f"   Created affiliate 1: {aff1_id} with 50 clicks")
        
        # Create affiliate 2 with clicks
        payload2 = {
            "name": "Zenni Optical",
            "url": "https://zennioptical.com/optical-wallet",
            "commission": 15.0,
            "is_active": True,
            "click_count": 30
        }
        response2 = requests.post(f"{API_BASE}/affiliates", json=payload2, timeout=10)
        if response2.status_code == 200:
            aff2_id = response2.json()["affiliate"]["affiliate_id"]
            affiliate_ids.append(aff2_id)
            created_ids["affiliates"].append(aff2_id)
            print(f"   Created affiliate 2: {aff2_id} with 30 clicks")
        
        # Create affiliate 3 with NO clicks (should not generate invoice)
        payload3 = {
            "name": "EyeBuyDirect",
            "url": "https://eyebuydirect.com/optical-wallet",
            "commission": 12.0,
            "is_active": True,
            "click_count": 0
        }
        response3 = requests.post(f"{API_BASE}/affiliates", json=payload3, timeout=10)
        if response3.status_code == 200:
            aff3_id = response3.json()["affiliate"]["affiliate_id"]
            affiliate_ids.append(aff3_id)
            created_ids["affiliates"].append(aff3_id)
            print(f"   Created affiliate 3: {aff3_id} with 0 clicks (should not generate invoice)")
        
    except Exception as e:
        log_test("Auto-Generate Invoices - Setup", False, f"Failed to create test affiliates: {str(e)}")
        return False
    
    # Now test the auto-generate endpoint
    print("\n--- Testing auto-generate invoices endpoint ---")
    try:
        response = requests.post(f"{API_BASE}/invoices/auto-generate", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check response structure
            if "status" not in data or "invoices_created" not in data:
                log_test("Auto-Generate Invoices - Response Structure", False, 
                        f"Missing required fields. Response: {data}")
                return False
            
            status = data.get("status")
            invoices_created = data.get("invoices_created")
            
            # Check status
            if status != "success":
                log_test("Auto-Generate Invoices - Status", False, 
                        f"Expected status='success', got '{status}'")
                return False
            else:
                log_test("Auto-Generate Invoices - Status", True, 
                        f"Status: {status}")
            
            # Check invoices_created count
            if not isinstance(invoices_created, int) or invoices_created < 0:
                log_test("Auto-Generate Invoices - Count Type", False, 
                        f"invoices_created should be int >= 0, got {invoices_created}")
                return False
            
            # We created 2 affiliates with clicks, so we expect 2 invoices
            if invoices_created >= 2:
                log_test("Auto-Generate Invoices - Count", True, 
                        f"Created {invoices_created} invoices (expected >= 2)")
            else:
                log_test("Auto-Generate Invoices - Count", False, 
                        f"Expected at least 2 invoices, got {invoices_created}")
            
            # Verify invoices were actually created in the database
            print("\n--- Verifying invoices in database ---")
            invoices_response = requests.get(f"{API_BASE}/invoices", timeout=10)
            if invoices_response.status_code == 200:
                invoices = invoices_response.json().get("invoices", [])
                affiliate_invoices = [inv for inv in invoices if inv.get("invoice_type") == "affiliate"]
                
                if len(affiliate_invoices) >= invoices_created:
                    log_test("Auto-Generate Invoices - Database Verification", True, 
                            f"Found {len(affiliate_invoices)} affiliate invoices in database")
                    
                    # Store invoice IDs for cleanup
                    for inv in affiliate_invoices:
                        inv_id = inv.get("invoice_id")
                        if inv_id and inv_id not in created_ids["invoices"]:
                            created_ids["invoices"].append(inv_id)
                else:
                    log_test("Auto-Generate Invoices - Database Verification", False, 
                            f"Expected at least {invoices_created} invoices, found {len(affiliate_invoices)}")
            
            return True
        else:
            log_test("Auto-Generate Invoices", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        log_test("Auto-Generate Invoices", False, f"Exception: {str(e)}")
        return False

def cleanup():
    """Clean up test data"""
    print("\n" + "="*80)
    print("CLEANUP: Removing test data")
    print("="*80)
    
    for affiliate_id in created_ids["affiliates"][:]:
        try:
            requests.delete(f"{API_BASE}/affiliates/{affiliate_id}", timeout=10)
            print(f"   Deleted affiliate: {affiliate_id}")
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
    print("MY OPTICAL WALLET - NEW ENDPOINTS TEST SUITE")
    print(f"Testing backend at: {BACKEND_URL}")
    print("="*80)
    
    try:
        # Test existing endpoints first
        test_health_check()
        test_analytics_dashboard()
        test_financial_dashboard()
        
        # Test NEW endpoints
        test_weekly_pdf_report()
        test_auto_generate_invoices()
        
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
