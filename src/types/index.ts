export type PanchratnaCategory = "Manu" | "Maya" | "Tvashta" | "Shilpi" | "Vishvajna";
export type Gender = "Male" | "Female" | "Other";
export type MaritalStatus = "Unmarried" | "Married" | "Divorced" | "Widowed";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type UserRole = "Super Admin" | "Community Admin" | "Volunteer" | "Viewer";
export type MatchRequestStatus = "Pending" | "Accepted" | "Rejected";

export interface Family {
  id: string;
  familyHead: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  village: string;
  pincode: string;
  panchratnaCategory: PanchratnaCategory;
  totalMembers: number;
  createdAt: string;
}

export interface Member {
  id: string;
  familyId: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  education: string;
  profession: string;
  maritalStatus: MaritalStatus;
  bloodGroup: BloodGroup;
  mobile: string;
  photo: string;
  address: string;
  city: string;
  state: string;
  gotra: string;
  panchratnaCategory: PanchratnaCategory;
  age: number;
  height?: string;
  colour?: string;
  gotra_image?: string;
  profile_image?: string;
  photo1?: string;
  photo2?: string;
  photo3?: string;
}

export interface MarriageProfile {
  id: string;
  memberId: string;
  age: number;
  education: string;
  profession: string;
  city: string;
  isActive: boolean;
}

export interface MatchRequest {
  id: string;
  senderMemberId: string;
  receiverMemberId: string;
  status: MatchRequestStatus;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedArea: string;
  avatar: string;
}

export interface FamilyTreeNode {
  id: string;
  name: string;
  photo: string;
  relation: string;
  spouse?: FamilyTreeNode;
  children?: FamilyTreeNode[];
}
