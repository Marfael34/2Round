import { createBrowserRouter } from 'react-router'
import Home from '../screens/Home'
import Login from '../screens/Login'
import Register from '../screens/Register'
import MarketPlace from '../screens/MarketPlace'
import MyLocker from '../screens/MyLocker'
import Guide from '../screens/Guide'
import ProductDetail from '../components/Product/ProductDetail'
import Conversation from '../screens/Conversation'

const Router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/marketplace",
        element: <MarketPlace />,
    },
    {
        path: "/my-locker",
        element: <MyLocker />,
    },
    {
        path: "/guide",
        element: <Guide />,
    },
    {
        path: "/product/:id",
        element: <ProductDetail />,
    },
    {
        path: "/conversation/:id",
        element: <Conversation />,
    },
]);

export default Router;