import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { securedFetch } from "../utils/api";
import { API_URL } from "../constants/apiConstante";
import {
  FaPaperPlane,
  FaTag,
  FaCheck,
  FaXmark,
  FaInbox,
  FaUser,
  FaArrowLeft,
  FaCreditCard,
  FaTruck,
  FaShieldHalved,
  FaCircleNotch,
  FaCircleCheck,
  FaRotateRight,
} from "react-icons/fa6";

const Conversation = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetProductId = searchParams.get("productId");
  const initOfferParam = searchParams.get("initOffer");
  const initCheckoutParam = searchParams.get("checkout");
  const paymentSuccessParam = searchParams.get("paymentSuccess");
  const paymentCancelledParam = searchParams.get("paymentCancelled");
  const paymentConvId = searchParams.get("conversationId");
  const paymentAmountParam = searchParams.get("amount");

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);

  // Counter Offer Modal State
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterError, setCounterError] = useState("");
  const [sendingCounter, setSendingCounter] = useState(false);
  const [activeOfferToCounter, setActiveOfferToCounter] = useState(null);

  // Stripe Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("form"); // 'form', 'loading', 'success'
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    street: "",
    city: "",
    zip: "",
    country: "France",
  });
  const [selectedRelay, setSelectedRelay] = useState(
    "Mondial Relay - Epicerie du Rond-Point",
  );
  const [transactionRef, setTransactionRef] = useState("");
  const [autoCheckout, setAutoCheckout] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Helper: Decode JWT
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Helper: Get product image
  const getProductImage = (prod) => {
    if (!prod) return null;
    if (prod.image) return prod.image;
    if (Array.isArray(prod.images) && prod.images.length > 0) {
      const firstImg = prod.images[0];
      if (firstImg && typeof firstImg === "object" && firstImg.path) {
        return firstImg.path;
      }
    }
    return null;
  };

  // 1. Fetch Current User
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login?expired=1");
        return;
      }

      const payload = decodeToken(token);
      const email = payload?.username;
      if (!email) {
        navigate("/login?expired=1");
        return;
      }

      try {
        const res = await securedFetch(
          `${API_URL}/users?email=${encodeURIComponent(email)}`,
        );
        if (!res.ok) throw new Error("Impossible de charger votre profil.");
        const data = await res.json();
        const userObj = data.member
          ? data.member[0]
          : data["hydra:member"]
            ? data["hydra:member"][0]
            : Array.isArray(data)
              ? data[0]
              : data;
        if (!userObj) throw new Error("Utilisateur introuvable.");

        setCurrentUser(userObj);
        setShippingAddress({
          name:
            `${userObj.firstname || ""} ${userObj.lastname || ""}`.trim() ||
            "Jean Dupont",
          street: "12 Rue de la Paix",
          city: "Paris",
          zip: "75002",
          country: "France",
        });
      } catch (err) {
        console.error(err);
        setError("Erreur d'authentification.");
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 2. Fetch Conversations list
  const fetchConversationsList = async (userObj) => {
    try {
      const res = await securedFetch(`${API_URL}/conversations`);
      if (!res.ok) throw new Error("Erreur de chargement des conversations.");
      const data = await res.json();
      const allConvs = data.member || data["hydra:member"] || data || [];

      // Filter conversations where user is buyer or seller
      const myConvs = allConvs.filter((c) => {
        const bId = c.buyer?.id || c.buyer?.split("/").pop();
        const sId = c.seller?.id || c.seller?.split("/").pop();
        return Number(bId) === userObj.id || Number(sId) === userObj.id;
      });

      // Sort by last update/createdAt desc
      myConvs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setConversations(myConvs);
      return myConvs;
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les conversations.");
      return [];
    }
  };

  // 3. Main Init: Load conversations and check searchParams referrals
  useEffect(() => {
    if (!currentUser) return;

    const initConversations = async () => {
      setLoading(true);
      const myConvs = await fetchConversationsList(currentUser);

      // Handle referral (?productId=X)
      if (targetProductId) {
        // First check if conversation already exists
        const existingConv = myConvs.find((c) => {
          const prodId = c.product?.id || c.product?.split("/").pop();
          const buyerId = c.buyer?.id || c.buyer?.split("/").pop();
          return (
            Number(prodId) === Number(targetProductId) &&
            Number(buyerId) === currentUser.id
          );
        });

        if (existingConv) {
          setActiveConversation(existingConv);
          if (initOfferParam === "true") {
            setShowOfferModal(true);
          }
          if (initCheckoutParam === "true") {
            setAutoCheckout(true);
          }
          // Clear query params to avoid re-triggering creation
          setSearchParams({});
          setLoading(false);
        } else {
          // Fetch the product to identify the seller
          try {
            const prodRes = await securedFetch(
              `${API_URL}/products/${targetProductId}`,
            );
            if (!prodRes.ok) throw new Error("Produit introuvable.");
            const productData = await prodRes.json();

            const sellerIri = productData.seller?.["@id"] || productData.seller;
            const sellerId =
              productData.seller?.id || sellerIri?.split("/").pop();

            if (Number(sellerId) === currentUser.id) {
              alert("Vous ne pouvez pas négocier avec vous-même !");
              setSearchParams({});
              setLoading(false);
              return;
            }

            // Create new conversation
            const newConvRes = await securedFetch(`${API_URL}/conversations`, {
              method: "POST",
              headers: { "Content-Type": "application/ld+json" },
              body: JSON.stringify({
                buyer: `/api/users/${currentUser.id}`,
                seller: sellerIri || `/api/users/${sellerId}`,
                product: `/api/products/${targetProductId}`,
                createdAt: new Date().toISOString(),
              }),
            });

            if (!newConvRes.ok)
              throw new Error("Erreur de création de la conversation.");
            const newConv = await newConvRes.json();

            // Refresh conversations list
            const refreshed = await fetchConversationsList(currentUser);
            const addedConv =
              refreshed.find((c) => c.id === newConv.id) || newConv;

            setActiveConversation(addedConv);
            if (initOfferParam === "true") {
              setShowOfferModal(true);
            }
            if (initCheckoutParam === "true") {
              setAutoCheckout(true);
            }
            setSearchParams({});
          } catch (err) {
            console.error(err);
            alert("Erreur lors de la soumission de l'offre.");
            setSearchParams({});
          } finally {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    initConversations();
  }, [
    currentUser,
    targetProductId,
    initOfferParam,
    initCheckoutParam,
    setSearchParams,
  ]);

  // 4. Fetch messages of active conversation
  const fetchActiveMessages = async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) {
      Promise.resolve().then(() => setLoadingMessages(true));
    }

    try {
      const res = await securedFetch(
        `${API_URL}/messages?conversation=${convId}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      const list = data.member || data["hydra:member"] || data || [];
      // Sort messages by date asc
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(list);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Handle active conversation changes & Setup polling
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (!activeConversation) return;

    const timer = setTimeout(() => {
      fetchActiveMessages(activeConversation.id);
    }, 0);

    // Poll messages every 4 seconds for a dynamic feel
    pollIntervalRef.current = setInterval(() => {
      fetchActiveMessages(activeConversation.id, true);
    }, 4005);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setMessages([]);
    };
  }, [activeConversation]);

  // Auto-scroll désactivé

  // Handle auto-checkout parameter referral from Product Detail page
  useEffect(() => {
    if (autoCheckout && activeConversation) {
      const accepted = [...messages]
        .reverse()
        .find((m) => m.offer && m.offer.status === "accepted");
      const priceToUse = accepted
        ? parseFloat(accepted.offer.amount)
        : parseFloat(activeConversation.product?.price || 0);
      Promise.resolve().then(() => {
        setCheckoutAmount(priceToUse);
        setCheckoutStep("form");
        setShowCheckoutModal(true);
        setAutoCheckout(false);
      });
    }
  }, [messages, autoCheckout, activeConversation]);

  // 5. Send message handler
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;

    const messageText = newMessage;
    setNewMessage("");

    try {
      const res = await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          content: messageText,
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUser.id}`,
          conversation: `/api/conversations/${activeConversation.id}`,
        }),
      });

      if (!res.ok) throw new Error();
      fetchActiveMessages(activeConversation.id, true);
    } catch {
      alert("Erreur lors de l'envoi du message.");
    }
  };

  // 6. Submit offer handler (Buyer makes an offer)
  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    const amount = parseInt(offerAmount);
    if (isNaN(amount) || amount <= 0 || !activeConversation || !currentUser)
      return;

    const originalPrice = parseFloat(activeConversation.product?.price || 0);
    const minOffer = originalPrice * 0.6;

    if (amount < minOffer) {
      setOfferError(
        `Votre offre doit être d'au moins 60% du prix d'origine (soit ${minOffer.toFixed(0)}€).`,
      );
      return;
    }
    if (amount >= originalPrice) {
      setOfferError(
        `Votre offre doit être inférieure au prix initial (soit ${originalPrice.toFixed(0)}€).`,
      );
      return;
    }

    setSendingOffer(true);
    try {
      // 1. Create Offer
      const offerRes = await securedFetch(`${API_URL}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          amount: amount,
          status: "pending",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!offerRes.ok) throw new Error("Erreur de création de l'offre");
      const offerData = await offerRes.json();

      // 2. Create message referencing the offer
      const msgRes = await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          content: `Propose une offre de prix à ${amount}€`,
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUser.id}`,
          conversation: `/api/conversations/${activeConversation.id}`,
          offer: offerData["@id"] || `/api/offers/${offerData.id}`,
        }),
      });

      if (!msgRes.ok) throw new Error("Erreur d'envoi du message d'offre");

      setShowOfferModal(false);
      setOfferAmount("");
      setOfferError("");
      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la soumission de l'offre.");
    } finally {
      setSendingOffer(false);
    }
  };

  // 7. Submit Counter Offer handler (Seller or Buyer counterproposes)
  const handleSubmitCounterOffer = async (e) => {
    e.preventDefault();
    const amount = parseInt(counterAmount);
    if (
      isNaN(amount) ||
      amount <= 0 ||
      !activeConversation ||
      !currentUser ||
      !activeOfferToCounter
    )
      return;

    const originalPrice = parseFloat(activeConversation.product?.price || 0);
    const minOffer = originalPrice * 0.6;

    if (amount < minOffer) {
      setCounterError(
        `Votre contre-proposition doit être d'au moins 60% du prix d'origine (soit ${minOffer.toFixed(0)}€).`,
      );
      return;
    }
    if (amount >= originalPrice) {
      setCounterError(
        `Votre contre-proposition doit être inférieure au prix initial (soit ${originalPrice.toFixed(0)}€).`,
      );
      return;
    }

    setSendingCounter(true);
    try {
      // 1. Decline previous offer
      const prevOfferId =
        activeOfferToCounter.id ||
        activeOfferToCounter["@id"]?.split("/").pop();
      await securedFetch(`${API_URL}/offers/${prevOfferId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({
          status: "declined",
        }),
      });

      // 2. Create new Counter Offer
      const offerRes = await securedFetch(`${API_URL}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          amount: amount,
          status: "pending",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!offerRes.ok)
        throw new Error("Erreur de création de la contre-proposition");
      const offerData = await offerRes.json();

      // 3. Create message referencing the offer
      const msgRes = await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          content: `Propose une contre-offre de prix à ${amount}€`,
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUser.id}`,
          conversation: `/api/conversations/${activeConversation.id}`,
          offer: offerData["@id"] || `/api/offers/${offerData.id}`,
        }),
      });

      if (!msgRes.ok)
        throw new Error("Erreur d'envoi de la contre-proposition");

      setShowCounterModal(false);
      setCounterAmount("");
      setCounterError("");
      setActiveOfferToCounter(null);
      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la soumission de la contre-proposition.");
    } finally {
      setSendingCounter(false);
    }
  };

  // 8. Accept/Decline Offer
  const handleUpdateOfferStatus = async (offerObj, newStatus) => {
    const offerId = offerObj.id || offerObj["@id"]?.split("/").pop();
    if (!offerId || !activeConversation || !currentUser) return;

    try {
      const res = await securedFetch(`${API_URL}/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error();

      // Send status notification message in chat
      const sysContent =
        newStatus === "accepted"
          ? `Offre de prix de ${offerObj.amount}€ acceptée !`
          : `Offre de prix de ${offerObj.amount}€ refusée.`;

      await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          content: sysContent,
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUser.id}`,
          conversation: `/api/conversations/${activeConversation.id}`,
        }),
      });

      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour le statut de l'offre.");
    }
  };

  // 9. Stripe Checkout - Redirect to Stripe
  const handleStripeCheckout = async () => {
    if (
      !shippingAddress.name ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.zip
    ) {
      alert("Veuillez remplir toutes les informations de livraison.");
      return;
    }

    setStripeLoading(true);
    try {
      const totalAmount = checkoutAmount + (0.7 + checkoutAmount * 0.05) + 2.88;
      const amountInCents = Math.round(totalAmount * 100);

      const res = await securedFetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: activeConversation.product?.title || 'Article 2Round',
          amount: amountInCents,
          conversationId: activeConversation.id,
          productId: activeConversation.product?.id,
          buyerId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur Stripe');
      }

      const { url } = await res.json();
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la redirection vers le paiement: ' + err.message);
    } finally {
      setStripeLoading(false);
    }
  };

  // 10. Handle Stripe return (payment success)
  useEffect(() => {
    if (!paymentSuccessParam || !currentUser || !paymentConvId) return;

    const handlePaymentReturn = async () => {
      // Find or activate the conversation
      const convs = await fetchConversationsList(currentUser);
      const conv = convs.find(c => c.id === Number(paymentConvId));
      if (conv) {
        setActiveConversation(conv);

        const paidAmount = paymentAmountParam ? (Number(paymentAmountParam) / 100).toFixed(2) : '0.00';

        // Send a system message in the chat that confirms the purchase
        await securedFetch(`${API_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/ld+json' },
          body: JSON.stringify({
            content: `L'article a été acheté ! Montant payé : ${paidAmount}€ — Paiement sécurisé via Stripe`,
            isRead: false,
            createdAt: new Date().toISOString(),
            users: `/api/users/${currentUser.id}`,
            conversation: `/api/conversations/${Number(paymentConvId)}`,
          }),
        });

        setTransactionRef('#TRX-' + Math.floor(100000 + Math.random() * 900000));
        setCheckoutAmount(Number(paidAmount));
        setCheckoutStep('success');
        setShowCheckoutModal(true);
        fetchActiveMessages(Number(paymentConvId), true);
      }

      // Clear params
      setSearchParams({});
    };

    handlePaymentReturn();
  }, [paymentSuccessParam, currentUser, paymentConvId, paymentAmountParam, setSearchParams]);

  // Handle Stripe payment cancellation
  useEffect(() => {
    if (!paymentCancelledParam) return;
    alert('Le paiement a été annulé.');
    setSearchParams({});
  }, [paymentCancelledParam, setSearchParams]);

  // Resolve other participant details
  const getParticipant = (conv) => {
    if (!conv || !currentUser) return {};
    const buyerId = conv.buyer?.id || conv.buyer?.split("/").pop();
    const isBuyer = Number(buyerId) === currentUser.id;
    return isBuyer ? conv.seller : conv.buyer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Chargement de vos messages...</p>
        </div>
      </div>
    );
  }

  // Active user role
  const activeBuyerId =
    activeConversation?.buyer?.id ||
    activeConversation?.buyer?.split("/").pop();
  const isBuyer =
    activeConversation &&
    currentUser &&
    Number(activeBuyerId) === currentUser.id;

  // Scan messages to check if product has already been sold
  const isProductSold = messages.some(
    (msg) => msg.content && msg.content.includes("L'article a été acheté"),
  );

  // Find the latest accepted offer, if any
  const acceptedOfferMessage = [...messages]
    .reverse()
    .find((m) => m.offer && m.offer.status === "accepted");
  const acceptedOffer = acceptedOfferMessage
    ? acceptedOfferMessage.offer
    : null;

  // Original product details
  const productPrice = parseFloat(activeConversation?.product?.price || 0);
  const activePrice = acceptedOffer
    ? parseFloat(acceptedOffer.amount)
    : productPrice;

  // Suggestion offers helper
  const getDiscountSuggestions = (price) => [
    { pct: "10%", val: Math.round(price * 0.9) },
    { pct: "15%", val: Math.round(price * 0.85) },
    { pct: "20%", val: Math.round(price * 0.8) },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-inter flex flex-col">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-6 flex-1 flex flex-col h-[calc(100vh-80px)]">
        {/* Page Title */}
        <h1 className="font-bebas text-4xl uppercase tracking-wider mb-6 pb-2 border-b border-white/10 shrink-0">
          Messagerie & Négociations
        </h1>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-500 p-4 mb-4 rounded-sm text-sm shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 flex border border-white/10 bg-[#070707] overflow-hidden rounded-sm relative">
          {/* 1. Conversations Sidebar (Hidden on mobile when conversation is active) */}
          <div
            className={`w-full md:w-1/3 border-r border-white/10 flex flex-col shrink-0 ${activeConversation ? "hidden md:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-white/10 bg-black/40">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Discussions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {conversations.length > 0 ? (
                conversations.map((conv) => {
                  const otherUser = getParticipant(conv) || {};
                  const product = conv.product || {};
                  const img = getProductImage(product);
                  const isSelected = activeConversation?.id === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`p-4 flex gap-4 items-center cursor-pointer transition-all hover:bg-white/5 ${isSelected ? "bg-red-950/20 border-l-4 border-red-600" : ""}`}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {otherUser.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.pseudo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-gray-600" />
                        )}
                      </div>

                      {/* Info preview */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate uppercase tracking-wide">
                          {otherUser.pseudo || "Utilisateur"}
                        </h4>

                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {product.title || "Article"}
                        </p>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          Prix: {product.price}€
                        </span>
                      </div>

                      {/* Product Thumbnail */}
                      {img && (
                        <div className="w-10 h-10 border border-white/10 overflow-hidden rounded-sm shrink-0">
                          <img
                            src={img}
                            alt="mini"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-3">
                  <FaInbox className="text-3xl text-gray-700" />
                  <p>Aucune conversation en cours</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Active Chat Area */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${!activeConversation ? "hidden md:flex justify-center items-center p-8 text-center" : "flex"}`}
          >
            {activeConversation ? (
              <>
                {/* Vinted-style Product Header details */}
                <div className="p-4 border-b border-white/10 bg-neutral-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Mobile Back Arrow */}
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden text-white/80 hover:text-white mr-1 text-xl"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="w-14 h-14 border border-white/10 overflow-hidden rounded-sm bg-[#111] shrink-0">
                      {getProductImage(activeConversation.product) ? (
                        <img
                          src={getProductImage(activeConversation.product)}
                          alt={activeConversation.product?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                          Pas d'image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-bebas text-xl uppercase tracking-wide truncate">
                          {activeConversation.product?.title}
                        </h3>
                        <span className="text-[10px] bg-white/10 text-gray-300 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          {activeConversation.product?.size || "Unique"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-light mt-0.5">
                        Vendeur :{" "}
                        <span className="font-semibold">
                          {getParticipant(activeConversation)?.pseudo}
                        </span>
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {acceptedOffer ? (
                          <>
                            <span className="text-xs text-gray-500 line-through">
                              {productPrice.toFixed(2)}€
                            </span>
                            <span className="text-sm font-bold text-green-500">
                              {acceptedOffer.amount.toFixed(2)}€ (Négocié)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-red-500">
                            {productPrice.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center items-center justify-end shrink-0">
                    {isProductSold ? (
                      <span className="bg-neutral-800 text-gray-500 text-xs font-bold px-4 py-2.5 rounded-sm uppercase tracking-widest border border-white/5">
                        Article Vendu
                      </span>
                    ) : isBuyer ? (
                      <>
                        <button
                          onClick={() => {
                            setCheckoutAmount(activePrice);
                            setCheckoutStep("form");
                            setShowCheckoutModal(true);
                          }}
                          className="flex-1 sm:flex-initial bg-white hover:bg-gray-200 text-black font-bold py-2.5 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer text-center"
                        >
                          Acheter
                        </button>
                        <button
                          onClick={() => {
                            setOfferError("");
                            setShowOfferModal(true);
                          }}
                          className="flex-1 sm:flex-initial bg-transparent hover:bg-white/5 border border-white/30 text-white font-bold py-2.5 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer text-center"
                        >
                          Négocier
                        </button>
                      </>
                    ) : (
                      <span className="bg-red-950/20 text-red-400 text-xs font-bold px-4 py-2.5 rounded-sm uppercase tracking-widest border border-red-500/20">
                        Disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-transparent to-black/10">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const senderId =
                        msg.users?.id || msg.users?.split("/").pop();
                      const isMe = Number(senderId) === currentUser.id;

                      // Check if message contains an offer
                      if (msg.offer) {
                        const offerObj = msg.offer;
                        const isOfferSender = isMe;
                        const isOfferPending = offerObj.status === "pending";
                        const isOfferFromBuyer =
                          Number(senderId) === Number(activeBuyerId);

                        // Card style based on status
                        let cardBg = "bg-[#0f0f0f] border-white/10";
                        let badgeColor =
                          "bg-orange-600/10 border-orange-600 text-orange-500";
                        let badgeText = "Offre en cours";

                        if (offerObj.status === "accepted") {
                          cardBg = "bg-emerald-950/10 border-emerald-500/30";
                          badgeColor =
                            "bg-emerald-600/10 border-emerald-600 text-emerald-500";
                          badgeText = "Offre acceptée";
                        } else if (offerObj.status === "declined") {
                          cardBg = "bg-rose-950/10 border-rose-500/20";
                          badgeColor =
                            "bg-rose-600/10 border-rose-600 text-rose-500";
                          badgeText = "Offre déclinée";
                        }

                        return (
                          <div
                            key={msg.id}
                            className="w-full flex justify-center my-4"
                          >
                            <div
                              className={`w-full max-w-[380px] border rounded-md p-5 shadow-xl transition-all ${cardBg}`}
                            >
                              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/5">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <FaTag className="text-sm text-red-500" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {isOfferFromBuyer
                                      ? "Offre de l'acheteur"
                                      : "Contre-offre du vendeur"}
                                  </span>
                                </div>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-sm border ${badgeColor}`}
                                >
                                  {badgeText}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bebas tracking-wide text-white">
                                  {offerObj.amount}€
                                </span>
                                <span className="text-xs text-gray-500 font-light">
                                  au lieu de {productPrice}€
                                </span>
                              </div>

                              {/* Interactive controls inside the card */}
                              <div className="mt-5">
                                {isOfferPending ? (
                                  !isOfferSender ? (
                                    /* Receiver views controls */
                                    <div className="flex flex-col gap-2">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleUpdateOfferStatus(
                                              offerObj,
                                              "accepted",
                                            )
                                          }
                                          className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <FaCheck /> Accepter
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleUpdateOfferStatus(
                                              offerObj,
                                              "declined",
                                            )
                                          }
                                          className="flex-1 bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-bold py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                          <FaXmark /> Refuser
                                        </button>
                                      </div>

                                      <button
                                        onClick={() => {
                                          setActiveOfferToCounter(offerObj);
                                          setCounterAmount("");
                                          setCounterError("");
                                          setShowCounterModal(true);
                                        }}
                                        className="w-full bg-[#181818] hover:bg-[#222] border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <FaRotateRight /> Faire une
                                        contre-proposition
                                      </button>
                                    </div>
                                  ) : (
                                    /* Sender views waiting notice */
                                    <div className="flex items-center gap-2 text-xs text-gray-400 py-1.5">
                                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                                      <span>
                                        En attente de réponse de l'autre membre
                                      </span>
                                    </div>
                                  )
                                ) : offerObj.status === "accepted" ? (
                                  isBuyer ? (
                                    /* Accepted offer buy button */
                                    <button
                                      onClick={() => {
                                        setCheckoutAmount(offerObj.amount);
                                        setCheckoutStep("form");
                                        setShowCheckoutModal(true);
                                      }}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-3 rounded-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                      <FaCreditCard /> Finaliser l'achat -{" "}
                                      {offerObj.amount}€
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 block italic">
                                      En attente du paiement de l'acheteur.
                                    </span>
                                  )
                                ) : (
                                  /* Declined offer */
                                  isBuyer && (
                                    <button
                                      onClick={() => {
                                        setOfferError("");
                                        setShowOfferModal(true);
                                      }}
                                      className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-bold py-2.5 px-3 rounded-sm uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      Faire une nouvelle offre
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Check if message is a purchase notification
                      const isPurchaseMessage =
                        msg.content &&
                        msg.content.includes("L'article a été acheté");

                      if (isPurchaseMessage) {
                        return (
                          <div
                            key={msg.id}
                            className="w-full flex justify-center my-4"
                          >
                            <div className="w-full max-w-[420px] bg-emerald-950/10 border border-emerald-500/30 rounded-md p-6 text-center space-y-4 shadow-xl">
                              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto text-xl animate-bounce">
                                <FaCircleCheck />
                              </div>

                              <div>
                                <h4 className="font-bebas text-2xl tracking-wide uppercase text-white">
                                  Transaction Finalisée !
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                                  {isBuyer
                                    ? "Félicitations ! Vous avez acheté cet article. Le vendeur a reçu l'avis d'expédition et dispose de 5 jours ouvrés pour envoyer le colis."
                                    : "Félicitations ! Votre article a été acheté. Préparez le colis avec soin et expédiez-le rapidement au Point Relais."}
                                </p>
                              </div>

                              <div className="text-[10px] bg-white/5 border border-white/10 text-gray-300 py-1.5 px-3 rounded-sm inline-block uppercase tracking-wider font-bold">
                                Statut : En attente d'expédition
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Standard message bubble
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[75%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md whitespace-pre-wrap ${isMe ? "bg-red-600 text-white rounded-br-none" : "bg-neutral-800 border border-white/5 text-gray-200 rounded-bl-none"}`}
                          >
                            {msg.content}
                          </div>
                          {/* Time */}
                          <span className="text-[9px] text-gray-500 mt-1.5 uppercase tracking-wider px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs py-12">
                      Début de la conversation. Envoyez un message ou proposez
                      une offre.
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Controls */}
                <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col gap-3 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    {/* Offer button for buyer */}
                    {isBuyer && !isProductSold && (
                      <button
                        type="button"
                        onClick={() => {
                          setOfferAmount("");
                          setOfferError("");
                          setShowOfferModal(true);
                        }}
                        className="bg-[#151515] hover:bg-[#202020] border border-white/10 text-white w-12 h-12 flex items-center justify-center rounded-sm transition-all cursor-pointer shrink-0"
                        title="Proposer une offre de prix"
                      >
                        <FaTag className="text-red-500 text-lg" />
                      </button>
                    )}

                    <textarea
                      placeholder="Saisissez votre message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Auto-resize
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={(e) => {
                        // Sur PC: Entrée envoie, Shift+Entrée = retour à la ligne
                        // Sur mobile: Entrée = retour à la ligne (envoi via bouton)
                        const isMobile = 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches;
                        if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                          e.preventDefault();
                          if (newMessage.trim()) {
                            handleSendMessage(e);
                          }
                        }
                      }}
                      rows={1}
                      className="flex-1 bg-black border border-white/10 focus:border-red-600 outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors resize-none overflow-y-auto"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />

                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white w-12 h-12 flex items-center justify-center rounded-sm transition-all cursor-pointer shrink-0"
                    >
                      <FaPaperPlane className="text-sm" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FaInbox className="text-5xl text-gray-800" />
                <h3 className="font-bebas text-2xl uppercase tracking-wider">
                  Vos discussions
                </h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Sélectionnez une discussion à gauche pour négocier le prix ou
                  discuter avec un membre.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Offer Submission Modal (Buyer) */}
      {showOfferModal && activeConversation && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-lg p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowOfferModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FaXmark className="text-lg" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-red-500">
              <FaTag className="text-xl animate-pulse" />
              <h3 className="font-bebas text-3xl uppercase tracking-wider text-white">
                Faire une offre de prix
              </h3>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Proposez un prix d'achat alternatif au vendeur pour{" "}
              <span className="text-white font-bold">
                {activeConversation.product?.title}
              </span>
              . Le prix d'origine est de{" "}
              <span className="text-red-500 font-bold">{productPrice}€</span>.
            </p>

            {/* Quick Discount Recommendations */}
            <div className="mb-6">
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
                Contre-propositions rapides
              </span>
              <div className="flex gap-3">
                {getDiscountSuggestions(productPrice).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOfferAmount(sugg.val.toString());
                      setOfferError("");
                    }}
                    className="flex-1 bg-neutral-900 border border-white/10 hover:border-red-500/50 hover:bg-neutral-800 text-white font-bold py-2.5 px-3 rounded-md text-xs uppercase transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span className="text-red-400 font-bold">{sugg.pct}</span>
                    <span className="text-[10px] text-gray-400">
                      {sugg.val}€
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Votre proposition (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder={`Min. ${(productPrice * 0.6).toFixed(0)}€ (règle des 60%)`}
                    value={offerAmount}
                    onChange={(e) => {
                      setOfferAmount(e.target.value);
                      setOfferError("");
                    }}
                    className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-3.5 pr-10 text-white text-base transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    €
                  </span>
                </div>

                {offerError && (
                  <span className="text-red-500 text-[10px] mt-2 block leading-relaxed font-semibold">
                    {offerError}
                  </span>
                )}
                <span className="block text-[9px] text-gray-500 mt-2 italic">
                  Note: Par respect des règles anti-spam Vinted, vous ne pouvez
                  pas proposer une réduction supérieure à 40% du prix d'origine.
                </span>
              </div>

              <button
                type="submit"
                disabled={sendingOffer || !offerAmount}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 uppercase tracking-widest rounded-md text-xs transition-colors cursor-pointer"
              >
                {sendingOffer ? "Soumission..." : "Soumettre l'offre"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Counter Offer Submission Modal */}
      {showCounterModal && activeConversation && activeOfferToCounter && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/15 rounded-lg p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setShowCounterModal(false);
                setActiveOfferToCounter(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <FaXmark className="text-lg" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-orange-500">
              <FaRotateRight className="text-xl animate-spin-slow" />
              <h3 className="font-bebas text-3xl uppercase tracking-wider text-white">
                Faire une contre-proposition
              </h3>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              L'offre actuelle de l'autre membre est de{" "}
              <span className="text-white font-bold">
                {activeOfferToCounter.amount}€
              </span>
              . Proposez un prix intermédiaire pour l'article{" "}
              <span className="text-white font-bold">
                {activeConversation.product?.title}
              </span>{" "}
              (Prix initial:{" "}
              <span className="text-red-500 font-bold">{productPrice}€</span>).
            </p>

            {/* Quick Discount Recommendations */}
            <div className="mb-6">
              <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
                Valeurs suggérées
              </span>
              <div className="flex gap-3">
                {getDiscountSuggestions(productPrice).map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCounterAmount(sugg.val.toString());
                      setCounterError("");
                    }}
                    className="flex-1 bg-neutral-900 border border-white/10 hover:border-orange-500/50 hover:bg-neutral-800 text-white font-bold py-2.5 px-3 rounded-md text-xs uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span className="text-orange-400 font-bold">
                      {sugg.pct}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {sugg.val}€
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitCounterOffer} className="space-y-5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                  Votre contre-proposition (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder={`Ex: ${Math.round((productPrice + activeOfferToCounter.amount) / 2)}`}
                    value={counterAmount}
                    onChange={(e) => {
                      setCounterAmount(e.target.value);
                      setCounterError("");
                    }}
                    className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-3.5 pr-10 text-white text-base transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    €
                  </span>
                </div>

                {counterError && (
                  <span className="text-red-500 text-[10px] mt-2 block leading-relaxed font-semibold">
                    {counterError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={sendingCounter || !counterAmount}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3.5 uppercase tracking-widest rounded-md text-xs transition-colors cursor-pointer"
              >
                {sendingCounter
                  ? "Soumission..."
                  : "Envoyer la contre-proposition"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Vinted-style Secure Checkout/Payment Modal */}
      {showCheckoutModal && activeConversation && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0c0c0c] border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl relative my-8">
            {checkoutStep !== "loading" && (
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <FaXmark className="text-lg" />
              </button>
            )}

            {checkoutStep === "form" && (
              <>
                <div className="flex items-center gap-2.5 mb-6 text-emerald-500 pb-3 border-b border-white/10">
                  <FaShieldHalved className="text-2xl animate-pulse" />
                  <h3 className="font-bebas text-3xl uppercase tracking-wider text-white">
                    Paiement Sécurisé 2Round
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Item Recap Card */}
                  <div className="flex gap-4 p-3 bg-neutral-900/40 border border-white/5 rounded-md">
                    <div className="w-16 h-16 bg-[#151515] border border-white/10 rounded-sm overflow-hidden shrink-0">
                      {getProductImage(activeConversation.product) && (
                        <img
                          src={getProductImage(activeConversation.product)}
                          alt="Recap"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">
                        {activeConversation.product?.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">
                        Taille: {activeConversation.product?.size || "Unique"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Vendu par: {getParticipant(activeConversation)?.pseudo}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-2.5 text-xs text-gray-300">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                      Détails de la transaction
                    </span>
                    <div className="flex justify-between">
                      <span>Prix de l'article</span>
                      <span className="font-semibold text-white">
                        {acceptedOffer ? (
                          <>
                            <span className="line-through text-gray-500 mr-1.5">
                              {productPrice.toFixed(2)}€
                            </span>
                            <span className="text-green-500 font-bold">
                              {checkoutAmount.toFixed(2)}€
                            </span>
                          </>
                        ) : (
                          <span>{checkoutAmount.toFixed(2)}€</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        Frais de protection acheteur
                        <FaShieldHalved
                          className="text-[10px] text-emerald-500"
                          title="Garantie remboursement 2Round"
                        />
                      </span>
                      <span className="text-white">
                        {(0.7 + checkoutAmount * 0.05).toFixed(2)}€
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        Frais de port (Mondial Relay)
                        <FaTruck className="text-[10px] text-gray-400" />
                      </span>
                      <span className="text-white">2.88€</span>
                    </div>

                    <div className="h-px bg-white/10 my-3"></div>

                    <div className="flex justify-between text-base font-bold text-white uppercase tracking-wider">
                      <span>Total à payer</span>
                      <span className="text-red-500 text-lg">
                        {(
                          checkoutAmount +
                          (0.7 + checkoutAmount * 0.05) +
                          2.88
                        ).toFixed(2)}
                        €
                      </span>
                    </div>
                  </div>

                  {/* Delivery Location Selector */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      1. Point Relais Mondial Relay
                    </span>
                    <select
                      value={selectedRelay}
                      onChange={(e) => setSelectedRelay(e.target.value)}
                      className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-3 text-xs text-white"
                    >
                      <option value="Mondial Relay - Epicerie du Rond-Point">
                        Mondial Relay - Epicerie du Rond-Point (2 Rue de la
                        Marne, Paris)
                      </option>
                      <option value="Relais Colis - Tabac de la Place">
                        Relais Colis - Tabac de la Place (15 Place de la
                        République, Paris)
                      </option>
                      <option value="Mondial Relay - Supermarché U">
                        Mondial Relay - Supermarché U (88 Boulevard Sébastopol,
                        Paris)
                      </option>
                    </select>
                  </div>

                  {/* Delivery Address Details */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      2. Adresse de Facturation
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Nom & Prénom"
                          required
                          value={shippingAddress.name}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Rue"
                          required
                          value={shippingAddress.street}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              street: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Ville"
                          required
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              city: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Code Postal"
                          required
                          value={shippingAddress.zip}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              zip: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Pays"
                          required
                          value={shippingAddress.country}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              country: e.target.value,
                            })
                          }
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stripe Checkout Info */}
                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      3. Paiement Sécurisé
                    </span>
                    <div className="bg-neutral-900/60 border border-white/5 rounded-md p-4 flex items-center gap-3">
                      <FaShieldHalved className="text-emerald-500 text-xl shrink-0" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Vous allez être redirigé vers <span className="text-white font-bold">Stripe</span> pour
                        effectuer votre paiement de manière sécurisée. Vos données bancaires ne transitent
                        jamais par nos serveurs.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleStripeCheckout}
                    disabled={stripeLoading}
                    className="w-full bg-[#635BFF] hover:bg-[#5349e0] disabled:opacity-60 text-white font-bold py-4 uppercase tracking-widest rounded-md text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#635BFF]/20"
                  >
                    {stripeLoading ? (
                      <>
                        <FaCircleNotch className="animate-spin" /> Redirection vers Stripe...
                      </>
                    ) : (
                      <>
                        <FaCreditCard /> Payer avec Stripe —{" "}
                        {(
                          checkoutAmount +
                          (0.7 + checkoutAmount * 0.05) +
                          2.88
                        ).toFixed(2)}
                        €
                      </>
                    )}
                  </button>
                </div>
              </>
            )}


            {checkoutStep === "success" && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
                  <FaCircleCheck />
                </div>
                <div>
                  <h4 className="font-bebas text-4xl uppercase tracking-wider text-white">
                    Paiement Accepté !
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs mt-3 leading-relaxed">
                    Votre commande pour{" "}
                    <span className="text-white font-bold">
                      {activeConversation.product?.title}
                    </span>{" "}
                    a été validée avec succès.
                  </p>
                  <p className="text-xs text-gray-500 max-w-xs mt-2">
                    Le Point Relais sélectionné est : <br />
                    <span className="text-white font-medium">
                      {selectedRelay}
                    </span>
                  </p>
                </div>

                <div className="bg-neutral-900 border border-white/5 p-4 rounded-md w-full text-left space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    <span>Référence transaction</span>
                    <span className="text-white">{transactionRef}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    <span>Montant total débité</span>
                    <span className="text-emerald-400">
                      {(
                        checkoutAmount +
                        (0.7 + checkoutAmount * 0.05) +
                        2.88
                      ).toFixed(2)}
                      €
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3.5 uppercase tracking-widest rounded-md text-xs transition-colors cursor-pointer"
                >
                  Retourner au chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversation;
