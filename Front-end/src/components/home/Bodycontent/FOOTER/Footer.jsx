import React, { useEffect, useRef, useState } from "react";
import "./Footer.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RoomIcon from "@mui/icons-material/Room";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const branches = [
    "Tasty Kitchen, Kakinada, Andhra Pradesh",
    "Tasty Kitchen, Rajahmundry, Andhra Pradesh",
    "Tasty Kitchen, Vizag, Andhra Pradesh",
  ];
  const [openMap, setOpenMap] = useState(false);
  const [branchIndex, setBranchIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const markerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  const apiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;

  const loadGoogleScript = () =>
    new Promise((resolve, reject) => {
      if (scriptLoadedRef.current || window.google?.maps) {
        scriptLoadedRef.current = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        apiKey || ""
      }&v=quarterly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const ensureMap = async () => {
    await loadGoogleScript().catch(() => {});
    if (!window.google?.maps) return;
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 17.0, lng: 82.0 },
        zoom: 5,
        mapId: undefined,
        gestureHandling: "greedy",
      });
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  };

  const flyTo = async (addressOrLatLng, zoom = 16) => {
    await ensureMap();
    if (!window.google?.maps || !mapRef.current) return;
    let targetLatLng = addressOrLatLng;
    if (typeof addressOrLatLng === "string") {
      try {
        const result = await geocoderRef.current.geocode({
          address: addressOrLatLng,
        });
        if (result?.results?.[0]) {
          targetLatLng = result.results[0].geometry.location;
        }
      } catch {}
    }
    const map = mapRef.current;
    if (!targetLatLng) return;
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map,
        position: targetLatLng,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      markerRef.current.setPosition(targetLatLng);
    }
    const startZoom = map.getZoom();
    const endZoom = zoom;
    map.panTo(targetLatLng);
    const steps = Math.max(Math.abs(endZoom - startZoom) * 2, 8);
    const delta = (endZoom - startZoom) / steps;
    let i = 0;
    const animateZoom = () => {
      i += 1;
      map.setZoom(Math.round((startZoom + delta * i) * 10) / 10);
      if (i < steps) requestAnimationFrame(animateZoom);
    };
    requestAnimationFrame(animateZoom);
  };

  const handleOpenMap = () => setOpenMap(true);
  const handleCloseMap = () => setOpenMap(false);
  const nextBranch = async () => {
    const idx = (branchIndex + 1) % branches.length;
    setBranchIndex(idx);
    await flyTo(branches[idx]);
  };
  const prevBranch = async () => {
    const idx = (branchIndex - 1 + branches.length) % branches.length;
    setBranchIndex(idx);
    await flyTo(branches[idx]);
  };

  // newsletter subscribe handler
  const handleSubscribe = async () => {
    if (!newsletterEmail) return setNewsletterStatus("Please enter an email");
    try {
      const API_URL = (
        import.meta.env.VITE_API_URL || "http://localhost:1111"
      ).replace(/\/$/, "");
      const csrfRes = await fetch(`${API_URL}/api/csrf`, {
        credentials: "include",
      });
      const { csrfToken } = (await csrfRes.json()) || {};
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (res.ok) {
        setNewsletterStatus("Subscribed successfully!");
        setNewsletterEmail("");
      } else {
        const data = await res.json();
        setNewsletterStatus(data.message || "Subscription failed");
      }
    } catch (err) {
      setNewsletterStatus("Subscription error");
      console.error(err);
    }
  };

  useEffect(() => {
    if (openMap) {
      ensureMap().then(() => flyTo(branches[branchIndex]));
    }
  }, [openMap]);

  return (
    <footer className="footer-container">
      {/* Top Section: Contact Info */}
      <div className="footer-top">
        <div className="footer-top-item">
          <div className="footer-top-icon">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </div>
          <div className="footer-top-text">
            <h4 className="find-us-link" onClick={handleOpenMap}>
              Find us
            </h4>
            <p>7-7-9, Kakinada, AP, India</p>
          </div>
        </div>
        <div className="footer-top-item">
          <div className="footer-top-icon">
            <FontAwesomeIcon icon={faPhoneAlt} />
          </div>
          <div className="footer-top-text">
            <h4>Call us</h4>
            <p>+91 949xxxx56</p>
          </div>
        </div>
        <div className="footer-top-item">
          <div className="footer-top-icon">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div className="footer-top-text">
            <h4>Mail us</h4>
            <p>contact@tastykitchen.com</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="footer-main">
        {/* Column 1: About */}
        <div className="footer-col footer-about">
          <div className="footer-about-logo">
            <img src="/footer-images/logo.png" alt="Tasty Kitchen Logo" />
            <span>Tasty Kitchen</span>
          </div>
          <p>
            Discover the best food & drinks in your city. We bring fresh,
            healthy, and delicious meals right to your doorstep. Our mission is
            to provide high-quality food from the best local restaurants.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#freshfood">Fresh Food</a>
            </li>
            <li>
              <a href="#bakery">Bakery & Snacks</a>
            </li>
            <li>
              <a href="#drinks">Beverages</a>
            </li>
            <li>
              <a href="#shop">Our Shop</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div className="footer-col">
          <h3>Our Services</h3>
          <ul className="footer-links">
            <li>
              <a href="#delivery">Fast Delivery</a>
            </li>
            <li>
              <a href="#quality">Quality Checks</a>
            </li>
            <li>
              <a href="#track">Track Order</a>
            </li>
            <li>
              <a href="#partners">Partner With Us</a>
            </li>
            <li>
              <a href="#help">Help Center</a>
            </li>
          </ul>
        </div>

        {/* Column 4: Connect & Subscribe */}
        <div className="footer-col footer-social-connect">
          <h3>Follow Us</h3>
          <div className="footer-social-icons">
            <a href="#">
              <img src="/social-media-png/facebook.png" alt="Facebook" />
            </a>
            <a href="#">
              <img src="/social-media-png/instagram.png" alt="Instagram" />
            </a>
            <a href="#">
              <img src="/social-media-png/twitter.png" alt="Twitter" />
            </a>
            <a href="#">
              <img src="/social-media-png/linkedin.png" alt="LinkedIn" />
            </a>
            <a href="#">
              <img src="/social-media-png/whatsapp.png" alt="WhatsApp" />
            </a>
          </div>

          <div className="footer-subscribe">
            <h4>Newsletter</h4>
            <div className="subscribe-form">
              <input
                type="email"
                placeholder="Your Email Address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="button" onClick={handleSubscribe}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
            {newsletterStatus && (
              <p className="newsletter-status">{newsletterStatus}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>&copy; 2026 Tasty Kitchen. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Policy</a>
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={openMap} onClose={handleCloseMap} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RoomIcon color="warning" />
            Tasty Kitchen Branches
          </span>
          <IconButton onClick={handleCloseMap}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div className="map-controls">
            <Button onClick={prevBranch} size="small" variant="outlined">
              Prev
            </Button>
            <span className="map-branch-name">{branches[branchIndex]}</span>
            <Button onClick={nextBranch} size="small" variant="outlined">
              Next
            </Button>
          </div>
          {apiKey ? (
            <div className="map-canvas" ref={mapContainerRef} />
          ) : (
            <div className="map-iframe-wrapper">
              <iframe
                key={branchIndex}
                title="Tasty Kitchen Map"
                className="map-iframe"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  branches[branchIndex],
                )}&output=embed`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          )}
          <div className="map-search">
            <TextField
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search address"
              size="small"
              fullWidth
            />
            <Button
              onClick={() => flyTo(searchText)}
              variant="contained"
              sx={{ mt: 1, background: "var(--primary-gradient)" }}
            >
              Fly To
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
