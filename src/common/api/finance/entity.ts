// Import or define enums and interfaces
export enum SubmitterType {
  USER = "USER",
  ORGANIZER = "ORGANIZER",
}

export enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum Category {
  TelephoneRental = "Telephone Rental",
  Postage = "Postage",
  OfficeSupplies = "Office Supplies",
  Copies = "Copies",
  EquipmentRental = "Equipment Rental",
  EquipmentPurchase = "Equipment Purchase",
  EquipmentMaintenance = "Equipment Maintenance",
  ProfessionalServices = "Professional Services",
  InsurancePremiums = "Insurance Premiums",
  Advertising = "Advertising",
  DuesMembership = "Dues/Membership",
  AwardsGifts = "Awards/Gifts",
  Photography = "Photography",
  ClothingUniform = "Clothing/Uniform",
  RegistrationTournamentFee = "Registration/Tournament Fee",
  Instructor = "Instructor",
  RefereesJudges = "Referees/Judges",
  Fine = "Fine",
  WebHosting = "Web Hosting",
  BooksSubscription = "Books/Subscription",
  Printing = "Printing",
  Fundraising = "Fundraising",
  Donation = "Donation",
  CdAndDvd = "CD and DVD",
  Rush = "Rush",
  Social = "Social",
  FacilityRentalSocial = "Facility Rental - Social",
  Food = "Food",
  MaterialsSupplies = "Materials & Supplies",
  Meeting = "Meeting",
  EquipmentMaintenanceRepairs = "Equipment Maintenance/Repairs",
  Prizes = "Prizes",
  Security = "Security",
  EmtService = "EMT Service",
  Catering = "Catering",
  Meal = "Meal",
  Banquet = "Banquet",
  Retreat = "Retreat",
  FestivalFairExpense = "Festival/Fair Expense",
  SpecialFunction = "Special Function",
  CollegianAd = "Collegian Ad",
  Banner = "Banner",

  // UPAC FUNDED
  HonorariaSpeaker = "Honoraria - Speaker",
  HonorariaDj = "Honoraria - DJ",
  HonorariaPerformingArtist = "Honoraria - Performing Artist",
  SpeakerArtistTransportation = "Speaker/Artist - Transportation",
  SpeakerArtistLodging = "Speaker/Artist - Lodging",
  SpeakerArtistMeal = "Speaker/Artist - Meal",
  SpeakerArtistParking = "Speaker/Artist - Parking",
  ProgramFacilityRental = "Program - Facility Rental",
  ProgramEquipmentRental = "Program - Equipment Rental",
  ProgramPurchase = "Program - Purchase",
  ProgramSoundSystemRental = "Program - Sound System Rental",
  ProgramMovieRental = "Program - Movie Rental",
  ProgramProjectionist = "Program - Projectionist",
  ProgramProfessionalServices = "Program - Professional Services",
  ProgramPublicity = "Program - Publicity",
  ProgramCopiesFlyersPosters = "Program - Copies/Flyers/Posters",
  ProgramMediaPrintBroadcast = "Program - Media Print/Broadcast",
  ProgramCostume = "Program - Costume",
  ProgramSetConstruction = "Program - Set Construction",
  ProgramProps = "Program - Props",
  ProgramCopyrightLicensing = "Program - Copyright/Licensing",
  GeneralOperations50 = "General Operations ($50)",

  // TRAVEL
  TravelTransportation = "Travel - Transportation",
  TravelLodging = "Travel - Lodging",
  TravelRegistration = "Travel - Registration",
  TravelMeal = "Travel - Meal",
  TravelConference = "Travel - Conference",

  // REFUND
  Refund = "Refund",
}

export interface FinanceEntity {
  id: string;
  submitterId: string;
  submitterType: SubmitterType;
  amount: number;
  description: string;
  category: Category;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  status: Status;
  receiptUrl?: string;
  createdAt: number;
  hackathonId: string;
  updatedBy: string;
}
