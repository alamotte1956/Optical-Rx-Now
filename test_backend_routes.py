#!/usr/bin/env python3
"""
Simple routing tests for analytics-only backend
Verifies endpoints are configured correctly without needing MongoDB
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.server import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_removed_endpoints():
    """Test that PHI-related endpoints return 404"""
    print("Testing removed endpoints...")
    
    # Test family member endpoints
    endpoints_to_test = [
        ("POST", "/api/family-members", {"name": "test", "relationship": "self"}),
        ("GET", "/api/family-members", None),
        ("GET", "/api/family-members/123", None),
        ("PUT", "/api/family-members/123", {"name": "test", "relationship": "self"}),
        ("DELETE", "/api/family-members/123", None),
        # Test prescription endpoints
        ("POST", "/api/prescriptions", {"family_member_id": "123", "rx_type": "eyeglass", "image_base64": "test"}),
        ("GET", "/api/prescriptions", None),
        ("GET", "/api/prescriptions/123", None),
        ("PUT", "/api/prescriptions/123", {"notes": "test"}),
        ("DELETE", "/api/prescriptions/123", None),
        # Test stats endpoint
        ("GET", "/api/stats", None),
    ]
    
    all_passed = True
    for method, endpoint, data in endpoints_to_test:
        if method == "GET":
            response = client.get(endpoint)
        elif method == "POST":
            response = client.post(endpoint, json=data)
        elif method == "PUT":
            response = client.put(endpoint, json=data)
        elif method == "DELETE":
            response = client.delete(endpoint)
        
        if response.status_code == 404:
            print(f"  ✅ {method} {endpoint} returns 404")
        else:
            print(f"  ❌ {method} {endpoint} returns {response.status_code} (expected 404)")
            all_passed = False
    
    return all_passed


def test_health_endpoints():
    """Test health check endpoints"""
    print("\nTesting health endpoints...")
    
    all_passed = True
    
    # Test root health check
    response = client.get("/")
    if response.status_code == 200 and "status" in response.json():
        print(f"  ✅ GET / returns 200 with health status")
    else:
        print(f"  ❌ GET / failed (status: {response.status_code})")
        all_passed = False
    
    # Test API root
    response = client.get("/api/")
    if response.status_code == 200 and "message" in response.json():
        print(f"  ✅ GET /api/ returns 200 with API info")
    else:
        print(f"  ❌ GET /api/ failed (status: {response.status_code})")
        all_passed = False
    
    return all_passed


def test_endpoint_routes():
    """Test that expected endpoints exist in the routing"""
    print("\nTesting endpoint routing configuration...")
    
    # Get all routes from the app
    routes = []
    for route in app.routes:
        if hasattr(route, 'path'):
            routes.append((route.path, list(route.methods) if hasattr(route, 'methods') else []))
    
    # Check analytics endpoints exist
    analytics_routes = [r for r in routes if '/analytics' in r[0]]
    affiliate_routes = [r for r in routes if '/affiliate' in r[0]]
    
    all_passed = True
    
    if any('/analytics/track' in r[0] for r in analytics_routes):
        print(f"  ✅ /api/analytics/track endpoint exists")
    else:
        print(f"  ❌ /api/analytics/track endpoint not found")
        all_passed = False
    
    if any('/analytics/dashboard' in r[0] for r in analytics_routes):
        print(f"  ✅ /api/analytics/dashboard endpoint exists")
    else:
        print(f"  ❌ /api/analytics/dashboard endpoint not found")
        all_passed = False
    
    if any('/affiliates' in r[0] and r[0] == '/api/affiliates' for r in affiliate_routes):
        print(f"  ✅ /api/affiliates endpoint exists")
    else:
        print(f"  ❌ /api/affiliates endpoint not found")
        all_passed = False
    
    # Check that PHI routes don't exist
    phi_routes = [r for r in routes if any(x in r[0] for x in ['/family-member', '/prescription'])]
    if not phi_routes:
        print(f"  ✅ No PHI-related routes found (correctly removed)")
    else:
        print(f"  ❌ PHI routes still exist: {phi_routes}")
        all_passed = False
    
    return all_passed


def test_admin_authentication():
    """Test admin authentication is required for protected endpoints"""
    print("\nTesting admin authentication...")
    
    all_passed = True
    ADMIN_KEY = "change-this-in-production"
    
    # Test dashboard without admin key (should fail without MongoDB, but check auth first)
    response = client.get("/api/analytics/dashboard")
    if response.status_code == 403:
        print(f"  ✅ GET /api/analytics/dashboard requires admin key (403)")
    else:
        print(f"  ❌ GET /api/analytics/dashboard status: {response.status_code} (expected 403 without key)")
        all_passed = False
    
    # Test affiliates/all without admin key
    response = client.get("/api/affiliates/all")
    if response.status_code == 403:
        print(f"  ✅ GET /api/affiliates/all requires admin key (403)")
    else:
        print(f"  ❌ GET /api/affiliates/all status: {response.status_code} (expected 403 without key)")
        all_passed = False
    
    # Test POST /api/affiliates without admin key
    response = client.post("/api/affiliates", json={
        "name": "Test",
        "description": "Test",
        "url": "https://example.com",
        "category": "both",
        "discount": "10%"
    })
    if response.status_code == 403:
        print(f"  ✅ POST /api/affiliates requires admin key (403)")
    else:
        print(f"  ❌ POST /api/affiliates status: {response.status_code} (expected 403 without key)")
        all_passed = False
    
    return all_passed


def main():
    """Run all tests"""
    print("🧪 Running Analytics-Only Backend Routing Tests\n")
    print("="*60)
    
    results = {
        "Removed endpoints return 404": test_removed_endpoints(),
        "Health endpoints work": test_health_endpoints(),
        "Endpoint routes configured": test_endpoint_routes(),
        "Admin authentication enforced": test_admin_authentication()
    }
    
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed! Backend refactoring successful.")
        return 0
    else:
        print(f"\n⚠️  Some tests failed.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
