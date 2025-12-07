module.exports = {
  donorUser: {
    email: "donor@test.com",
    password: "Donor@123",
    contact: "9999999999",
    role: "Donor"
  },

  ngoUser: {
    email: "ngo@test.com",
    password: "Ngo@12345",
    contact: "8888888888",
    role: "NGO"
  },

  volunteerUser: {
    email: "vol@test.com",
    password: "Volunteer@123",
    contact: "7777777777",
    role: "Volunteer"
  },

  donorProfile: {
    firstName: "Test",
    lastName: "Donor",
    address: "Donor Street",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001"
  },

  ngoProfile: {
    organizationName: "Helping Hands",
    registrationNumber: "NGO123",
    registeredUnder: "Trust Act",
    address: "NGO Street",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
    about: "We help people",
    documents: ["/docs/test.pdf"]
  },

  volunteerProfile: {
    firstName: "Test",
    lastName: "Volunteer",
    address: "Volunteer Street",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001"
  },

  donationData: {
    donation: {
      title: "Test Food",
      source: "Restaurant",
      numberOfPeopleFed: 5,
      description: "Good food",
      images: ["/images/test.jpg"],
      address: "Pickup Street",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
      personName: "Test Donor",
      contact: "9999999999",
      email: "donor@test.com",
      location: {
        latitude: 23.0225,
        longitude: 72.5714
      },
      items: [
        {
          name: "Rice",
          quantity: 3,
          unit: "Kilograms",
          type: "Cooked Food",
          condition: "Fresh",
          cookedDate: "2025-01-01",
          cookedTime: "10:00",
          itemImages: ["/images/item.jpg"]
        }
      ]
    }
  }
};
