import React from "react";
import { footerColumns } from "../../data/catalog";
import "./store.css";

function StoreFooter() {
  const handleComingSoonClick = (label) => {
    window.alert(`${label} 페이지는 준비 중입니다.`);
  };

  return (
    <footer className="store-footer">
      <div className="store-footer__brand">
        <span>Moon Atelier</span>
        <p>시대를 타지 않는 우아함을 바탕으로 구성한 컬렉션을 소개합니다.</p>
      </div>

      <div className="store-footer__links">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h4>{column.title}</h4>
            {column.links.map((link) => (
              <button key={link} type="button" onClick={() => handleComingSoonClick(link)}>
                {link}
              </button>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}

export default StoreFooter;
