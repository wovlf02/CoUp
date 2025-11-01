import React from 'react';

const HeaderSearch = () => {
  return (
    <div className="header-search-container">
      <input
        type="text"
        placeholder="스터디 검색..."
        className="header-search-input"
      />
      <button className="header-search-button">검색</button>
    </div>
  );
};

export default HeaderSearch;
