EXONOL PHARMACEUTICALS — WEBSITE (v4, Oct 2026)
===============================================
Open index.html in a browser to preview.

Pages
  index.html                       Home (hero, Who we are, Divisions, Philosophy, Globe, FAQ, Contact form)
  company.html                     Company: The Beginning, About (mission, vision, future plan, values),
                                   Quality (manufacturers, licences), Our Business (UP, stockists, brands),
                                   Download Company Profile
  about.html                       Redirects to company.html (keeps old links working)
  medicines.html                   All medicines
  divisions.html                   Anti-allergic, Antifungal, Antibiotic — each opens its medicine page
  exozine-5mg-tablets.html         EXOZINE 5mg Tablets
  exzole-sb-130mg-capsules.html    EXZOLE-SB 130mg Capsules
  edox-lb-capsules.html            EDOX-LB Capsules
  international.html               Events (CPHI, iPHEX), LinkedIn, Partner Up form + WhatsApp
  careers.html                     Life at Exonol, Send CV
  contact.html                     Contact form, WhatsApp, offices, stockists, map

Where to edit things
  assets/js/layout.js     Header menu, mobile menu and footer for EVERY page, plus site settings at the top:
                          phone, email, careers email, WhatsApp link, LinkedIn/Facebook URLs, profile PDF path.
  assets/js/chatbot.js    The website assistant (bottom-right). Its answers are in the KB list.
  assets/js/globe.js      Home-page globe. The countries themselves are the list in index.html (data-country = ISO code).
  assets/css/style.css    Main styling (unchanged).
  assets/css/v4.css       Styling for the new parts (dropdown, divisions, globe, company, international, careers, assistant).
  assets/js/main.js       Animations, forms, FAQ.
  assets/js/banners.js    Animated banners: Company (packing line + truck) and International (world map).
                          The map countries match the home-page globe list.
  assets/img/logo*.svg    Official logo, converted from the brand .ai file (logo / logo-white / logo-reverse, mark).

Files still to add
  assets/img/events/cphi-1..3.jpg (iPHEX photos added)      (optional: assets/img/linkedin-banner.jpg)
  assets/img/careers/life-1..5.jpg

Before going live
  1. Forms open the visitor's email app addressed to contact@exonolpharma.com. Connect a form service or
     backend to store enquiries and accept CV uploads directly.
  2. Add a real Facebook URL in assets/js/layout.js (LinkedIn is set), plus Terms and Privacy pages.
  3. The home-page globe loads d3 and the world map from cdn.jsdelivr.net.
