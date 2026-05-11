import { createBrowserRouter } from 'react-router'
import Home from '../screens/Home'
import Login from '../screens/Login'
import Register from '../screens/Register'
import MarketPlace from '../screens/MarketPlace'
import MyLocker from '../screens/MyLocker'
import Guide from '../screens/Guide'
import ProductDetail from '../components/Product/ProductDetail'
import Conversation from '../screens/Conversation'
import App from '../App'
import MyCustomised from '../screens/MyCustomised'

const Router = createBrowserRouter([
    {
        element: <App/>, // élément qui sera retourné sur toutes les vue
        children: [
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
            {
                path: "/myCustomised",
                element: <MyCustomised />,
            }
        ]
    }
]);

export default Router;