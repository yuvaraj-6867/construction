import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'dashboard': 'Dashboard',
    'projects': 'Projects',
    'workers': 'Workers',
    'attendance': 'Attendance',
    'payments': 'Payments',
    'materials': 'Materials',
    'expenses': 'Expenses',
    'client_advances': 'Client Advances',
    'invoices': 'Invoices',
    'settings': 'Settings',
    'logout': 'Logout',

    // Dashboard
    'active_projects': 'Active Projects',
    'total_workers': 'Total Workers',
    'monthly_expenses': 'Monthly Expenses',
    'pending_payments': 'Pending Payments',
    'quick_actions': 'Quick Actions',
    'new_project': 'New Project',
    'mark_attendance': 'Mark Attendance',
    'record_payment': 'Record Payment',
    'add_expense': 'Add Expense',
    'modules': 'Modules',
    'recent_projects': 'Recent Projects',
    'today_attendance': "Today's Attendance",
    'present': 'Present',
    'absent': 'Absent',

    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'view': 'View',
    'back': 'Back',
    'submit': 'Submit',
    'loading': 'Loading...',
    'search': 'Search',
    'filter': 'Filter',
    'add': 'Add',
    'create': 'Create',
    'update': 'Update',

    // Forms
    'name': 'Name',
    'email': 'Email',
    'password': 'Password',
    'phone': 'Phone',
    'address': 'Address',
    'date': 'Date',
    'amount': 'Amount',
    'status': 'Status',
    'description': 'Description',
    'notes': 'Notes',

    // Project
    'project_name': 'Project Name',
    'client_name': 'Client Name',
    'location': 'Location',
    'budget': 'Budget',
    'start_date': 'Start Date',
    'end_date': 'End Date',
    'project_status': 'Project Status',
    'planning': 'Planning',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'on_hold': 'On Hold',

    // Worker
    'worker_name': 'Worker Name',
    'role': 'Role',
    'daily_wage': 'Daily Wage',
    'advance_given': 'Advance Given',
    'balance_due': 'Balance Due',
    'total_wages': 'Total Wages Earned',

    // Attendance
    'full': 'Full',
    'half_day': 'Half Day',

    // Settings
    'language_settings': 'Language Settings',
    'select_language': 'Select Language',
    'english': 'English',
    'tamil': 'Tamil',
    'change_language': 'Change Language',
    'language_changed': 'Language changed successfully!',
  },
  ta: {
    // Navigation
    'dashboard': 'டாஷ்போர்டு',
    'projects': 'திட்டங்கள்',
    'workers': 'தொழிலாளர்கள்',
    'attendance': 'வருகை',
    'payments': 'பணம் செலுத்துதல்',
    'materials': 'பொருட்கள்',
    'expenses': 'செலவுகள்',
    'client_advances': 'வாடிக்கையாளர் முன்பணம்',
    'invoices': 'விலைப்பட்டியல்கள்',
    'settings': 'அமைப்புகள்',
    'logout': 'வெளியேறு',

    // Dashboard
    'active_projects': 'செயலில் உள்ள திட்டங்கள்',
    'total_workers': 'மொத்த தொழிலாளர்கள்',
    'monthly_expenses': 'மாதாந்திர செலவுகள்',
    'pending_payments': 'நிலுவையில் உள்ள கொடுப்பனவுகள்',
    'quick_actions': 'விரைவு செயல்கள்',
    'new_project': 'புதிய திட்டம்',
    'mark_attendance': 'வருகையை குறிக்கவும்',
    'record_payment': 'பணம் செலுத்து',
    'add_expense': 'செலவு சேர்க்கவும்',
    'modules': 'தொகுதிகள்',
    'recent_projects': 'சமீபத்திய திட்டங்கள்',
    'today_attendance': 'இன்றைய வருகை',
    'present': 'வந்தவர்கள்',
    'absent': 'இல்லாதவர்கள்',

    // Common
    'save': 'சேமி',
    'cancel': 'ரத்து செய்',
    'edit': 'திருத்து',
    'delete': 'நீக்கு',
    'view': 'பார்க்க',
    'back': 'பின்செல்',
    'submit': 'சமர்ப்பி',
    'loading': 'ஏற்றுகிறது...',
    'search': 'தேடு',
    'filter': 'வடிகட்டு',
    'add': 'சேர்',
    'create': 'உருவாக்கு',
    'update': 'புதுப்பி',

    // Forms
    'name': 'பெயர்',
    'email': 'மின்னஞ்சல்',
    'password': 'கடவுச்சொல்',
    'phone': 'தொலைபேசி',
    'address': 'முகவரி',
    'date': 'தேதி',
    'amount': 'தொகை',
    'status': 'நிலை',
    'description': 'விளக்கம்',
    'notes': 'குறிப்புகள்',

    // Project
    'project_name': 'திட்ட பெயர்',
    'client_name': 'வாடிக்கையாளர் பெயர்',
    'location': 'இடம்',
    'budget': 'பட்ஜெட்',
    'start_date': 'தொடக்க தேதி',
    'end_date': 'முடிவு தேதி',
    'project_status': 'திட்ட நிலை',
    'planning': 'திட்டமிடல்',
    'in_progress': 'செயலில்',
    'completed': 'முடிந்தது',
    'on_hold': 'இடைநிறுத்தம்',

    // Worker
    'worker_name': 'தொழிலாளி பெயர்',
    'role': 'பணி',
    'daily_wage': 'தினசரி கூலி',
    'advance_given': 'முன்பணம் கொடுத்தது',
    'balance_due': 'மீதமுள்ள தொகை',
    'total_wages': 'மொத்த கூலி சம்பாதித்தது',

    // Attendance
    'full': 'முழு நாள்',
    'half_day': 'அரை நாள்',

    // Settings
    'language_settings': 'மொழி அமைப்புகள்',
    'select_language': 'மொழியைத் தேர்ந்தெடுக்கவும்',
    'english': 'ஆங்கிலம்',
    'tamil': 'தமிழ்',
    'change_language': 'மொழியை மாற்று',
    'language_changed': 'மொழி வெற்றிகரமாக மாற்றப்பட்டது!',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ta') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
