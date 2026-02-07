#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MedicalAssociationAPITester:
    def __init__(self, base_url="https://spo-medical.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            details = ""
            
            if not success:
                details = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_body = response.json()
                    details += f" - {error_body}"
                except:
                    details += f" - {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            try:
                return success, response.json() if response.content else {}
            except:
                return success, {"raw_response": response.text}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            self.log_test(name, False, error_msg)
            return False, {}

    def test_login(self):
        """Test admin login"""
        try:
            url = f"{self.base_url}/api/auth/login"
            form_data = {
                'username': 'admin@medassoc.com',
                'password': 'admin123'
            }
            
            print(f"\n🔍 Testing Admin Login...")
            print(f"   URL: {url}")
            print(f"   Method: POST (Form Data)")
            
            response_obj = requests.post(url, data=form_data, timeout=10)
            print(f"   Status: {response_obj.status_code}")
            
            if response_obj.status_code == 200:
                response = response_obj.json()
                self.log_test("Admin Login", True)
                
                if 'access_token' in response:
                    self.token = response['access_token']
                    print(f"   Token obtained: {self.token[:20]}...")
                    return True
            else:
                try:
                    error_body = response_obj.json()
                    details = f"Status: {response_obj.status_code} - {error_body}"
                except:
                    details = f"Status: {response_obj.status_code} - {response_obj.text[:200]}"
                self.log_test("Admin Login", False, details)
                    
        except Exception as e:
            self.log_test("Admin Login", False, str(e))
        
        return False

    def test_get_doctors_empty(self):
        """Test getting doctors when database is empty"""
        success, response = self.run_test(
            "Get Doctors (Empty)",
            "GET",
            "api/doctors",
            200
        )
        
        if success and isinstance(response, list) and len(response) == 0:
            print("   Database is empty as expected")
            return True
        elif success and isinstance(response, list):
            print(f"   Found {len(response)} existing doctors")
            return True
        return False

    def test_create_doctor(self):
        """Test creating a new doctor"""
        doctor_data = {
            "name": "Dr. House",
            "city": "Princeton",
            "specialty": "Diagnostics",
            "contact_info": "555-0199"
        }
        
        success, response = self.run_test(
            "Create Doctor",
            "POST",
            "api/doctors",
            200,  # Backend returns 200 instead of 201
            data=doctor_data
        )
        
        if success and 'id' in response:
            self.test_doctor_id = response['id']
            print(f"   Created doctor with ID: {self.test_doctor_id}")
            return True
        return False

    def test_get_doctors_with_data(self):
        """Test getting doctors after adding one"""
        success, response = self.run_test(
            "Get Doctors (With Data)",
            "GET",
            "api/doctors",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} doctors")
            # Check if our test doctor is there
            for doctor in response:
                if doctor.get('name') == 'Dr. House':
                    print("   Test doctor found in list")
                    return True
        return False

    def test_search_doctors_by_city(self):
        """Test searching doctors by city"""
        success, response = self.run_test(
            "Search Doctors by City",
            "GET",
            "api/doctors?city=Princeton",
            200
        )
        
        if success and isinstance(response, list):
            princeton_doctors = [d for d in response if 'Princeton' in d.get('city', '')]
            if len(princeton_doctors) > 0:
                print(f"   Found {len(princeton_doctors)} doctors in Princeton")
                return True
        return False

    def test_update_doctor(self):
        """Test updating a doctor"""
        if not hasattr(self, 'test_doctor_id'):
            self.log_test("Update Doctor", False, "No doctor ID available")
            return False
            
        update_data = {
            "city": "Trenton"
        }
        
        success, response = self.run_test(
            "Update Doctor",
            "PUT",
            f"api/doctors/{self.test_doctor_id}",
            200,
            data=update_data
        )
        
        if success and response.get('city') == 'Trenton':
            print("   Doctor city updated successfully")
            return True
        return False

    def test_delete_doctor(self):
        """Test deleting a doctor"""
        if not hasattr(self, 'test_doctor_id'):
            self.log_test("Delete Doctor", False, "No doctor ID available")
            return False
            
        success, response = self.run_test(
            "Delete Doctor",
            "DELETE",
            f"api/doctors/{self.test_doctor_id}",
            200
        )
        
        if success:
            print("   Doctor deleted successfully")
            return True
        return False

    def test_get_doctors_after_delete(self):
        """Test that doctor is gone after deletion"""
        success, response = self.run_test(
            "Verify Doctor Deleted",
            "GET",
            "api/doctors",
            200
        )
        
        if success and isinstance(response, list):
            # Check that our test doctor is no longer there
            for doctor in response:
                if doctor.get('name') == 'Dr. House':
                    self.log_test("Verify Doctor Deleted", False, "Doctor still exists")
                    return False
            print("   Doctor successfully removed from database")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🏥 Medical Association API Testing")
        print("=" * 50)
        
        # Test login first
        if not self.test_login():
            print("❌ Login failed - cannot proceed with authenticated tests")
            return False
        
        # Run all tests
        self.test_get_doctors_empty()
        
        if self.test_create_doctor():
            self.test_get_doctors_with_data()
            self.test_search_doctors_by_city()
            self.test_update_doctor()
            self.test_delete_doctor()
            self.test_get_doctors_after_delete()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

    def get_test_results(self):
        """Return detailed test results"""
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0,
            "results": self.test_results
        }

def main():
    tester = MedicalAssociationAPITester()
    success = tester.run_all_tests()
    
    # Save results
    results = tester.get_test_results()
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())