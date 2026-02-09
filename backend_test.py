#!/usr/bin/env python3
"""
Backend API Testing for Vision Rx Vault
Tests all CRUD operations for Family Members and Prescriptions
"""

import requests
import json
import base64
from datetime import datetime
import sys

# Use the frontend environment URL for testing
BASE_URL = "https://lens-vault-2.preview.emergentagent.com/api"

class VisionRxAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.created_family_members = []
        self.created_prescriptions = []
        
    def log(self, message, level="INFO"):
        """Log test messages"""
        print(f"[{level}] {message}")
        
    def test_api_connection(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                self.log("✅ API connection successful")
                self.log(f"Response: {response.json()}")
                return True
            else:
                self.log(f"❌ API connection failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ API connection error: {str(e)}", "ERROR")
            return False
    
    def test_family_member_crud(self):
        """Test all Family Member CRUD operations"""
        self.log("\n=== Testing Family Member CRUD Operations ===")
        
        # Test 1: Create Family Member
        self.log("1. Testing POST /api/family-members")
        family_data = {
            "name": "John Doe",
            "relationship": "Self"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/family-members",
                json=family_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                member = response.json()
                self.created_family_members.append(member['id'])
                self.log(f"✅ Family member created: {member['name']} (ID: {member['id']})")
                family_member_id = member['id']
            else:
                self.log(f"❌ Failed to create family member: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating family member: {str(e)}", "ERROR")
            return False
        
        # Test 2: Get All Family Members
        self.log("2. Testing GET /api/family-members")
        try:
            response = self.session.get(f"{self.base_url}/family-members")
            if response.status_code == 200:
                members = response.json()
                self.log(f"✅ Retrieved {len(members)} family members")
                if len(members) > 0:
                    self.log(f"First member: {members[0]['name']}")
            else:
                self.log(f"❌ Failed to get family members: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting family members: {str(e)}", "ERROR")
            return False
        
        # Test 3: Get Specific Family Member
        self.log("3. Testing GET /api/family-members/{id}")
        try:
            response = self.session.get(f"{self.base_url}/family-members/{family_member_id}")
            if response.status_code == 200:
                member = response.json()
                self.log(f"✅ Retrieved specific family member: {member['name']}")
            else:
                self.log(f"❌ Failed to get specific family member: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting specific family member: {str(e)}", "ERROR")
            return False
        
        # Test 4: Update Family Member
        self.log("4. Testing PUT /api/family-members/{id}")
        update_data = {
            "name": "John Smith",
            "relationship": "Self"
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/family-members/{family_member_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                updated_member = response.json()
                self.log(f"✅ Family member updated: {updated_member['name']}")
            else:
                self.log(f"❌ Failed to update family member: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error updating family member: {str(e)}", "ERROR")
            return False
        
        return family_member_id
    
    def test_prescription_crud(self, family_member_id):
        """Test all Prescription CRUD operations"""
        self.log("\n=== Testing Prescription CRUD Operations ===")
        
        # Test 1: Create Prescription
        self.log("1. Testing POST /api/prescriptions")
        
        # Create a simple base64 test image
        test_image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        prescription_data = {
            "family_member_id": family_member_id,
            "rx_type": "eyeglass",
            "image_base64": f"data:image/png;base64,{test_image_data}",
            "notes": "Test prescription notes",
            "date_taken": "2025-01-15"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/prescriptions",
                json=prescription_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                prescription = response.json()
                self.created_prescriptions.append(prescription['id'])
                self.log(f"✅ Prescription created: {prescription['rx_type']} (ID: {prescription['id']})")
                prescription_id = prescription['id']
            else:
                self.log(f"❌ Failed to create prescription: {response.status_code} - {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error creating prescription: {str(e)}", "ERROR")
            return False
        
        # Test 2: Get All Prescriptions
        self.log("2. Testing GET /api/prescriptions")
        try:
            response = self.session.get(f"{self.base_url}/prescriptions")
            if response.status_code == 200:
                prescriptions = response.json()
                self.log(f"✅ Retrieved {len(prescriptions)} prescriptions")
                if len(prescriptions) > 0:
                    self.log(f"First prescription type: {prescriptions[0]['rx_type']}")
            else:
                self.log(f"❌ Failed to get prescriptions: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting prescriptions: {str(e)}", "ERROR")
            return False
        
        # Test 3: Get Prescriptions by Family Member
        self.log("3. Testing GET /api/prescriptions?family_member_id={id}")
        try:
            response = self.session.get(f"{self.base_url}/prescriptions?family_member_id={family_member_id}")
            if response.status_code == 200:
                filtered_prescriptions = response.json()
                self.log(f"✅ Retrieved {len(filtered_prescriptions)} prescriptions for family member")
            else:
                self.log(f"❌ Failed to get filtered prescriptions: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting filtered prescriptions: {str(e)}", "ERROR")
            return False
        
        # Test 4: Get Specific Prescription
        self.log("4. Testing GET /api/prescriptions/{id}")
        try:
            response = self.session.get(f"{self.base_url}/prescriptions/{prescription_id}")
            if response.status_code == 200:
                prescription = response.json()
                self.log(f"✅ Retrieved specific prescription: {prescription['rx_type']}")
            else:
                self.log(f"❌ Failed to get specific prescription: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting specific prescription: {str(e)}", "ERROR")
            return False
        
        # Test 5: Update Prescription
        self.log("5. Testing PUT /api/prescriptions/{id}")
        update_data = {
            "rx_type": "contact",
            "notes": "Updated prescription notes"
        }
        
        try:
            response = self.session.put(
                f"{self.base_url}/prescriptions/{prescription_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                updated_prescription = response.json()
                self.log(f"✅ Prescription updated: {updated_prescription['rx_type']}")
            else:
                self.log(f"❌ Failed to update prescription: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error updating prescription: {str(e)}", "ERROR")
            return False
        
        return prescription_id
    
    def test_stats_api(self):
        """Test Stats API"""
        self.log("\n=== Testing Stats API ===")
        
        try:
            response = self.session.get(f"{self.base_url}/stats")
            if response.status_code == 200:
                stats = response.json()
                self.log("✅ Stats retrieved successfully:")
                self.log(f"   Family members: {stats.get('family_members', 0)}")
                self.log(f"   Total prescriptions: {stats.get('total_prescriptions', 0)}")
                self.log(f"   Eyeglass prescriptions: {stats.get('eyeglass_prescriptions', 0)}")
                self.log(f"   Contact prescriptions: {stats.get('contact_prescriptions', 0)}")
                return True
            else:
                self.log(f"❌ Failed to get stats: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error getting stats: {str(e)}", "ERROR")
            return False
    
    def test_invalid_family_member_prescription(self):
        """Test creating prescription with invalid family member ID"""
        self.log("\n=== Testing Invalid Family Member ID ===")
        
        invalid_prescription_data = {
            "family_member_id": "invalid_id_12345",
            "rx_type": "eyeglass",
            "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
            "notes": "Test with invalid family member",
            "date_taken": "2025-01-15"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/prescriptions",
                json=invalid_prescription_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 400 or response.status_code == 404:
                self.log("✅ Correctly rejected prescription with invalid family member ID")
                return True
            else:
                self.log(f"❌ Should have rejected invalid family member ID, got: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error testing invalid family member ID: {str(e)}", "ERROR")
            return False
    
    def test_cascade_delete(self, family_member_id, prescription_id):
        """Test that deleting family member cascades to delete prescriptions"""
        self.log("\n=== Testing Cascade Delete ===")
        
        # First verify prescription exists
        try:
            response = self.session.get(f"{self.base_url}/prescriptions/{prescription_id}")
            if response.status_code != 200:
                self.log("❌ Prescription doesn't exist for cascade test", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error checking prescription existence: {str(e)}", "ERROR")
            return False
        
        # Delete family member
        try:
            response = self.session.delete(f"{self.base_url}/family-members/{family_member_id}")
            if response.status_code == 200:
                self.log("✅ Family member deleted successfully")
            else:
                self.log(f"❌ Failed to delete family member: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error deleting family member: {str(e)}", "ERROR")
            return False
        
        # Verify prescription was also deleted by checking all prescriptions
        try:
            # Check if prescription still exists by getting all prescriptions
            response = self.session.get(f"{self.base_url}/prescriptions")
            if response.status_code == 200:
                all_prescriptions = response.json()
                # Check if our prescription ID is in the list
                prescription_exists = any(p['id'] == prescription_id for p in all_prescriptions)
                if not prescription_exists:
                    self.log("✅ Prescription was correctly deleted with family member (cascade delete working)")
                    return True
                else:
                    self.log(f"❌ Prescription still exists after family member deletion", "ERROR")
                    return False
            else:
                self.log(f"❌ Error checking prescriptions after cascade delete: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Error checking prescription after cascade delete: {str(e)}", "ERROR")
            return False
    
    def cleanup(self):
        """Clean up any remaining test data"""
        self.log("\n=== Cleanup ===")
        
        # Delete remaining prescriptions
        for prescription_id in self.created_prescriptions:
            try:
                response = self.session.delete(f"{self.base_url}/prescriptions/{prescription_id}")
                if response.status_code == 200:
                    self.log(f"✅ Cleaned up prescription: {prescription_id}")
            except:
                pass
        
        # Delete remaining family members
        for member_id in self.created_family_members:
            try:
                response = self.session.delete(f"{self.base_url}/family-members/{member_id}")
                if response.status_code == 200:
                    self.log(f"✅ Cleaned up family member: {member_id}")
            except:
                pass
    
    def run_all_tests(self):
        """Run all backend API tests"""
        self.log("🚀 Starting Vision Rx Vault Backend API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        results = {
            "api_connection": False,
            "family_crud": False,
            "prescription_crud": False,
            "stats_api": False,
            "invalid_family_member": False,
            "cascade_delete": False
        }
        
        # Test API connection
        if not self.test_api_connection():
            self.log("❌ Cannot proceed - API connection failed", "ERROR")
            return results
        results["api_connection"] = True
        
        # Test Family Member CRUD
        family_member_id = self.test_family_member_crud()
        if family_member_id:
            results["family_crud"] = True
        else:
            self.log("❌ Family CRUD tests failed", "ERROR")
            return results
        
        # Test Prescription CRUD
        prescription_id = self.test_prescription_crud(family_member_id)
        if prescription_id:
            results["prescription_crud"] = True
        else:
            self.log("❌ Prescription CRUD tests failed", "ERROR")
            return results
        
        # Test Stats API
        if self.test_stats_api():
            results["stats_api"] = True
        
        # Test invalid family member ID
        if self.test_invalid_family_member_prescription():
            results["invalid_family_member"] = True
        
        # Test cascade delete (this will clean up our test data)
        if self.test_cascade_delete(family_member_id, prescription_id):
            results["cascade_delete"] = True
        
        # Final cleanup
        self.cleanup()
        
        # Summary
        self.log("\n" + "="*50)
        self.log("🏁 TEST SUMMARY")
        self.log("="*50)
        
        passed = sum(results.values())
        total = len(results)
        
        for test_name, passed_test in results.items():
            status = "✅ PASS" if passed_test else "❌ FAIL"
            self.log(f"{test_name.replace('_', ' ').title()}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            self.log(f"⚠️  {total - passed} test(s) failed. Backend needs attention.")
            return False

if __name__ == "__main__":
    tester = VisionRxAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)