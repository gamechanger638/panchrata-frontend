import { Family, Member, MatchRequest, AppUser, FamilyTreeNode, PanchratnaCategory } from "@/types";

const avatarUrl = (seed: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4f7cff,2dd4bf,f59e0b,a855f7,ef4444`;

export const panchratnaCategories: PanchratnaCategory[] = ["Manu", "Maya", "Tvashta", "Shilpi", "Vishvajna"];
export const cities = ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Jaipur", "Udaipur", "Mumbai", "Pune", "Indore", "Bhopal"];
export const educations = ["10th", "12th", "Diploma", "Graduate", "Post Graduate", "PhD", "ITI", "Other"];
export const professions = ["Business", "Engineer", "Doctor", "Teacher", "Farmer", "Government Job", "Private Job", "Self Employed", "Student", "Other"];
export const gotras = ["Bharadwaj", "Kashyap", "Vashishta", "Gautam", "Atri", "Vishwamitra", "Jamadagni", "Agastya"];

export const currentUser: AppUser = {
  id: "u1", name: "Ramesh Vishwakarma", email: "ramesh@example.com", role: "Super Admin", assignedArea: "Ahmedabad", avatar: avatarUrl("RV"),
};

export const families: Family[] = [
  { id: "f1", familyHead: "Ramesh Vishwakarma", mobile: "9876543210", address: "123 Main St", city: "Ahmedabad", state: "Gujarat", village: "Dhandhuka", pincode: "382460", panchratnaCategory: "Manu", totalMembers: 5, createdAt: "2024-01-15" },
  { id: "f2", familyHead: "Suresh Prajapati", mobile: "9876543211", address: "456 Oak Ave", city: "Surat", state: "Gujarat", village: "Bardoli", pincode: "394601", panchratnaCategory: "Maya", totalMembers: 4, createdAt: "2024-02-10" },
  { id: "f3", familyHead: "Mahesh Lohar", mobile: "9876543212", address: "789 Elm Rd", city: "Rajkot", state: "Gujarat", village: "Gondal", pincode: "360311", panchratnaCategory: "Tvashta", totalMembers: 6, createdAt: "2024-03-05" },
  { id: "f4", familyHead: "Dinesh Suthar", mobile: "9876543213", address: "101 Pine Ln", city: "Vadodara", state: "Gujarat", village: "Padra", pincode: "391440", panchratnaCategory: "Shilpi", totalMembers: 3, createdAt: "2024-03-20" },
  { id: "f5", familyHead: "Kamlesh Panchal", mobile: "9876543214", address: "202 Cedar Dr", city: "Jaipur", state: "Rajasthan", village: "Sanganer", pincode: "302029", panchratnaCategory: "Vishvajna", totalMembers: 7, createdAt: "2024-04-01" },
  { id: "f6", familyHead: "Jayesh Soni", mobile: "9876543215", address: "303 Birch St", city: "Udaipur", state: "Rajasthan", village: "Kherwara", pincode: "313803", panchratnaCategory: "Manu", totalMembers: 4, createdAt: "2024-04-15" },
  { id: "f7", familyHead: "Prakash Kumhar", mobile: "9876543216", address: "404 Maple Way", city: "Mumbai", state: "Maharashtra", village: "Thane", pincode: "400601", panchratnaCategory: "Maya", totalMembers: 5, createdAt: "2024-05-01" },
  { id: "f8", familyHead: "Ashok Carpenter", mobile: "9876543217", address: "505 Walnut Blvd", city: "Pune", state: "Maharashtra", village: "Chinchwad", pincode: "411019", panchratnaCategory: "Tvashta", totalMembers: 3, createdAt: "2024-05-15" },
];

export const members: Member[] = [
  { id: "m1", familyId: "f1", name: "Ramesh Vishwakarma", fatherName: "Late Mohan Vishwakarma", motherName: "Savita Vishwakarma", dob: "1975-05-15", gender: "Male", education: "Graduate", profession: "Business", maritalStatus: "Married", bloodGroup: "B+", mobile: "9876543210", photo: avatarUrl("Ramesh V"), address: "123 Main St", city: "Ahmedabad", state: "Gujarat", gotra: "Bharadwaj", panchratnaCategory: "Manu", age: 49 },
  { id: "m2", familyId: "f1", name: "Sunita Vishwakarma", fatherName: "Late Mohan Vishwakarma", motherName: "Savita Vishwakarma", dob: "1980-08-20", gender: "Female", education: "12th", profession: "Self Employed", maritalStatus: "Married", bloodGroup: "A+", mobile: "9876543220", photo: avatarUrl("Sunita V"), address: "123 Main St", city: "Ahmedabad", state: "Gujarat", gotra: "Kashyap", panchratnaCategory: "Manu", age: 44 },
  { id: "m3", familyId: "f1", name: "Rahul Vishwakarma", fatherName: "Ramesh Vishwakarma", motherName: "Sunita Vishwakarma", dob: "2000-03-10", gender: "Male", education: "Post Graduate", profession: "Engineer", maritalStatus: "Unmarried", bloodGroup: "B+", mobile: "9876543230", photo: avatarUrl("Rahul V"), address: "123 Main St", city: "Ahmedabad", state: "Gujarat", gotra: "Bharadwaj", panchratnaCategory: "Manu", age: 24 },
  { id: "m4", familyId: "f1", name: "Priya Vishwakarma", fatherName: "Ramesh Vishwakarma", motherName: "Sunita Vishwakarma", dob: "2002-11-25", gender: "Female", education: "Graduate", profession: "Student", maritalStatus: "Unmarried", bloodGroup: "A+", mobile: "9876543240", photo: avatarUrl("Priya V"), address: "123 Main St", city: "Ahmedabad", state: "Gujarat", gotra: "Bharadwaj", panchratnaCategory: "Manu", age: 22 },
  { id: "m5", familyId: "f2", name: "Suresh Prajapati", fatherName: "Late Karan Prajapati", motherName: "Kamla Prajapati", dob: "1970-12-01", gender: "Male", education: "Diploma", profession: "Business", maritalStatus: "Married", bloodGroup: "O+", mobile: "9876543211", photo: avatarUrl("Suresh P"), address: "456 Oak Ave", city: "Surat", state: "Gujarat", gotra: "Vashishta", panchratnaCategory: "Maya", age: 54 },
  { id: "m6", familyId: "f2", name: "Kavita Prajapati", fatherName: "Late Karan Prajapati", motherName: "Kamla Prajapati", dob: "1975-06-14", gender: "Female", education: "10th", profession: "Self Employed", maritalStatus: "Married", bloodGroup: "B-", mobile: "9876543251", photo: avatarUrl("Kavita P"), address: "456 Oak Ave", city: "Surat", state: "Gujarat", gotra: "Gautam", panchratnaCategory: "Maya", age: 49 },
  { id: "m7", familyId: "f2", name: "Amit Prajapati", fatherName: "Suresh Prajapati", motherName: "Kavita Prajapati", dob: "1998-09-03", gender: "Male", education: "Graduate", profession: "Private Job", maritalStatus: "Unmarried", bloodGroup: "O+", mobile: "9876543261", photo: avatarUrl("Amit P"), address: "456 Oak Ave", city: "Surat", state: "Gujarat", gotra: "Vashishta", panchratnaCategory: "Maya", age: 26 },
  { id: "m8", familyId: "f3", name: "Mahesh Lohar", fatherName: "Late Bharat Lohar", motherName: "Shanti Lohar", dob: "1968-02-20", gender: "Male", education: "ITI", profession: "Self Employed", maritalStatus: "Married", bloodGroup: "AB+", mobile: "9876543212", photo: avatarUrl("Mahesh L"), address: "789 Elm Rd", city: "Rajkot", state: "Gujarat", gotra: "Atri", panchratnaCategory: "Tvashta", age: 56 },
  { id: "m9", familyId: "f3", name: "Neha Lohar", fatherName: "Mahesh Lohar", motherName: "Rekha Lohar", dob: "1999-07-18", gender: "Female", education: "Post Graduate", profession: "Teacher", maritalStatus: "Unmarried", bloodGroup: "AB+", mobile: "9876543271", photo: avatarUrl("Neha L"), address: "789 Elm Rd", city: "Rajkot", state: "Gujarat", gotra: "Atri", panchratnaCategory: "Tvashta", age: 25 },
  { id: "m10", familyId: "f4", name: "Dinesh Suthar", fatherName: "Late Govind Suthar", motherName: "Pushpa Suthar", dob: "1972-04-10", gender: "Male", education: "Graduate", profession: "Government Job", maritalStatus: "Married", bloodGroup: "A-", mobile: "9876543213", photo: avatarUrl("Dinesh S"), address: "101 Pine Ln", city: "Vadodara", state: "Gujarat", gotra: "Vishwamitra", panchratnaCategory: "Shilpi", age: 52 },
  { id: "m11", familyId: "f5", name: "Kamlesh Panchal", fatherName: "Late Ratan Panchal", motherName: "Suman Panchal", dob: "1965-10-30", gender: "Male", education: "12th", profession: "Business", maritalStatus: "Married", bloodGroup: "O-", mobile: "9876543214", photo: avatarUrl("Kamlesh P"), address: "202 Cedar Dr", city: "Jaipur", state: "Rajasthan", gotra: "Jamadagni", panchratnaCategory: "Vishvajna", age: 59 },
  { id: "m12", familyId: "f5", name: "Anita Panchal", fatherName: "Kamlesh Panchal", motherName: "Meena Panchal", dob: "1997-01-22", gender: "Female", education: "Graduate", profession: "Doctor", maritalStatus: "Unmarried", bloodGroup: "O-", mobile: "9876543281", photo: avatarUrl("Anita P"), address: "202 Cedar Dr", city: "Jaipur", state: "Rajasthan", gotra: "Jamadagni", panchratnaCategory: "Vishvajna", age: 27 },
  { id: "m13", familyId: "f5", name: "Vikas Panchal", fatherName: "Kamlesh Panchal", motherName: "Meena Panchal", dob: "2001-05-08", gender: "Male", education: "Diploma", profession: "Student", maritalStatus: "Unmarried", bloodGroup: "O+", mobile: "9876543291", photo: avatarUrl("Vikas P"), address: "202 Cedar Dr", city: "Jaipur", state: "Rajasthan", gotra: "Jamadagni", panchratnaCategory: "Vishvajna", age: 23 },
  { id: "m14", familyId: "f6", name: "Jayesh Soni", fatherName: "Late Nathu Soni", motherName: "Ganga Soni", dob: "1978-08-12", gender: "Male", education: "Graduate", profession: "Business", maritalStatus: "Married", bloodGroup: "B+", mobile: "9876543215", photo: avatarUrl("Jayesh S"), address: "303 Birch St", city: "Udaipur", state: "Rajasthan", gotra: "Agastya", panchratnaCategory: "Manu", age: 46 },
  { id: "m15", familyId: "f7", name: "Prakash Kumhar", fatherName: "Late Shankar Kumhar", motherName: "Lakshmi Kumhar", dob: "1973-03-25", gender: "Male", education: "10th", profession: "Self Employed", maritalStatus: "Married", bloodGroup: "A+", mobile: "9876543216", photo: avatarUrl("Prakash K"), address: "404 Maple Way", city: "Mumbai", state: "Maharashtra", gotra: "Bharadwaj", panchratnaCategory: "Maya", age: 51 },
  { id: "m16", familyId: "f7", name: "Sanjay Kumhar", fatherName: "Prakash Kumhar", motherName: "Asha Kumhar", dob: "1999-11-14", gender: "Male", education: "Graduate", profession: "Engineer", maritalStatus: "Unmarried", bloodGroup: "A+", mobile: "9876543301", photo: avatarUrl("Sanjay K"), address: "404 Maple Way", city: "Mumbai", state: "Maharashtra", gotra: "Bharadwaj", panchratnaCategory: "Maya", age: 25 },
  { id: "m17", familyId: "f8", name: "Ashok Carpenter", fatherName: "Late Raju Carpenter", motherName: "Saroj Carpenter", dob: "1980-07-07", gender: "Male", education: "Diploma", profession: "Private Job", maritalStatus: "Married", bloodGroup: "AB-", mobile: "9876543217", photo: avatarUrl("Ashok C"), address: "505 Walnut Blvd", city: "Pune", state: "Maharashtra", gotra: "Kashyap", panchratnaCategory: "Tvashta", age: 44 },
  { id: "m18", familyId: "f8", name: "Pooja Carpenter", fatherName: "Ashok Carpenter", motherName: "Nisha Carpenter", dob: "2003-02-28", gender: "Female", education: "12th", profession: "Student", maritalStatus: "Unmarried", bloodGroup: "AB-", mobile: "9876543311", photo: avatarUrl("Pooja C"), address: "505 Walnut Blvd", city: "Pune", state: "Maharashtra", gotra: "Kashyap", panchratnaCategory: "Tvashta", age: 21 },
];

export const matchRequests: MatchRequest[] = [
  { id: "mr1", senderMemberId: "m3", receiverMemberId: "m9", status: "Pending", createdAt: "2024-06-01" },
  { id: "mr2", senderMemberId: "m7", receiverMemberId: "m12", status: "Accepted", createdAt: "2024-05-20" },
  { id: "mr3", senderMemberId: "m16", receiverMemberId: "m4", status: "Rejected", createdAt: "2024-05-15" },
];

export const sampleFamilyTree: FamilyTreeNode = {
  id: "m1", name: "Ramesh Vishwakarma", photo: avatarUrl("Ramesh V"), relation: "Head",
  spouse: { id: "m2", name: "Sunita Vishwakarma", photo: avatarUrl("Sunita V"), relation: "Spouse" },
  children: [
    { id: "m3", name: "Rahul Vishwakarma", photo: avatarUrl("Rahul V"), relation: "Son" },
    { id: "m4", name: "Priya Vishwakarma", photo: avatarUrl("Priya V"), relation: "Daughter" },
  ],
};

export const getStats = () => {
  const totalFamilies = families.length;
  const totalMembers = members.length;
  const males = members.filter(m => m.gender === "Male").length;
  const females = members.filter(m => m.gender === "Female").length;
  const married = members.filter(m => m.maritalStatus === "Married").length;
  const unmarried = members.filter(m => m.maritalStatus === "Unmarried").length;
  return { totalFamilies, totalMembers, males, females, married, unmarried };
};

export const getAgeDistribution = () => {
  const ranges = ["0-18", "19-25", "26-35", "36-50", "51+"];
  return ranges.map(range => {
    const [min, max] = range.includes("+") ? [51, 200] : range.split("-").map(Number);
    return { range, count: members.filter(m => m.age >= min && m.age <= max).length };
  });
};

export const getEducationDistribution = () => {
  const counts: Record<string, number> = {};
  members.forEach(m => { counts[m.education] = (counts[m.education] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const getProfessionDistribution = () => {
  const counts: Record<string, number> = {};
  members.forEach(m => { counts[m.profession] = (counts[m.profession] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const getMembersByCity = () => {
  const counts: Record<string, number> = {};
  members.forEach(m => { counts[m.city] = (counts[m.city] || 0) + 1; });
  return Object.entries(counts).map(([city, count]) => ({ city, count }));
};
