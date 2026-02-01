#!/usr/bin/env python3
"""
Debug test for cascade delete functionality
"""

import requests
import json

BASE_URL = "https://eye-script-app.preview.emergentagent.com/api"

def debug_cascade_delete():
    session = requests.Session()
    
    print("=== Debugging Cascade Delete ===")
    
    # 1. Create a family member
    family_data = {"name": "Test User", "relationship": "Self"}
    response = session.post(f"{BASE_URL}/family-members", json=family_data)
    if response.status_code != 200:
        print(f"Failed to create family member: {response.status_code}")
        return
    
    family_member = response.json()
    family_id = family_member['id']
    print(f"Created family member with ID: {family_id}")
    
    # 2. Create a prescription for this family member
    prescription_data = {
        "family_member_id": family_id,
        "rx_type": "eyeglass",
        "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "notes": "Test prescription",
        "date_taken": "2025-01-15"
    }
    
    response = session.post(f"{BASE_URL}/prescriptions", json=prescription_data)
    if response.status_code != 200:
        print(f"Failed to create prescription: {response.status_code} - {response.text}")
        return
    
    prescription = response.json()
    prescription_id = prescription['id']
    print(f"Created prescription with ID: {prescription_id}")
    print(f"Prescription family_member_id: {prescription['family_member_id']}")
    
    # 3. Verify prescription exists
    response = session.get(f"{BASE_URL}/prescriptions/{prescription_id}")
    if response.status_code == 200:
        print("✅ Prescription exists before family member deletion")
    else:
        print("❌ Prescription doesn't exist before deletion")
        return
    
    # 4. Check prescriptions by family member ID
    response = session.get(f"{BASE_URL}/prescriptions?family_member_id={family_id}")
    if response.status_code == 200:
        prescriptions = response.json()
        print(f"Found {len(prescriptions)} prescriptions for family member {family_id}")
        if prescriptions:
            print(f"Prescription family_member_id in DB: {prescriptions[0]['family_member_id']}")
    
    # 5. Delete family member
    print(f"Deleting family member: {family_id}")
    response = session.delete(f"{BASE_URL}/family-members/{family_id}")
    if response.status_code == 200:
        print("✅ Family member deleted successfully")
        print(f"Response: {response.json()}")
    else:
        print(f"❌ Failed to delete family member: {response.status_code} - {response.text}")
        return
    
    # 6. Check if prescription still exists
    response = session.get(f"{BASE_URL}/prescriptions/{prescription_id}")
    if response.status_code == 404:
        print("✅ Prescription was correctly deleted (cascade worked)")
    elif response.status_code == 200:
        print("❌ Prescription still exists after family member deletion")
        remaining_prescription = response.json()
        print(f"Remaining prescription family_member_id: {remaining_prescription['family_member_id']}")
    else:
        print(f"❌ Unexpected response when checking prescription: {response.status_code}")
    
    # 7. Check all prescriptions to see if any remain
    response = session.get(f"{BASE_URL}/prescriptions")
    if response.status_code == 200:
        all_prescriptions = response.json()
        print(f"Total prescriptions remaining: {len(all_prescriptions)}")
        for p in all_prescriptions:
            print(f"  - Prescription {p['id']} for family_member_id: {p['family_member_id']}")

if __name__ == "__main__":
    debug_cascade_delete()