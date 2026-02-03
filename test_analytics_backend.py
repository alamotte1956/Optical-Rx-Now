#!/usr/bin/env python3
"""
Test suite for analytics-only backend
Verifies that:
1. Removed endpoints return 404
2. Analytics endpoints work
3. Affiliate endpoints work (with and without admin auth)
4. Admin authentication is enforced
"""

import pytest
import requests
from fastapi.testclient import TestClient
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.server import app

client = TestClient(app)

# Test admin key
ADMIN_KEY = "change-this-in-production"
INVALID_ADMIN_KEY = "wrong-key"


class TestRemovedEndpoints:
    """Test that PHI-related endpoints are removed"""
    
    def test_family_members_post_returns_404(self):
        """POST /api/family-members should return 404"""
        response = client.post("/api/family-members", json={
            "name": "John Doe",
            "relationship": "Self"
        })
        assert response.status_code == 404
    
    def test_family_members_get_returns_404(self):
        """GET /api/family-members should return 404"""
        response = client.get("/api/family-members")
        assert response.status_code == 404
    
    def test_family_member_get_by_id_returns_404(self):
        """GET /api/family-members/{id} should return 404"""
        response = client.get("/api/family-members/123")
        assert response.status_code == 404
    
    def test_family_member_put_returns_404(self):
        """PUT /api/family-members/{id} should return 404"""
        response = client.put("/api/family-members/123", json={
            "name": "Jane Doe",
            "relationship": "Spouse"
        })
        assert response.status_code == 404
    
    def test_family_member_delete_returns_404(self):
        """DELETE /api/family-members/{id} should return 404"""
        response = client.delete("/api/family-members/123")
        assert response.status_code == 404
    
    def test_prescriptions_post_returns_404(self):
        """POST /api/prescriptions should return 404"""
        response = client.post("/api/prescriptions", json={
            "family_member_id": "123",
            "rx_type": "eyeglass",
            "image_base64": "data:image/png;base64,test",
            "notes": "Test"
        })
        assert response.status_code == 404
    
    def test_prescriptions_get_returns_404(self):
        """GET /api/prescriptions should return 404"""
        response = client.get("/api/prescriptions")
        assert response.status_code == 404
    
    def test_prescription_get_by_id_returns_404(self):
        """GET /api/prescriptions/{id} should return 404"""
        response = client.get("/api/prescriptions/123")
        assert response.status_code == 404
    
    def test_prescription_put_returns_404(self):
        """PUT /api/prescriptions/{id} should return 404"""
        response = client.put("/api/prescriptions/123", json={
            "notes": "Updated notes"
        })
        assert response.status_code == 404
    
    def test_prescription_delete_returns_404(self):
        """DELETE /api/prescriptions/{id} should return 404"""
        response = client.delete("/api/prescriptions/123")
        assert response.status_code == 404
    
    def test_stats_endpoint_returns_404(self):
        """GET /api/stats should return 404"""
        response = client.get("/api/stats")
        assert response.status_code == 404


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_root_health_check(self):
        """Root endpoint should return health status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
    
    def test_api_root(self):
        """API root should return API info"""
        response = client.get("/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data


class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_track_event_app_open(self):
        """POST /api/analytics/track should accept app_open events"""
        response = client.post("/api/analytics/track", json={
            "device_id": "test-device-123",
            "event_type": "app_open",
            "platform": "ios",
            "app_version": "1.0.0"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "tracked"
    
    def test_track_event_ad_click(self):
        """POST /api/analytics/track should accept ad_click events"""
        response = client.post("/api/analytics/track", json={
            "device_id": "test-device-456",
            "event_type": "ad_click",
            "platform": "android",
            "metadata": {"ad_id": "ad-123"}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "tracked"
    
    def test_track_event_affiliate_click(self):
        """POST /api/analytics/track should accept affiliate_click events"""
        response = client.post("/api/analytics/track", json={
            "device_id": "test-device-789",
            "event_type": "affiliate_click",
            "metadata": {"affiliate_id": "partner-1"}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "tracked"
    
    def test_analytics_dashboard_requires_admin_key(self):
        """GET /api/analytics/dashboard should require admin key"""
        response = client.get("/api/analytics/dashboard")
        assert response.status_code == 403
        
    def test_analytics_dashboard_rejects_invalid_key(self):
        """GET /api/analytics/dashboard should reject invalid admin key"""
        response = client.get("/api/analytics/dashboard", headers={
            "X-Admin-Key": INVALID_ADMIN_KEY
        })
        assert response.status_code == 403
    
    def test_analytics_dashboard_accepts_valid_key(self):
        """GET /api/analytics/dashboard should accept valid admin key"""
        response = client.get("/api/analytics/dashboard", headers={
            "X-Admin-Key": ADMIN_KEY
        })
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "platforms" in data
        assert "engagement" in data
        assert "daily_breakdown" in data
        # Verify PHI fields are NOT in the response
        assert "total_prescriptions" not in data.get("engagement", {})
        assert "total_family_members" not in data.get("engagement", {})


class TestAffiliateEndpoints:
    """Test affiliate endpoints"""
    
    def test_get_affiliates_public(self):
        """GET /api/affiliates should be publicly accessible"""
        response = client.get("/api/affiliates")
        assert response.status_code == 200
        data = response.json()
        assert "partners" in data
        # Should only return active affiliates
        for partner in data["partners"]:
            assert partner.get("is_active") is True
    
    def test_get_all_affiliates_requires_admin_key(self):
        """GET /api/affiliates/all should require admin key"""
        response = client.get("/api/affiliates/all")
        assert response.status_code == 403
    
    def test_get_all_affiliates_rejects_invalid_key(self):
        """GET /api/affiliates/all should reject invalid admin key"""
        response = client.get("/api/affiliates/all", headers={
            "X-Admin-Key": INVALID_ADMIN_KEY
        })
        assert response.status_code == 403
    
    def test_get_all_affiliates_accepts_valid_key(self):
        """GET /api/affiliates/all should accept valid admin key"""
        response = client.get("/api/affiliates/all", headers={
            "X-Admin-Key": ADMIN_KEY
        })
        assert response.status_code == 200
        data = response.json()
        assert "partners" in data
    
    def test_create_affiliate_requires_admin_key(self):
        """POST /api/affiliates should require admin key"""
        response = client.post("/api/affiliates", json={
            "name": "Test Partner",
            "description": "Test description",
            "url": "https://example.com",
            "category": "both",
            "discount": "10%",
            "is_featured": False,
            "is_active": True,
            "order": 100
        })
        assert response.status_code == 403
    
    def test_create_affiliate_accepts_valid_key(self):
        """POST /api/affiliates should accept valid admin key"""
        response = client.post("/api/affiliates", json={
            "name": "Test Partner",
            "description": "Test description",
            "url": "https://example.com",
            "category": "both",
            "discount": "10%",
            "is_featured": False,
            "is_active": True,
            "order": 100
        }, headers={
            "X-Admin-Key": ADMIN_KEY
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Partner"
        assert "id" in data
        return data["id"]
    
    def test_update_affiliate_requires_admin_key(self):
        """PUT /api/affiliates/{id} should require admin key"""
        # First create an affiliate
        create_response = client.post("/api/affiliates", json={
            "name": "Update Test",
            "description": "Test",
            "url": "https://example.com",
            "category": "both",
            "discount": "10%",
            "is_featured": False,
            "is_active": True,
            "order": 100
        }, headers={
            "X-Admin-Key": ADMIN_KEY
        })
        affiliate_id = create_response.json()["id"]
        
        # Try to update without admin key
        response = client.put(f"/api/affiliates/{affiliate_id}", json={
            "name": "Updated Name",
            "description": "Updated",
            "url": "https://example.com",
            "category": "both",
            "discount": "15%",
            "is_featured": True,
            "is_active": True,
            "order": 50
        })
        assert response.status_code == 403
    
    def test_delete_affiliate_requires_admin_key(self):
        """DELETE /api/affiliates/{id} should require admin key"""
        # First create an affiliate
        create_response = client.post("/api/affiliates", json={
            "name": "Delete Test",
            "description": "Test",
            "url": "https://example.com",
            "category": "both",
            "discount": "10%",
            "is_featured": False,
            "is_active": True,
            "order": 100
        }, headers={
            "X-Admin-Key": ADMIN_KEY
        })
        affiliate_id = create_response.json()["id"]
        
        # Try to delete without admin key
        response = client.delete(f"/api/affiliates/{affiliate_id}")
        assert response.status_code == 403


def run_tests():
    """Run all tests and print summary"""
    print("🧪 Running Analytics-Only Backend Tests\n")
    
    # Run tests
    exit_code = pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--color=yes"
    ])
    
    return exit_code


if __name__ == "__main__":
    sys.exit(run_tests())
