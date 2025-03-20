
import { useState } from 'react';

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void;
  defaultLanguage?: string;
}

const LanguageSelector = ({ onSelectLanguage, defaultLanguage = 'english' }: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  
  const languages = [
    { id: 'hindi', name: 'Hindi' },
    { id: 'bengali', name: 'Bengali' },
    { id: 'english', name: 'English' },
    { id: 'bhojpuri', name: 'Bhojpuri' },
    { id: 'punjabi', name: 'Punjabi' },
  ];
  
  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
    onSelectLanguage(languageId);
  };
  
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      {languages.map(language => (
        <button
          key={language.id}
          onClick={() => handleLanguageSelect(language.id)}
          className={`px-5 py-2 rounded-full border whitespace-nowrap text-sm ${
            selectedLanguage === language.id
              ? 'border-book-primary bg-book-primary/10 text-book-primary'
              : 'border-gray-300 text-gray-700 hover:border-gray-400'
          }`}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
