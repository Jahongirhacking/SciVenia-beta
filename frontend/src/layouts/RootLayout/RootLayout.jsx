import { NavLink, Outlet } from "react-router-dom";
import "./RootLayout.css";

function RootLayout() {
  return (
    <>
      <nav className="nav">
        <h2 className="nav__logo">
          SciVenia<span>beta</span>
        </h2>
        <ul className="nav__list">
          <li className="nav__item">
            <NavLink to={`/account`}>My account</NavLink>
          </li>
          <li className="nav__item">
            <NavLink to={`/collaborations`}>Collaborations</NavLink>
          </li>
          <li className="nav__item">
            <NavLink to={`/graph/${localStorage.getItem("userID")}`}>
              Graph Visualization
            </NavLink>
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
