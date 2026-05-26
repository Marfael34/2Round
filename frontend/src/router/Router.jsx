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
import Conversation from '../screens/Conversation'
import App from '../App'
import MyCustomised from '../screens/MyCustomised'
import FormMarket from '../screens/FormMarket'
import Resale from '../screens/Resale'
import Packs from '../screens/Packs'
import GuideSize from '../components/Guide/GuideSize'
import GuideStuff from '../components/Guide/GuideStuff'
import Advice from '../components/Guide/Advice'

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
                path: "/packs",
                element: <Packs />,
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
            }
        ]
    }
]);

export default Router;