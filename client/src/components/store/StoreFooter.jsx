import { footerColumns } from "../../data/catalog";
import "./store.css";

function StoreFooter() {
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
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}

export default StoreFooter;
