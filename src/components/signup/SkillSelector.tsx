import React, { useState, useEffect, useRef, useCallback } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { skillService } from "../../services/skill.service";
import { PlusCircle, XCircle } from "lucide-react";

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillChange: (skills: string[]) => void;
  skillType: "learn" | "teach";
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkills,
  onSkillChange,
  skillType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSkills = useCallback(async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await skillService.getSkills(query);
      setSearchResults(response.data.skills.map((skill: any) => skill.name));
    } catch (err: any) {
      setError(err.message || "Failed to fetch skills");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSkills(searchTerm);
    }, 500); // 500ms debounce
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchSkills]);

  const handleSkillSelect = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    onSkillChange(newSkills);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleAddSkill = async () => {
    if (
      searchTerm.trim() === "" ||
      selectedSkills.includes(searchTerm.trim())
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await skillService.addSkill(searchTerm.trim());
      const newSkillName = response.data.skill.name;
      onSkillChange([...selectedSkills, newSkillName]);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err: any) {
      setError(err.message || "Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={`Search for skills to ${skillType}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 100)}
        className="w-full"
      />
      {showResults && (searchTerm.length > 0 || loading || error) && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {loading && <p className="p-2 text-gray-500">Searching...</p>}
          {error && <p className="p-2 text-red-500">{error}</p>}
          {!loading &&
            !error &&
            searchResults.length === 0 &&
            searchTerm.length > 0 && (
              <div className="p-2 text-gray-500 flex justify-between items-center">
                <span>No results found.</span>
                <Button onClick={handleAddSkill} variant="ghost" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" /> Add "{searchTerm}"
                </Button>
              </div>
            )}
          {!loading && !error && searchResults.length > 0 && (
            <ul>
              {searchResults.map((skill) => (
                <li
                  key={skill}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSkillSelect(skill)}
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {skill}
            <XCircle
              className="ml-2 h-4 w-4 cursor-pointer text-indigo-600 hover:text-indigo-800"
              onClick={() => handleSkillSelect(skill)}
            />
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;
