import { NavLink, Outlet } from "react-router-dom";
import "./RootLayout.css";

const baseUrl = "http://localhost:3000";
const userId = "scientist133";
localStorage.setItem("baseUrl", baseUrl);
localStorage.setItem("userId", userId);

function RootLayout() {
  return (
    <>
      <nav className="nav">
        <h2 className="nav__logo">
          SciVenia<span>beta</span>
        </h2>
        <ul className="nav__list">
          <li className="nav__item">
            <NavLink to={`/account/${localStorage.getItem("userId")}`}>
              My account
            </NavLink>
          </li>
          <li className="nav__item">
            <NavLink to={`/collaborations`}>Collaborations</NavLink>
          </li>
          <li className="nav__item">
            <NavLink to={`/graph/${userId}`}>Graph Visualization</NavLink>
          </li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer>&copy; Innopolis University {new Date().getFullYear()}</footer>
    </>
  );
}

export default RootLayout;
