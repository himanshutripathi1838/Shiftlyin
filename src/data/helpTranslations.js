export const helpTranslations = {
  hinglish: {
    languageName: "Hinglish",
    support: "Shiftlyin support",
    heading: "Hum aapki kaise help kar sakte hain?",
    intro: "Account, jobs, shifts, attendance, chat aur safety ke answers ek jagah.",
    languageLabel: "Help language",
    searchLabel: "Search help",
    searchPlaceholder: "Example: GPS check-in, login, vacancy",
    quickLinks: {
      dashboard: "Dashboard",
      applications: "Applications",
      attendance: "Attendance",
      chat: "Chat",
      profile: "Edit profile",
      login: "Login help",
      register: "Create account"
    },
    noSectionMatch: "Is section mein matching answer nahi mila.",
    noAnswer: "Answer nahi mila",
    noAnswerHint: "Search ko short karein ya neeche problem report submit karein.",
    needMore: "Aur help chahiye?",
    reportHeading: "Problem report karein",
    reportIntro: "Technical issue, fake job, unsafe behaviour, payment ya account problem admin team ko bhejein.",
    problemType: "Problem type",
    jobId: "Job ID",
    optional: "optional",
    jobPlaceholder: "Related job ID",
    explain: "Problem explain karein",
    explainPlaceholder: "Kya hua aur aapko kis help ki zarurat hai?",
    submit: "Report submit karein",
    submitting: "Submit ho raha hai...",
    loginRequired: "Problem report submit karne ke liye login required hai.",
    loginButton: "Help ke liye login karein",
    success: "Aapki report Shiftlyin admin team ko submit ho gayi hai.",
    failure: "Report submit nahi ho saki. Dobara try karein.",
    reportTypes: {
      technical: "Technical issue",
      account: "Account problem",
      "fake-job": "Fake job",
      safety: "Safety concern",
      payment: "Payment concern",
      "user-behaviour": "User behaviour"
    },
    topics: [
      {
        title: "Account aur login",
        description: "Registration, password, profile verification aur account access.",
        questions: [
          ["Login error aa raha hai", "Email aur password carefully check karein. Registered email hi use karein."],
          ["Profile details kaise update karein?", "Header se Profile kholen, Edit profile select karein aur changes save karein."],
          ["Verification pending kyun hai?", "College ID ya business license admin review ke baad verified hota hai."]
        ]
      },
      {
        title: "Student help",
        description: "Jobs, applications, attendance, ratings aur work flow.",
        questions: [
          ["Job ke liye apply kaise karein?", "Active job open karke details check karein aur Apply now button use karein."],
          ["GPS check-in nahi ho raha", "Location permission on karein aur workplace ke 100 meters ke andar rahen."],
          ["Owner se chat kab hogi?", "Owner application accept karega tab job chat unlock hogi."]
        ]
      },
      {
        title: "Restaurant aur owner help",
        description: "Jobs post karein, vacancies, applicants, shifts aur attendance manage karein.",
        questions: [
          ["Shift timing kaise set karein?", "Post Job page par date aur 12-hour AM/PM time select karein."],
          ["Vacancy kaise kam hoti hai?", "Applicant accept hote hi vacancy auto-decrease hoti hai."],
          ["Business profile kaise edit karein?", "Profile page se business details, location aur photos update karein."]
        ]
      },
      {
        title: "Safety aur reports",
        description: "Fake jobs, payment concerns aur unsafe behaviour.",
        questions: [
          ["Fake job kaise report karein?", "Neeche report form mein Fake job select karke details submit karein."],
          ["Unsafe situation mein kya karein?", "Workplace chhod dein, trusted contact ko batayein aur emergency help lein."],
          ["Kya personal information share karni chahiye?", "OTP, password, bank PIN ya card details kabhi share na karein."]
        ]
      }
    ]
  },
  en: {
    languageName: "English",
    support: "Shiftlyin support",
    heading: "How can we help?",
    intro: "Find answers about accounts, jobs, shifts, attendance, chat, and safety.",
    languageLabel: "Help language",
    searchLabel: "Search help",
    searchPlaceholder: "Example: GPS check-in, login, vacancy",
    quickLinks: {
      dashboard: "Dashboard",
      applications: "Applications",
      attendance: "Attendance",
      chat: "Chat",
      profile: "Edit profile",
      login: "Login help",
      register: "Create account"
    },
    noSectionMatch: "No matching answer in this section.",
    noAnswer: "No answer found",
    noAnswerHint: "Try a shorter search or submit a problem report below.",
    needMore: "Need more help?",
    reportHeading: "Report a problem",
    reportIntro: "Send technical issues, fake jobs, safety, payment, or account concerns to the admin team.",
    problemType: "Problem type",
    jobId: "Job ID",
    optional: "optional",
    jobPlaceholder: "Related job ID",
    explain: "Explain the problem",
    explainPlaceholder: "What happened and what help do you need?",
    submit: "Submit report",
    submitting: "Submitting...",
    loginRequired: "You must log in to submit a problem report.",
    loginButton: "Log in to get help",
    success: "Your report has been submitted to the Shiftlyin admin team.",
    failure: "The report could not be submitted. Please try again.",
    reportTypes: {
      technical: "Technical issue",
      account: "Account problem",
      "fake-job": "Fake job",
      safety: "Safety concern",
      payment: "Payment concern",
      "user-behaviour": "User behaviour"
    },
    topics: [
      {
        title: "Account and login",
        description: "Registration, passwords, profile verification, and account access.",
        questions: [
          ["Why can I not log in?", "Check your email and password carefully and use the email registered with Shiftlyin."],
          ["How do I update my profile?", "Open Profile from the header, select Edit profile, and save your changes."],
          ["Why is verification pending?", "College IDs and business licenses are verified after an admin review."]
        ]
      },
      {
        title: "Student help",
        description: "Jobs, applications, attendance, ratings, and the work process.",
        questions: [
          ["How do I apply for a job?", "Open an active job, review its details, and select Apply now."],
          ["Why is GPS check-in not working?", "Enable location permission and remain within 100 meters of the workplace."],
          ["When can I chat with the owner?", "The job chat unlocks after the owner accepts your application."]
        ]
      },
      {
        title: "Restaurant and owner help",
        description: "Post jobs and manage vacancies, applicants, shifts, and attendance.",
        questions: [
          ["How do I set shift times?", "Select the date and 12-hour AM/PM time on the Post Job page."],
          ["How are vacancies reduced?", "A vacancy is automatically reduced whenever an applicant is accepted."],
          ["How do I edit the business profile?", "Use the Profile page to update business details, location, and photos."]
        ]
      },
      {
        title: "Safety and reports",
        description: "Fake jobs, payment concerns, and unsafe behaviour.",
        questions: [
          ["How do I report a fake job?", "Select Fake job in the report form below and submit the job details."],
          ["What should I do in an unsafe situation?", "Leave the workplace, contact someone you trust, and seek emergency help."],
          ["Should I share personal information?", "Never share passwords, OTPs, bank PINs, or card details."]
        ]
      }
    ]
  },
  hi: {
    languageName: "हिंदी",
    support: "Shiftlyin सहायता",
    heading: "हम आपकी कैसे सहायता कर सकते हैं?",
    intro: "खाता, नौकरी, शिफ्ट, उपस्थिति, चैट और सुरक्षा से जुड़े उत्तर एक ही जगह पाएं।",
    languageLabel: "सहायता की भाषा",
    searchLabel: "सहायता खोजें",
    searchPlaceholder: "उदाहरण: GPS चेक-इन, लॉगिन, रिक्तियां",
    quickLinks: {
      dashboard: "डैशबोर्ड",
      applications: "आवेदन",
      attendance: "उपस्थिति",
      chat: "चैट",
      profile: "प्रोफाइल संपादित करें",
      login: "लॉगिन सहायता",
      register: "खाता बनाएं"
    },
    noSectionMatch: "इस भाग में संबंधित उत्तर नहीं मिला।",
    noAnswer: "उत्तर नहीं मिला",
    noAnswerHint: "कम शब्दों में खोजें या नीचे समस्या रिपोर्ट भेजें।",
    needMore: "और सहायता चाहिए?",
    reportHeading: "समस्या की रिपोर्ट करें",
    reportIntro: "तकनीकी समस्या, नकली नौकरी, सुरक्षा, भुगतान या खाते की समस्या एडमिन टीम को भेजें।",
    problemType: "समस्या का प्रकार",
    jobId: "नौकरी ID",
    optional: "वैकल्पिक",
    jobPlaceholder: "संबंधित नौकरी ID",
    explain: "समस्या बताएं",
    explainPlaceholder: "क्या हुआ और आपको किस सहायता की आवश्यकता है?",
    submit: "रिपोर्ट भेजें",
    submitting: "रिपोर्ट भेजी जा रही है...",
    loginRequired: "समस्या रिपोर्ट भेजने के लिए लॉगिन करना आवश्यक है।",
    loginButton: "सहायता के लिए लॉगिन करें",
    success: "आपकी रिपोर्ट Shiftlyin एडमिन टीम को भेज दी गई है।",
    failure: "रिपोर्ट नहीं भेजी जा सकी। कृपया दोबारा प्रयास करें।",
    reportTypes: {
      technical: "तकनीकी समस्या",
      account: "खाते की समस्या",
      "fake-job": "नकली नौकरी",
      safety: "सुरक्षा संबंधी चिंता",
      payment: "भुगतान संबंधी चिंता",
      "user-behaviour": "उपयोगकर्ता का व्यवहार"
    },
    topics: [
      {
        title: "खाता और लॉगिन",
        description: "पंजीकरण, पासवर्ड, प्रोफाइल सत्यापन और खाते की पहुंच।",
        questions: [
          ["लॉगिन क्यों नहीं हो रहा?", "ईमेल और पासवर्ड ध्यान से जांचें और पंजीकृत ईमेल का उपयोग करें।"],
          ["प्रोफाइल कैसे अपडेट करें?", "हेडर से प्रोफाइल खोलें, प्रोफाइल संपादित करें चुनें और बदलाव सेव करें।"],
          ["सत्यापन लंबित क्यों है?", "कॉलेज ID या बिजनेस लाइसेंस एडमिन की जांच के बाद सत्यापित होता है।"]
        ]
      },
      {
        title: "छात्र सहायता",
        description: "नौकरियां, आवेदन, उपस्थिति, रेटिंग और काम की प्रक्रिया।",
        questions: [
          ["नौकरी के लिए आवेदन कैसे करें?", "सक्रिय नौकरी खोलें, जानकारी देखें और अभी आवेदन करें चुनें।"],
          ["GPS चेक-इन क्यों नहीं हो रहा?", "लोकेशन अनुमति चालू करें और कार्यस्थल के 100 मीटर के अंदर रहें।"],
          ["मालिक से चैट कब कर सकते हैं?", "मालिक द्वारा आवेदन स्वीकार करने के बाद चैट खुलती है।"]
        ]
      },
      {
        title: "रेस्टोरेंट और मालिक सहायता",
        description: "नौकरी पोस्ट करें और रिक्तियां, आवेदक, शिफ्ट तथा उपस्थिति संभालें।",
        questions: [
          ["शिफ्ट का समय कैसे तय करें?", "नौकरी पोस्ट पेज पर तारीख और 12 घंटे वाला AM/PM समय चुनें।"],
          ["रिक्तियां कैसे कम होती हैं?", "आवेदक स्वीकार होते ही रिक्ति अपने आप कम हो जाती है।"],
          ["बिजनेस प्रोफाइल कैसे बदलें?", "प्रोफाइल पेज से बिजनेस जानकारी, स्थान और फोटो अपडेट करें।"]
        ]
      },
      {
        title: "सुरक्षा और रिपोर्ट",
        description: "नकली नौकरी, भुगतान और असुरक्षित व्यवहार से संबंधित सहायता।",
        questions: [
          ["नकली नौकरी की रिपोर्ट कैसे करें?", "नीचे रिपोर्ट फॉर्म में नकली नौकरी चुनकर जानकारी भेजें।"],
          ["असुरक्षित स्थिति में क्या करें?", "कार्यस्थल छोड़ें, किसी विश्वसनीय व्यक्ति को बताएं और आपातकालीन सहायता लें।"],
          ["क्या निजी जानकारी साझा करनी चाहिए?", "पासवर्ड, OTP, बैंक PIN या कार्ड की जानकारी कभी साझा न करें।"]
        ]
      }
    ]
  }
};
