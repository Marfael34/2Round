import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { IMG_BGRAYURE } from "../constants/appConstante";
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
  FaChevronLeft,
  FaCreditCard,
  FaTruck,
  FaShieldHalved,
  FaCircleNotch,
  FaCircleCheck,
  FaRotateRight,
  FaFlag,
  FaImage,
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
  const [currentOrder, setCurrentOrder] = useState(null); // AJOUT: Commande associée
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const creatingConvRef = useRef(null);
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
  const [checkoutStep, setCheckoutStep] = useState("form");
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

  // Address Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Image upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Refs
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

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
          name: `${userObj.firstname || ""} ${userObj.lastname || ""}`.trim(),
          street: "",
          city: "",
          zip: "",
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

  const fetchConversationsList = async (userObj) => {
    try {
      const res = await securedFetch(`${API_URL}/conversations`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Erreur de chargement des conversations.");
      const data = await res.json();
      const allConvs = data.member || data["hydra:member"] || data || [];

      const extractId = (val) => {
        if (!val) return null;
        if (typeof val === "object")
          return val.id || (val["@id"] ? val["@id"].split("/").pop() : null);
        if (typeof val === "string") return val.split("/").pop();
        return val;
      };

      const myConvs = allConvs.filter((c) => {
        const bId = extractId(c.buyer);
        const sId = extractId(c.seller);
        return Number(bId) === userObj.id || Number(sId) === userObj.id;
      });

      myConvs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setConversations(myConvs);
      return myConvs;
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les conversations.");
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const initConversations = async () => {
      setLoading(true);
      const myConvs = await fetchConversationsList(currentUser);

      if (targetProductId) {
        const extractId = (val) => {
          if (!val) return null;
          if (typeof val === "object")
            return val.id || (val["@id"] ? val["@id"].split("/").pop() : null);
          if (typeof val === "string") return val.split("/").pop();
          return val;
        };

        const existingConv = myConvs.find((c) => {
          const prodId = extractId(c.product);
          const buyerId = extractId(c.buyer);
          return (
            Number(prodId) === Number(targetProductId) &&
            Number(buyerId) === currentUser.id
          );
        });

        if (existingConv) {
          if (existingConv.isActive === false && (initOfferParam === "true" || initCheckoutParam === "true")) {
            try {
              await securedFetch(`${API_URL}/conversations/${existingConv.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/merge-patch+json" },
                body: JSON.stringify({ isActive: true })
              });
              existingConv.isActive = true;
            } catch(e) {
              console.error("Failed to reactivate conversation", e);
            }
          }
          setActiveConversation(existingConv);
          if (initOfferParam === "true") setShowOfferModal(true);
          if (initCheckoutParam === "true") setAutoCheckout(true);
          setSearchParams({});
          setLoading(false);
        } else {
          if (creatingConvRef.current === targetProductId) return;
          creatingConvRef.current = targetProductId;

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
              creatingConvRef.current = null;
              return;
            }

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
            const refreshed = await fetchConversationsList(currentUser);
            const addedConv =
              refreshed.find((c) => c.id === newConv.id) || newConv;

            setActiveConversation(addedConv);
            if (initOfferParam === "true") setShowOfferModal(true);
            if (initCheckoutParam === "true") setAutoCheckout(true);
            setSearchParams({});
          } catch (err) {
            console.error(err);
            alert("Erreur lors de la soumission de l'offre.");
            setSearchParams({});
          } finally {
            creatingConvRef.current = null;
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

  const fetchActiveMessages = async (convId, silent = false) => {
    if (!convId) return;
    if (!silent) Promise.resolve().then(() => setLoadingMessages(true));

    try {
      const res = await securedFetch(
        `${API_URL}/messages?conversation=${convId}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list = data.member || data["hydra:member"] || data || [];
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(list);

      const extractLocalId = (val) => {
        if (!val) return null;
        if (typeof val === "object")
          return val.id || (val["@id"] ? val["@id"].split("/").pop() : null);
        if (typeof val === "string") return val.split("/").pop();
        return val;
      };

      const unreadIds = list
        .filter(
          (m) =>
            !m.isRead && Number(extractLocalId(m.users)) !== currentUser?.id,
        )
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        securedFetch(`${API_URL}/conversations/${convId}/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => {
            if (!res.ok) console.error("Failed to mark messages as read");
            else {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === convId && c.messages) {
                    const updatedMessages = c.messages.map((m) =>
                      unreadIds.includes(m.id) ? { ...m, isRead: true } : m,
                    );
                    return { ...c, messages: updatedMessages };
                  }
                  return c;
                }),
              );
            }
          })
          .catch((err) => console.error("Error calling mark-read", err));
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (!activeConversation) return;

    const timer = setTimeout(() => {
      fetchActiveMessages(activeConversation.id);
    }, 0);

    pollIntervalRef.current = setInterval(() => {
      fetchActiveMessages(activeConversation.id, true);
    }, 4005);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setMessages([]);
    };
  }, [activeConversation]);

  // AJOUT : Vérification de la commande pour le vendeur afin d'afficher l'étiquette
  useEffect(() => {
    const isProductSold = messages.some(
      (msg) => msg.content && (msg.content.includes("L'article a été acheté") || msg.content.includes("L'article a été payé avec succès")),
    );
    if (activeConversation && isProductSold && currentUser) {
      const fetchOrder = async () => {
        try {
          const res = await securedFetch(`${API_URL}/orders/for-conversation/${activeConversation.id}`);
          if (!res.ok) return;
          const orderData = await res.json();
          if (orderData && orderData.id) {
            setCurrentOrder(orderData);
          } else {
            setCurrentOrder(null);
          }
        } catch (e) {
          console.error("Erreur récupération commande", e);
        }
      };
      fetchOrder();
    } else {
      // Use a timeout or move to a separate effect if needed, but for now we safely clear it
      setCurrentOrder(null);
    }
  }, [messages, activeConversation, currentUser]);

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

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    let imageIri = null;
    if (selectedImage) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("photo", selectedImage);
      try {
        const uploadRes = await fetch(`${API_URL}/message-images`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.error("Erreur backend upload image:", errData);
          throw new Error(errData.message || "Erreur upload");
        }
        const uploadData = await uploadRes.json();
        imageIri = uploadData["@id"];
      } catch (err) {
        alert("Erreur lors de l'envoi de l'image : " + err.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      const payload = {
        content: newMessage || "📸 Photo",
        isRead: false,
        createdAt: new Date().toISOString(),
        users: `/api/users/${currentUser.id}`,
        conversation: `/api/conversations/${activeConversation.id}`,
      };

      if (imageIri) {
        payload.images = [imageIri];
      }

      const res = await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");

      const createdMsg = await res.json();
      setMessages((prev) => [...prev, createdMsg]);
      setNewMessage("");
      setSelectedImage(null);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Erreur send message:", error);
    }
  };

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
      const prevOfferId =
        activeOfferToCounter.id ||
        activeOfferToCounter["@id"]?.split("/").pop();
      await securedFetch(`${API_URL}/offers/${prevOfferId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: "declined" }),
      });

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

  const handleUpdateOfferStatus = async (offerObj, newStatus) => {
    const offerId = offerObj.id || offerObj["@id"]?.split("/").pop();
    if (!offerId || !activeConversation || !currentUser) return;

    try {
      const res = await securedFetch(`${API_URL}/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();

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

  const fetchAddressSuggestions = async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setAddressSuggestions(data.features || []);
        setShowAddressSuggestions(true);
      }
    } catch (err) {
      console.error("Erreur API Adresse:", err);
    }
  };

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

      const res = await securedFetch(
        `${API_URL}/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: activeConversation.product?.title || "Article 2Round",
            amount: amountInCents,
            conversationId: activeConversation.id,
            productId:
              activeConversation.product?.id ||
              activeConversation.product?.split("/").pop(),
            buyerId: currentUser.id,
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur Stripe");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la redirection vers le paiement: " + err.message);
    } finally {
      setStripeLoading(false);
    }
  };

  const openReportModal = (type, target) => {
    setReportTarget({ type, target });
    setReportReason("");
    setReportDescription("");
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      alert("Veuillez sélectionner une raison.");
      return;
    }
    try {
      const payload = {
        reason: reportReason,
        description: reportDescription,
        createdAt: new Date().toISOString(),
        sender: `/api/users/${currentUser.id}`,
      };

      if (reportTarget.type === "conversation") {
        payload.conversation = `/api/conversations/${reportTarget.target.id}`;
      } else if (reportTarget.type === "message") {
        payload.message = `/api/messages/${reportTarget.target.id}`;
      }

      const res = await securedFetch(`${API_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur de signalement");
      alert("Signalement envoyé avec succès. Notre équipe va l'examiner.");
      setReportModalOpen(false);
    } catch (err) {
      alert("Erreur lors de l'envoi du signalement.");
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation) return;
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette conversation ? Elle disparaîtra de votre liste.",
      )
    )
      return;

    try {
      const res = await securedFetch(
        `${API_URL}/conversations/${activeConversation.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
          },
          body: JSON.stringify({ isActive: false }),
        },
      );

      if (!res.ok)
        throw new Error("Erreur lors de la suppression de la conversation");

      setConversations((prev) =>
        prev.filter((c) => c.id !== activeConversation.id),
      );
      setActiveConversation(null);
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleCancelOffer = async () => {
    if (!acceptedOffer) return;
    if (!window.confirm("Voulez-vous vraiment annuler cette offre acceptée ?"))
      return;

    try {
      const res = await securedFetch(`${API_URL}/offers/${acceptedOffer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Erreur annulation");

      await securedFetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({
          content: "L'acheteur a annulé l'offre acceptée.",
          isRead: false,
          createdAt: new Date().toISOString(),
          users: `/api/users/${currentUser.id}`,
          conversation: `/api/conversations/${activeConversation.id}`,
        }),
      });

      fetchActiveMessages(activeConversation.id, true);
    } catch (e) {
      alert("Erreur lors de l'annulation.");
    }
  };

  const handleValidateReception = async () => {
    if (!currentOrder || !activeConversation) return;
    if (!window.confirm("Êtes-vous sûr d'avoir bien reçu l'article ? Cela débloquera l'argent pour le vendeur.")) return;
    
    try {
      const res = await securedFetch(`${API_URL}/orders/validate-reception`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          conversationId: activeConversation.id
        })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || "Erreur de validation");
      }
      
      alert("Réception validée. Le vendeur a été payé.");
      setCurrentOrder(prev => ({...prev, status: "completed"}));
      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
  };

  const handleValidateShipping = async () => {
    if (!currentOrder || !activeConversation) return;
    if (!window.confirm("Avez-vous bien déposé le colis au point relais ?")) return;
    
    try {
      const res = await securedFetch(`${API_URL}/orders/validate-shipping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          conversationId: activeConversation.id
        })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || "Erreur de validation");
      }
      
      alert("Envoi validé. L'acheteur sera notifié.");
      setCurrentOrder(prev => ({...prev, status: "shipped"}));
      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
  };

  const handleDispute = async () => {
    if (!currentOrder || !activeConversation) return;
    if (!window.confirm("Êtes-vous sûr de vouloir signaler un problème ? Les fonds seront bloqués jusqu'à résolution.")) return;
    
    try {
      const res = await securedFetch(`${API_URL}/orders/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          conversationId: activeConversation.id
        })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || "Erreur de déclaration de litige");
      }
      
      alert("Litige déclaré. Veuillez en discuter à l'amiable dans ce chat.");
      setCurrentOrder(prev => ({...prev, status: "disputed"}));
      fetchActiveMessages(activeConversation.id, true);
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
    }
  };

  useEffect(() => {
    if (!paymentSuccessParam || !currentUser || !paymentConvId) return;
    const handlePaymentReturn = async () => {
      const convs = await fetchConversationsList(currentUser);
      const conv = convs.find((c) => c.id === Number(paymentConvId));
      if (conv) {
        setActiveConversation(conv);
        const paidAmount = paymentAmountParam
          ? (Number(paymentAmountParam) / 100).toFixed(2)
          : "0.00";

        // Appeler le nouveau endpoint backend pour finaliser la commande
        await securedFetch(`${API_URL}/orders/payment-success`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: Number(paymentConvId),
            amount: Number(paymentAmountParam),
          }),
        });

        setTransactionRef(
          "#TRX-" + Math.floor(100000 + Math.random() * 900000),
        );
        setCheckoutAmount(Number(paidAmount));
        setCheckoutStep("success");
        setShowCheckoutModal(true);
        fetchActiveMessages(Number(paymentConvId), true);
      }
      setSearchParams({});
    };
    handlePaymentReturn();
  }, [
    paymentSuccessParam,
    currentUser,
    paymentConvId,
    paymentAmountParam,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!paymentCancelledParam) return;
    alert("Le paiement a été annulé.");
    setSearchParams({});
  }, [paymentCancelledParam, setSearchParams]);

  const getParticipant = (conv) => {
    if (!conv || !currentUser) return {};
    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "object")
        return val.id || (val["@id"] ? val["@id"].split("/").pop() : null);
      if (typeof val === "string") return val.split("/").pop();
      return val;
    };
    const buyerId = extractId(conv.buyer);
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

  const extractId = (val) => {
    if (!val) return null;
    if (typeof val === "object")
      return val.id || (val["@id"] ? val["@id"].split("/").pop() : null);
    if (typeof val === "string") return val.split("/").pop();
    return val;
  };
  const activeBuyerId = extractId(activeConversation?.buyer);
  const isBuyer =
    activeConversation &&
    currentUser &&
    Number(activeBuyerId) === currentUser.id;

  const isProductSold = messages.some(
    (msg) => msg.content && (msg.content.includes("L'article a été acheté") || msg.content.includes("L'article a été payé avec succès")),
  );

  const acceptedOfferMessage = [...messages]
    .reverse()
    .find((m) => m.offer && m.offer.status === "accepted");
  const acceptedOffer = acceptedOfferMessage
    ? acceptedOfferMessage.offer
    : null;

  const productPrice = parseFloat(activeConversation?.product?.price || 0);
  const activePrice = acceptedOffer
    ? parseFloat(acceptedOffer.amount)
    : productPrice;

  const getDiscountSuggestions = (price) => [
    { pct: "10%", val: Math.round(price * 0.9) },
    { pct: "15%", val: Math.round(price * 0.85) },
    { pct: "20%", val: Math.round(price * 0.8) },
  ];

  return (
    <div className="h-screen bg-black text-white font-inter flex flex-col pt-[62px] lg:pt-[80px]">
      {/* Container avec le fond rayé pour l'entête */}
      <div 
        className="w-full bg-cover bg-center border-b border-white/10 shrink-0" 
        style={{ backgroundImage: `url(${IMG_BGRAYURE})` }}
      >
        <div className="max-w-[1200px] mx-auto p-5 md:p-10 flex items-center">
          <Link to="/" className="text-white text-2xl md:text-4xl font-bebas mr-4 hover:text-red-600 transition-colors">
            <FaChevronLeft /> 
          </Link>
          <h2 className="font-bebas text-3xl md:text-4xl uppercase tracking-wider drop-shadow-md m-0">
            Messagerie
          </h2>
        </div>
      </div>

      {/* Reste du contenu (Chat Area) */}
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 pb-6 pt-4 flex-1 flex flex-col min-h-0">

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-500 p-4 mb-4 rounded-sm text-sm shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 flex border border-white/10 bg-[#070707] overflow-hidden rounded-sm relative">
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
                [...conversations]
                  .filter((c) => c.isActive !== false)
                  .sort((a, b) => {
                    const aHasUnread = a.messages?.some(
                      (m) =>
                        !m.isRead &&
                        Number(extractId(m.users)) !== currentUser.id,
                    );
                    const bHasUnread = b.messages?.some(
                      (m) =>
                        !m.isRead &&
                        Number(extractId(m.users)) !== currentUser.id,
                    );

                    if (aHasUnread && !bHasUnread) return -1;
                    if (!aHasUnread && bHasUnread) return 1;

                    const aLastMsgTime =
                      a.messages?.length > 0
                        ? new Date(
                            a.messages[a.messages.length - 1].createdAt,
                          ).getTime()
                        : new Date(a.createdAt || 0).getTime();
                    const bLastMsgTime =
                      b.messages?.length > 0
                        ? new Date(
                            b.messages[b.messages.length - 1].createdAt,
                          ).getTime()
                        : new Date(b.createdAt || 0).getTime();

                    return bLastMsgTime - aLastMsgTime;
                  })
                  .map((conv) => {
                    const otherUser = getParticipant(conv) || {};
                    const product = conv.product || {};
                    const img = getProductImage(product);
                    const isSelected = activeConversation?.id === conv.id;
                    const hasUnread = conv.messages?.some(
                      (m) =>
                        !m.isRead &&
                        Number(extractId(m.users)) !== currentUser.id,
                    );

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`p-4 flex gap-4 items-center cursor-pointer transition-all hover:bg-white/5 ${isSelected ? "bg-red-950/20 border-l-4 border-red-600" : ""}`}
                      >
                        <div className="relative w-12 h-12 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`font-bold text-sm truncate uppercase tracking-wide ${hasUnread ? "text-white" : ""}`}
                            >
                              {otherUser.pseudo || "Utilisateur"}
                            </h4>
                            {hasUnread && (
                              <div
                                className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse"
                                title="Nouveau message"
                              />
                            )}
                          </div>
                          <p
                            className={`text-xs mt-1 truncate ${hasUnread ? "text-gray-200 font-semibold" : "text-gray-400"}`}
                          >
                            {product.title || "Article"}
                          </p>
                          <span className="text-[10px] text-gray-500 mt-0.5 block">
                            Prix: {product.price}€
                          </span>
                        </div>

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

          <div
            className={`flex-1 flex flex-col min-w-0 ${!activeConversation ? "hidden md:flex justify-center items-center p-8 text-center" : "flex"}`}
          >
            {activeConversation ? (
              <>
                <div className="p-4 border-b border-white/10 bg-neutral-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto min-w-0">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden text-white/80 hover:text-white shrink-0 text-xl"
                    >
                      <FaArrowLeft />
                    </button>

                    <div className="relative shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#151515] border border-white/10 overflow-hidden flex items-center justify-center">
                        {getParticipant(activeConversation)?.avatar ? (
                          <img
                            src={getParticipant(activeConversation).avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-gray-500 text-xl md:text-2xl" />
                        )}
                      </div>
                      {getProductImage(activeConversation.product) && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 border-2 border-black rounded-full overflow-hidden bg-[#111]">
                          <img
                            src={getProductImage(activeConversation.product)}
                            alt="product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-bebas text-xl md:text-2xl uppercase tracking-wide truncate">
                          {getParticipant(activeConversation)?.pseudo ||
                            "Utilisateur"}
                        </h3>
                        <span className="shrink-0 text-[9px] bg-white/10 text-gray-300 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider hidden sm:inline-block">
                          {isBuyer ? "Vendeur" : "Acheteur"}
                        </span>
                      </div>
                      <p className="text-[11px] md:text-xs text-gray-400 font-light mt-0.5 truncate flex items-center gap-1.5">
                        <span className="sm:hidden shrink-0 text-[9px] bg-white/10 text-gray-300 font-bold px-1 py-0.5 rounded-sm uppercase">
                          {isBuyer ? "Vendeur" : "Acheteur"}
                        </span>
                        <span className="truncate">
                          {activeConversation.product?.title}
                        </span>
                        <span className="shrink-0">
                          • {activeConversation.product?.size || "TU"}
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

                  <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center items-center justify-end shrink-0 ml-auto">
                    <button
                      onClick={handleDeleteConversation}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2"
                      title="Supprimer la conversation"
                    >
                      <FaXmark className="text-lg" />
                    </button>
                    <button
                      onClick={() =>
                        openReportModal("conversation", activeConversation)
                      }
                      className="text-gray-500 hover:text-red-500 transition-colors p-2 hidden sm:block"
                      title="Signaler la conversation"
                    >
                      <FaFlag />
                    </button>
                    <button
                      onClick={() =>
                        openReportModal("conversation", activeConversation)
                      }
                      className="text-gray-500 hover:text-red-500 transition-colors p-2 sm:hidden ml-auto"
                      title="Signaler"
                    >
                      <FaFlag className="text-sm" />
                    </button>

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
                        {acceptedOffer ? (
                          <button
                            onClick={handleCancelOffer}
                            className="flex-1 sm:flex-initial bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold py-2.5 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer text-center border border-red-500/20"
                          >
                            Annuler l'offre
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setOfferError("");
                              setShowOfferModal(true);
                            }}
                            className="flex-1 sm:flex-initial bg-transparent hover:bg-white/5 border border-white/30 text-white font-bold py-2.5 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer text-center"
                          >
                            Négocier
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="bg-red-950/20 text-red-400 text-xs font-bold px-4 py-2.5 rounded-sm uppercase tracking-widest border border-red-500/20">
                        Disponible
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-transparent to-black/10">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const senderId = extractId(msg.users);
                      const isMe = Number(senderId) === currentUser.id;

                      if (msg.offer) {
                        const offerObj = msg.offer;
                        const isOfferSender = isMe;
                        const isOfferPending = offerObj.status === "pending";
                        const isOfferFromBuyer =
                          Number(senderId) === Number(activeBuyerId);

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

                              <div className="mt-5">
                                {isOfferPending ? (
                                  !isOfferSender ? (
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
                                    <div className="flex items-center gap-2 text-xs text-gray-400 py-1.5">
                                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                                      <span>
                                        En attente de réponse de l'autre membre
                                      </span>
                                    </div>
                                  )
                                ) : offerObj.status === "accepted" ? (
                                  isBuyer ? (
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

                      const isPurchaseMessage =
                        msg.content &&
                        msg.content.includes(
                          "L'article a été payé avec succès",
                        );
                      const isShippingLabel =
                        msg.content &&
                        msg.content.startsWith("[SHIPPING_LABEL]");

                      if (isShippingLabel) {
                        if (isBuyer) return null; // L'acheteur ne voit pas le bon d'envoi du vendeur
                        if (currentOrder && currentOrder.status !== "paid") return null; // Le vendeur ne peut plus voir l'étiquette une fois expédié
                        const labelUrl = msg.content.replace(
                          "[SHIPPING_LABEL] ",
                          "",
                        );
                        return (
                          <div
                            key={msg.id}
                            className="w-full flex justify-center my-4"
                          >
                            <div className="w-full max-w-[420px] bg-blue-950/20 border border-blue-500/30 rounded-md p-6 text-center space-y-4 shadow-xl">
                              <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto text-xl">
                                <FaTruck />
                              </div>
                              <h4 className="font-bebas text-2xl uppercase tracking-wider text-blue-100">
                                Bon de livraison généré
                              </h4>
                              <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                                L'article a été payé. Voici votre bordereau
                                d'envoi Mondial Relay à imprimer et coller sur
                                le colis.
                              </p>
                              <a
                                href={labelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-sm uppercase tracking-wider transition-colors mt-2"
                              >
                                Télécharger le bordereau
                              </a>
                            </div>
                          </div>
                        );
                      }

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
                                Statut : {
                                  currentOrder?.status === "completed" ? "Livré" :
                                  currentOrder?.status === "shipped" ? "En transit" :
                                  currentOrder?.status === "disputed" ? "En litige" :
                                  "En attente d'expédition"
                                }
                              </div>

                              {/* AJOUT : Affichage du bordereau Mondial Relay EXCLUSIF au vendeur */}
                              {!isBuyer && currentOrder?.shippingLabelUrl && currentOrder?.status === "paid" && (
                                <div className="mt-6 pt-5 border-t border-emerald-500/30">
                                  <div className="bg-emerald-900/40 border border-emerald-500/50 p-4 rounded-md">
                                    <h5 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                                      <FaTruck className="inline mr-2" />
                                      Bordereau d'expédition
                                    </h5>
                                    <a
                                      href={currentOrder.shippingLabelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                      Imprimer l'étiquette
                                    </a>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                      N° Suivi : {currentOrder.trackingNumber}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* BOUTON D'EXPÉDITION POUR LE VENDEUR */}
                              {!isBuyer && currentOrder?.status === "paid" && (
                                <div className="mt-6 pt-5 border-t border-emerald-500/30">
                                  <button
                                    onClick={handleValidateShipping}
                                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors"
                                  >
                                    <FaTruck className="inline mr-2" /> Colis déposé au relais
                                  </button>
                                  <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                    Confirmez l'envoi une fois le colis déposé.
                                  </p>
                                </div>
                              )}

                              {/* TEXTE D'ATTENTE POUR L'ACHETEUR */}
                              {isBuyer && currentOrder?.status === "paid" && (
                                <div className="mt-6 pt-5 border-t border-emerald-500/30 text-center">
                                  <p className="text-xs text-gray-400">En attente de l'expédition par le vendeur...</p>
                                </div>
                              )}
                              
                              {/* BOUTON VALIDATION POUR L'ACHETEUR (UNIQUEMENT SI EXPÉDIÉ) */}
                              {isBuyer && currentOrder?.status === "shipped" && (
                                <div className="mt-6 pt-5 border-t border-emerald-500/30 flex flex-col gap-3">
                                  <button
                                    onClick={handleValidateReception}
                                    className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors"
                                  >
                                    <FaCheck className="inline mr-2" /> Valider la réception
                                  </button>
                                  
                                  <button
                                    onClick={handleDispute}
                                    className="flex items-center justify-center w-full bg-transparent border border-red-600/50 hover:bg-red-900/30 text-red-400 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
                                  >
                                    Signaler un problème
                                  </button>
                                  <p className="text-[10px] text-gray-400 mt-1 font-mono text-center">
                                    En cas de non-réception, déclarez un litige.
                                  </p>
                                </div>
                              )}

                              {/* ETAT LITIGE */}
                              {currentOrder?.status === "disputed" && (
                                <div className="mt-6 pt-5 border-t border-red-500/30 text-center">
                                  <div className="bg-red-900/20 border border-red-500 p-3 rounded-md">
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                                      ⚠️ Litige en cours
                                    </p>
                                    <p className="text-[10px] text-gray-300">
                                      Les fonds sont bloqués. Tentez de trouver une solution à l'amiable ci-dessous.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      const otherUser = getParticipant(activeConversation);

                      return (
                        <div
                          key={msg.id}
                          className={`group flex w-full ${isMe ? "justify-end" : "justify-start"} mb-4`}
                        >
                          {!isMe && (
                            <div className="w-8 h-8 rounded-full bg-[#151515] border border-white/10 overflow-hidden shrink-0 mr-3 mt-auto mb-5">
                              {otherUser?.avatar ? (
                                <img
                                  src={otherUser.avatar}
                                  alt="avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                                  <FaUser />
                                </div>
                              )}
                            </div>
                          )}
                          <div
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] relative`}
                          >
                            <div
                              className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                            >
                              <div
                                className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-md whitespace-pre-wrap ${isMe ? "bg-red-600 text-white rounded-br-none" : "bg-neutral-800 border border-white/5 text-gray-200 rounded-bl-none"}`}
                              >
                                {msg.images &&
                                  msg.images.length > 0 &&
                                  msg.images.map((imgObj, i) => {
                                    const imgPath =
                                      typeof imgObj === "string"
                                        ? imgObj
                                        : imgObj.path;
                                    const url = imgPath.startsWith("http")
                                      ? imgPath
                                      : `${API_URL.replace("/api", "")}${imgPath}`;
                                    return (
                                      <div
                                        key={i}
                                        className="mb-2 rounded overflow-hidden"
                                      >
                                        <img
                                          src={url}
                                          alt="photo"
                                          className="max-w-[200px] md:max-w-[250px] object-cover"
                                        />
                                      </div>
                                    );
                                  })}
                                {(msg.content !== "📸 Photo" ||
                                  !msg.images ||
                                  msg.images.length === 0) &&
                                  msg.content}
                              </div>
                              {!isMe && (
                                <button
                                  onClick={() =>
                                    openReportModal("message", msg)
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-500 p-1"
                                  title="Signaler ce message"
                                >
                                  <FaFlag className="text-[10px]" />
                                </button>
                              )}
                            </div>
                            <span className="text-[9px] text-gray-500 mt-1.5 uppercase tracking-wider px-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
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

                <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col gap-3 shrink-0">
                  {selectedImage && (
                    <div className="flex items-center gap-4 bg-[#151515] p-3 rounded border border-white/10">
                      <div className="relative w-16 h-16 rounded overflow-hidden border border-white/10">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-0 right-0 bg-red-600/90 text-white p-1 hover:bg-red-500 rounded-bl-sm z-10"
                        >
                          <FaXmark className="text-xs" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 font-mono truncate">
                        {selectedImage.name}
                      </span>
                    </div>
                  )}
                  <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2 items-end"
                  >
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

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files[0])
                          setSelectedImage(e.target.files[0]);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-gray-400 hover:text-white w-12 h-12 flex items-center justify-center rounded-sm transition-all cursor-pointer shrink-0"
                      title="Envoyer une photo"
                    >
                      <FaImage className="text-lg" />
                    </button>

                    <textarea
                      placeholder="Saisissez votre message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyDown={(e) => {
                        const isMobile =
                          "ontouchstart" in window ||
                          window.matchMedia("(pointer: coarse)").matches;
                        if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                          e.preventDefault();
                          if (newMessage.trim() || selectedImage)
                            handleSendMessage(e);
                        }
                      }}
                      rows={1}
                      className="flex-1 bg-black border border-white/10 focus:border-red-600 outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-gray-600 transition-colors resize-none overflow-y-auto"
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />
                    <button
                      type="submit"
                      disabled={
                        (!newMessage.trim() && !selectedImage) || isUploading
                      }
                      className={`bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white w-12 h-12 flex items-center justify-center rounded-sm transition-all cursor-pointer shrink-0 ${isUploading ? "animate-pulse" : ""}`}
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
                    placeholder={`Min. ${(productPrice * 0.6).toFixed(0)}€`}
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
                        Frais de protection acheteur{" "}
                        <FaShieldHalved className="text-[10px] text-emerald-500" />
                      </span>
                      <span className="text-white">
                        {(0.7 + checkoutAmount * 0.05).toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        Frais de port (Mondial Relay){" "}
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

                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      1. Adresse de l'acheteur
                    </span>
                    {currentUser?.adresses && currentUser.adresses.length > 0 && (
                      <div className="mb-3">
                        <select
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-3 text-xs text-white"
                          onChange={(e) => {
                            if (e.target.value === "new") {
                              setShippingAddress({ name: "", street: "", city: "", zip: "", country: "France" });
                            } else {
                              const addr = currentUser.adresses.find(a => a.id.toString() === e.target.value);
                              if (addr) {
                                setShippingAddress({
                                  name: `${currentUser.firstname || ""} ${currentUser.lastname || ""}`.trim(),
                                  street: addr.street_number ? `${addr.street_number} ${addr.street_name}` : addr.street_name,
                                  city: addr.city,
                                  zip: addr.postal_code,
                                  country: addr.country || "France"
                                });
                              }
                            }
                          }}
                        >
                          <option value="new">-- Ajouter une nouvelle adresse --</option>
                          {currentUser.adresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label || "Mon adresse"} : {addr.street_number} {addr.street_name}, {addr.postal_code} {addr.city}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rue (Tapez pour rechercher)"
                          required
                          value={shippingAddress.street}
                          onChange={(e) => {
                            setShippingAddress({
                              ...shippingAddress,
                              street: e.target.value,
                            });
                            fetchAddressSuggestions(e.target.value);
                          }}
                          className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-2.5 text-xs text-white"
                        />
                        {showAddressSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {addressSuggestions.map((suggestion) => (
                              <div
                                key={suggestion.properties.id}
                                className="px-3 py-2 text-xs text-gray-300 hover:bg-white/10 cursor-pointer"
                                onClick={() => {
                                  setShippingAddress({
                                    ...shippingAddress,
                                    street: suggestion.properties.name,
                                    city: suggestion.properties.city,
                                    zip: suggestion.properties.postcode,
                                  });
                                  setShowAddressSuggestions(false);
                                }}
                              >
                                {suggestion.properties.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      2. Point Relais le plus proche
                    </span>
                    <select
                      value={selectedRelay}
                      onChange={(e) => setSelectedRelay(e.target.value)}
                      className="w-full bg-black border border-white/10 focus:border-red-600 outline-none rounded-md p-3 text-xs text-white"
                    >
                      <option value="Mondial Relay - Epicerie du Rond-Point">
                        Mondial Relay - Epicerie du Rond-Point {shippingAddress.city ? `(${shippingAddress.city})` : "(Saisissez votre ville)"}
                      </option>
                      <option value="Relais Colis - Tabac de la Place">
                        Relais Colis - Tabac de la Place {shippingAddress.city ? `(${shippingAddress.city})` : "(Saisissez votre ville)"}
                      </option>
                      <option value="Mondial Relay - Supermarché U">
                        Mondial Relay - Supermarché U {shippingAddress.city ? `(${shippingAddress.city})` : "(Saisissez votre ville)"}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      3. Paiement Sécurisé
                    </span>
                    <div className="bg-neutral-900/60 border border-white/5 rounded-md p-4 flex items-center gap-3">
                      <FaShieldHalved className="text-emerald-500 text-xl shrink-0" />
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Vous allez être redirigé vers{" "}
                        <span className="text-white font-bold">Stripe</span>{" "}
                        pour effectuer votre paiement de manière sécurisée. Vos
                        données bancaires ne transitent jamais par nos serveurs.
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
                        <FaCircleNotch className="animate-spin" /> Redirection
                        vers Stripe...
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
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-sm max-w-md w-full relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaXmark className="text-xl" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/20">
                <FaFlag className="text-red-500 text-lg" />
              </div>
              <h2 className="text-2xl font-bebas uppercase tracking-wider">
                Signaler
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Raison du signalement
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-colors"
                >
                  <option value="">-- Sélectionnez une raison --</option>
                  <option value="spam">Spam ou publicité</option>
                  <option value="scam">Arnaque suspectée</option>
                  <option value="abuse">Harcèlement ou propos injurieux</option>
                  <option value="fake">Contrefaçon ou objet interdit</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Détails (facultatif)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Donnez plus de détails pour aider notre modération..."
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:border-red-600 outline-none transition-colors resize-none h-24"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={submitReport}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-sm uppercase tracking-widest text-sm transition-colors"
                >
                  Envoyer le signalement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversation;
