const karnatakaLocations = {
  Bagalkote: [
    "Bagalkote",
    "Badami",
    "Bilagi",
    "Hungund",
    "Jamkhandi",
    "Mudhol",
    "Ilkal",
    "Rabkavi Banhatti",
    "Guledgudda",
  ],

  Ballari: [
    "Ballari",
    "Kurugodu",
    "Kampli",
    "Sanduru",
    "Siruguppa",
  ],

  Belagavi: [
    "Belagavi",
    "Athani",
    "Bailhongal",
    "Chikodi",
    "Gokak",
    "Hukkeri",
    "Kagwad",
    "Khanapur",
    "Kittur",
    "Mudalagi",
    "Nippani",
    "Raibag",
    "Ramdurg",
    "Savadatti",
    "Yaragatti",
  ],

  "Bengaluru Rural": [
    "Devanahalli",
    "Doddaballapura",
    "Hoskote",
    "Nelamangala",
  ],

  "Bengaluru Urban": [
    "Anekal",
    "Bengaluru East",
    "Bengaluru North",
    "Bengaluru South",
    "Yelahanka",
  ],

  Bidar: [
    "Bidar",
    "Basavakalyan",
    "Bhalki",
    "Homnabad",
    "Aurad",
    "Chitgoppa",
    "Hulsur",
    "Kamalnagar",
  ],

  Chamarajanagara: [
    "Chamarajanagar",
    "Gundlupet",
    "Kollegal",
    "Hanur",
    "Yelandur",
  ],

  Chikkaballapura: [
    "Bagepalli",
    "Chelur",
    "Chikkaballapura",
    "Chintamani",
    "Gauribidanur",
    "Gudibanda",
    "Manchenahalli",
    "Sidlaghatta",
  ],

  Chikkamagaluru: [
    "Ajjampura",
    "Chikkamagaluru",
    "Kadur",
    "Kalasa",
    "Koppa",
    "Mudigere",
    "Narasimharajapura",
    "Sringeri",
    "Tarikere",
  ],

  Chitradurga: [
    "Chitradurga",
    "Challakere",
    "Hiriyur",
    "Hosadurga",
    "Holalkere",
    "Molakalmuru",
  ],

  "Dakshina Kannada": [
    "Mangaluru",
    "Bantwal",
    "Belthangady",
    "Kadaba",
    "Moodbidri",
    "Mulki",
    "Puttur",
    "Sullia",
    "Ullal",
  ],

  Davanagere: [
    "Davanagere",
    "Channagiri",
    "Harihar",
    "Honnali",
    "Jagalur",
    "Harapanahalli",
    "Nyamathi",
  ],

  Dharwad: [
    "Dharwad",
    "Hubballi",
    "Kalghatgi",
    "Kundgol",
    "Navalgund",
    "Alnavar",
    "Annigeri",
  ],

  Gadag: [
    "Gadag",
    "Mundargi",
    "Nargund",
    "Ron",
    "Shirhatti",
    "Gajendragad",
    "Lakshmeshwar",
  ],

  Hassan: [
    "Hassan",
    "Alur",
    "Arkalgud",
    "Arsikere",
    "Belur",
    "Channarayapatna",
    "Holenarasipura",
    "Sakleshpur",
  ],

  Haveri: [
    "Haveri",
    "Byadgi",
    "Hangal",
    "Hirekerur",
    "Ranebennur",
    "Savanur",
    "Shiggaon",
    "Rattihalli",
  ],

  Kalaburagi: [
    "Kalaburagi",
    "Afzalpur",
    "Aland",
    "Chincholi",
    "Chittapur",
    "Jevargi",
    "Sedam",
    "Shahabad",
    "Wadi",
    "Yadrami",
  ],

  Kodagu: [
    "Madikeri",
    "Somwarpet",
    "Virajpet",
    "Ponnampet",
    "Kushalnagar",
  ],

  Kolar: [
    "Kolar",
    "Bangarapet",
    "Malur",
    "Mulbagal",
    "Srinivaspur",
    "KGF",
  ],

  Koppal: [
    "Koppal",
    "Gangavathi",
    "Kanakagiri",
    "Kuknoor",
    "Kushtagi",
    "Yelburga",
    "Karategi",
  ],

  Mandya: [
    "Mandya",
    "Maddur",
    "Malavalli",
    "Krishnarajpet",
    "Nagamangala",
    "Pandavapura",
    "Srirangapatna",
  ],

  Mysuru: [
    "Mysuru",
    "Hunsur",
    "H.D. Kote",
    "K.R. Nagar",
    "Nanjangud",
    "Periyapatna",
    "Saragur",
    "T. Narasipura",
  ],

  Raichur: [
    "Raichur",
    "Devadurga",
    "Lingsugur",
    "Manvi",
    "Maski",
    "Sindhanur",
    "Sirwar",
    "Mudgal",
  ],

  Ramanagara: [
    "Ramanagara",
    "Channapatna",
    "Kanakapura",
    "Magadi",
    "Harohalli",
  ],

  Shivamogga: [
    "Shivamogga",
    "Bhadravati",
    "Hosanagara",
    "Sagara",
    "Shikaripura",
    "Soraba",
    "Thirthahalli",
  ],

  Tumakuru: [
    "Tumakuru",
    "Chikkanayakanahalli",
    "Gubbi",
    "Koratagere",
    "Kunigal",
    "Madhugiri",
    "Pavagada",
    "Sira",
    "Tiptur",
    "Turuvekere",
  ],

  Udupi: [
    "Udupi",
    "Brahmavar",
    "Byndoor",
    "Karkala",
    "Kaup",
    "Kundapura",
    "Hebri",
  ],

  "Uttara Kannada": [
    "Karwar",
    "Ankola",
    "Bhatkal",
    "Dandeli",
    "Haliyal",
    "Honnavar",
    "Joida",
    "Kumta",
    "Mundgod",
    "Siddapur",
    "Sirsi",
    "Yellapur",
  ],

  Vijayapura: [
    "Vijayapura",
    "Basavana Bagewadi",
    "Indi",
    "Muddebihal",
    "Sindagi",
    "Babaleshwar",
    "Chadchan",
    "Devar Hipparagi",
    "Talikoti",
  ],

  Vijayanagara: [
    "Hosapete",
    "Harapanahalli",
    "Hoovina Hadagali",
    "Kudligi",
    "Hagaribommanahalli",
    "Kottur",
  ],

  Yadgir: [
    "Yadgir",
    "Shahapur",
    "Shorapur",
    "Gurmitkal",
    "Hunasagi",
    "Vadagera",
  ],
};

export default karnatakaLocations;