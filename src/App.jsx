import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Account from "./components/Account";
import PageNotFound from "./pages/PageNotFound";
// import Collaborations from "./pages/Collaborations";
// import Cards from "./components/Cards";
import Modal from "./components/Modal";
import CollabsLayout from "./layouts/CollabsLayout";

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route
          index
          path="/account"
          element={
            <Account isMyProfile={true} url={"http://localhost:3000/me"} />
          }
        />
        <Route path="/collaborations" element={<CollabsLayout />}>
          <Route
            path={":id"}
            element={
              <Modal>
                <Account
                  isMyProfile={false}
                  url={"http://localhost:3000/collaborations"}
                />
              </Modal>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Route>
    )
  );
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;