import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout/RootLayout";
import Account from "./components/Account/Account";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Modal from "./components/Modal/Modal";
import CollabsLayout from "./layouts/CollabsLayout/CollabsLayout";
import GraphLayout from "./layouts/GraphLayout/GraphLayout";

const baseUrl = "http://37.77.104.19:3000";
const graphUrl = "http://37.77.104.19:8000";
const userID = "jUg1yFcAAAAJ";
localStorage.setItem("baseUrl", baseUrl);
localStorage.setItem("graphUrl", graphUrl);
localStorage.setItem("userID", userID);

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route
          index
          path={"/account"}
          element={<Account isMyProfile={true} />}
        />
        <Route path="collaborations" element={<CollabsLayout />}>
          <Route
            path={":id"}
            element={
              <Modal>
                <Account />
              </Modal>
            }
          />
        </Route>
        <Route path="/graph/:id" element={<GraphLayout />}>
          <Route
            path={"about"}
            element={
              <Modal>
                <Account />
              </Modal>
            }
          />
        </Route>
        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Route>,
    ),
  );
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
