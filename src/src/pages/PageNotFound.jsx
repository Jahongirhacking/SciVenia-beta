import { Link } from "react-router-dom";
import "./PageNotFound.css";

function PageNotFound() {
  return (
    <div className="not-found">
      <h1>404 ERROR</h1>
      <Link to="/account">My Account</Link>
    </div>
  );
}

export default PageNotFound;
