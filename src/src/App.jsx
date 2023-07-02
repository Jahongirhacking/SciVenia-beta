import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Account from "./components/Account";
import PageNotFound from "./pages/PageNotFound";
import Modal from "./components/Modal";
import CollabsLayout from "./layouts/CollabsLayout";
import GraphLayout from "./layouts/GraphLayout";

const baseUrl = "http://localhost:3000";
const userId = "scientist133";
localStorage.setItem("baseUrl", baseUrl);
localStorage.setItem("userId", userId);

const userUrl = `${baseUrl}/${userId}`;

function App() {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />}>
        <Route
          index
          path={"/account/:id"}
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
