
import React from "react";
import "../styles/searchBar.css";

interface SearchBarProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

function SearchBar({
  search,
  setSearch,
}: SearchBarProps){
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search Medicines, Wellness, Cosmetics..."
        value={search}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement>
        ) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;