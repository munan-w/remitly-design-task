import type { CustomerProfile } from "@/packages/types/name-change";

export const initialProfile: CustomerProfile = {
  customerId: "cust_demo_001",
  legalNameCurrent: "Alex Rivera",
  legalNameAliases: ["Alex Morgan"],
  preferredName: "Alex",
  email: "email@example.com",
  phone: "+1 206 555 0198",
  addressLines: ["Street address", "Seattle, WA 98101"],
  language: "English",
  sendingTo: "China",
  sendingFrom: "United States",
  cardFundedUser: true,
  savedCards: [
    {
      id: "card_demo_visa",
      brand: "Visa",
      last4: "4242",
      nameOnCard: "Alex Rivera",
      status: "active"
    }
  ]
};
