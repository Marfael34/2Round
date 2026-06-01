import { createBrowserRouter } from 'react-router'
import Home from '../screens/Home'
import Login from '../screens/Login'
import Register from '../screens/Register'
import MarketPlace from '../screens/MarketPlace'
import MyLocker from '../screens/MyLocker'
import Guide from '../screens/Guide'
import ProductDetail from '../components/Product/ProductDetail'
import WalletScreen from '../screens/WalletScreen'
import InvoicesScreen from '../screens/InvoicesScreen'
import InvoiceView from '../screens/InvoiceView'
import Conversation from '../screens/Conversation'
import App from '../App'
import MyCustomised from '../screens/MyCustomised'
import FormMarket from '../screens/FormMarket'
import Resale from '../screens/Resale'
import GuideSize from '../components/Guide/GuideSize'
import GuideStuff from '../components/Guide/GuideStuff'
import Advice from '../components/Guide/Advice'
import AdminRoute from './Admin/AdminRoute'
import AdminDashboard from '../screens/AdminDashboard'
import EditProfile from '../components/Profile/EditProfile'

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
                path: "/my-locker/:id",
                element: <MyLocker />,
            },
            {
                path: "/guide",
                element: <Guide />,
            },
            {
                path: "/profile/edit",
                element: <EditProfile />,
            },
            {
                path: "/product/:id",
                element: <ProductDetail />,
            },
            {
                path: "/invoice/:id",
                element: <InvoiceView />,
            },
            {
                path: "/conversation",
                element: <Conversation />,
            },
            {
                path: "/mycustomised",
                element: <MyCustomised />,
            },
            {
                path: "/formarket",
                element: <FormMarket />,
            },
            {
                path: "/resale",
                element: <Resale />,
            },
            {
                path: "/guidesize",
                element: <GuideSize />,
            },
            {
                path: "/guidestuff",
                element: <GuideStuff />,
            },
            {
                path: "/guideadvice",
                element: <Advice />,
            },
            {
                path: "/wallet",
                element: <WalletScreen />,
            },
            {
                path: "/invoices",
                element: <InvoicesScreen />,
            },
            {
                path: "/admin/dashboard",
                element: (
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                ),
            }
        ]
    }
]);

export default Router;