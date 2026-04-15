import { Link } from "react-router-dom";
import { storeNavigationItems } from "./storeNavigation";

function StoreNavigation({ className = "store-nav", onNavigate }) {
  return (
    <nav className={className} aria-label="Store navigation">
      {storeNavigationItems.map((item) => (
        <Link key={item.to} to={item.to} onClick={onNavigate}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default StoreNavigation;
